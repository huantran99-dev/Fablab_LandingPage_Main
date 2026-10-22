/**
 * Đường ghi nội dung.
 *
 * Một nguyên tắc duy nhất, và nó loại được gần hết rủi ro lệch cấu trúc: **mọi
 * thao tác ghi đều tác động lên CẢ HAI ngôn ngữ trong CÙNG một giao dịch.**
 *
 * Nhờ đó "VI và EN khác thứ tự" hay "thêm mục vào VI mà quên EN" trở thành trạng
 * thái **không biểu diễn được**, thay vì một lỗi phải trông chờ bộ kiểm bắt được
 * sau khi đã ghi.
 *
 * Một lượt lưu gồm, theo đúng thứ tự và trong một giao dịch:
 *   kiểm rev -> chép lịch sử (kèm ảnh) -> ghi hai ngôn ngữ -> áp ảnh -> dọn ảnh của
 *   mục đã xoá -> ráp lại toàn bộ từ điển -> chạy bất biến -> lỗi thì rollback.
 *
 * Bất biến chạy SAU khi ghi, trên từ điển thật: nhiều luật cắt ngang section (xoá
 * khối "Cuộc thi" làm chết link menu `#competitions`), và chỉ bản đã ráp mới cho
 * thấy điều đó. better-sqlite3 đồng bộ nên `assemble()` trong giao dịch đọc được
 * chính những dòng vừa ghi.
 */
import { SECTION_IMAGES, SECTION_VIDEOS, assemble, mediaUrl } from './assemble.js'
import { invalidate } from './cache.js'
import { checkInvariants } from './invariants.js'
import { getLookups } from './lookups.js'
import { assertParity } from './parity.js'
import { getDb } from '../db/index.js'

export class WriteError extends Error {
  constructor(status, body) {
    super(body.error ?? 'loi ghi')
    this.status = status
    this.body = body
  }
}

/**
 * Các "khe" media của một section: ảnh (`images`) và, với Hoạt động, video nền
 * (`videos`). Mỗi khe là một scope trong bảng `binding`; lượt lưu gửi thay đổi của từng
 * khe trong trường cùng tên, lịch sử chụp lại mọi khe.
 */
function slotsOf(section) {
  const slots = []
  if (SECTION_IMAGES[section]) slots.push({ name: 'images', mime: 'image/', ...SECTION_IMAGES[section] })
  if (SECTION_VIDEOS[section]) slots.push({ name: 'videos', mime: 'video/', ...SECTION_VIDEOS[section] })
  return slots
}

/** Media hiện gắn vào một khe (chỉ những mục thuộc về section). */
function readSlotBindings(db, slot) {
  const rows = db
    .prepare('SELECT item_id, media_id, note FROM binding WHERE scope = ? ORDER BY item_id')
    .all(slot.scope)
  return slot.itemIds ? rows.filter((row) => slot.itemIds.includes(row.item_id)) : rows
}

/** Id các mục được phép mang media của khe này trong bản sắp ghi. */
function slotItemIds(slot, dict) {
  if (slot.itemIds) return new Set(slot.itemIds)
  return new Set((dict[slot.arrayKey] ?? []).map((item) => item.id))
}

/**
 * `bindings_json` của lịch sử. Section chỉ có ảnh giữ ĐÚNG định dạng cũ (mảng), để mọi
 * dòng lịch sử đã có vẫn là định dạng hiện hành; section nhiều khe ghi object theo tên
 * khe. Đọc: mảng = chỉ khe ảnh (dòng cũ của Hoạt động, trước khi có video).
 */
function snapshotBindings(db, slots) {
  if (slots.length === 0) return null
  if (slots.length === 1 && slots[0].name === 'images') return JSON.stringify(readSlotBindings(db, slots[0]))
  return JSON.stringify(Object.fromEntries(slots.map((slot) => [slot.name, readSlotBindings(db, slot)])))
}

function parseHistoryBindings(json) {
  const parsed = JSON.parse(json)
  return Array.isArray(parsed) ? { images: parsed } : parsed
}

export function readSectionPair(section) {
  const db = getDb()
  const rows = db.prepare('SELECT locale, json, rev FROM section WHERE key = ?').all(section)
  if (rows.length === 0) throw new WriteError(404, { error: 'khong co section nay', section })

  const out = { section, vi: null, en: null, rev: 0, images: null }
  for (const row of rows) {
    out[row.locale] = JSON.parse(row.json)
    out.rev += row.rev
  }

  for (const slot of slotsOf(section)) {
    const rows = db
      .prepare(
        `SELECT b.item_id, b.note, m.id, m.filename, m.width, m.height, m.duration
           FROM binding b JOIN media m ON m.id = b.media_id
          WHERE b.scope = ?`,
      )
      .all(slot.scope)
    out[slot.name] = {}
    for (const row of rows) {
      if (slot.itemIds && !slot.itemIds.includes(row.item_id)) continue
      out[slot.name][row.item_id] = {
        mediaId: row.id,
        url: mediaUrl(row.filename),
        width: row.width,
        height: row.height,
        ...(slot.name === 'videos' ? { duration: row.duration } : {}),
        note: row.note,
      }
    }
  }
  return out
}

/**
 * Ghi cả hai ngôn ngữ của một section.
 *
 * @param {object} args
 * @param {Record<string, number|null>} [args.images] thay ảnh từng mục; `null` = gỡ ảnh
 * @param {Record<string, number|null>} [args.videos] như trên, cho video nền
 * @param {{ images?: Array<{item_id, media_id, note}>, videos?: Array }} [args.bindings]
 *   THAY TOÀN BỘ media của những khe có mặt — chỉ dùng khi khôi phục lịch sử. Khe vắng
 *   (lịch sử có từ trước khi khe đó tồn tại) giữ nguyên.
 * @returns {{ rev: number, warnings: string[] }}
 *
 * `expectedRev` là chốt chặn ghi đè: hai tab cùng mở, tab cũ bấm lưu sau sẽ nhận
 * 409 thay vì lặng lẽ xoá mất việc của tab kia.
 */
export function writeSectionPair({ section, vi, en, expectedRev, note = null, images, videos, bindings }) {
  const db = getDb()

  const parity = assertParity({ [section]: vi }, { [section]: en })
  if (parity.missingInEn.length > 0 || parity.missingInVi.length > 0) {
    throw new WriteError(422, {
      error: 'hai ngon ngu khong cung cau truc',
      missingInEn: parity.missingInEn,
      missingInVi: parity.missingInVi,
    })
  }

  const slots = slotsOf(section)
  const changesBySlot = { images, videos }
  if (images && !SECTION_IMAGES[section]) throw new WriteError(400, { error: 'section nay khong co anh', section })
  if (videos && !SECTION_VIDEOS[section]) throw new WriteError(400, { error: 'section nay khong co video', section })
  if (bindings && slots.length === 0) throw new WriteError(400, { error: 'section nay khong co anh', section })

  const run = db.transaction(() => {
    const current = db.prepare('SELECT locale, json, rev FROM section WHERE key = ?').all(section)
    if (current.length === 0) throw new WriteError(404, { error: 'khong co section nay', section })

    const currentRev = current.reduce((sum, row) => sum + row.rev, 0)
    if (typeof expectedRev === 'number' && expectedRev !== currentRev) {
      throw new WriteError(409, {
        error: 'noi dung da bi nguoi khac sua',
        expectedRev,
        currentRev,
      })
    }

    // Mốc bất biến TRƯỚC khi ghi. Lượt lưu chỉ chịu trách nhiệm cho những gì NÓ gây
    // ra. Không có mốc thì hai chuyện hỏng: cảnh báo của section khác dội vào mọi
    // lượt lưu (thêm một khóa học chưa ảnh là trang Đối tác cũng báo), và tệ hơn,
    // một lỗi đã tồn tại sẵn — vd. ai đó xoá một icon khỏi mã nguồn — sẽ chặn lưu
    // MỌI section vô thời hạn, kể cả lượt lưu đang cố sửa chính lỗi đó.
    const baseline = checkInvariants(assemble(db), getLookups())

    const now = new Date().toISOString()
    const beforeJson = snapshotBindings(db, slots)
    // Media từng khe và id các mục TRƯỚC lượt lưu. Dọn media chỉ được đụng mục có ở đây
    // mà mất ở bản mới — tức mục người dùng vừa xoá.
    const viRow = current.find((row) => row.locale === 'vi')
    const previousDict = viRow ? JSON.parse(viRow.json) : null
    const before = new Map(slots.map((slot) => [slot.name, readSlotBindings(db, slot)]))

    for (const row of current) {
      // Chép bản cũ sang lịch sử TRƯỚC khi ghi đè, nên luôn quay lại được — cả ảnh.
      db.prepare(
        `INSERT INTO section_history (locale, key, json, rev, saved_at, note, bindings_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ).run(row.locale, section, row.json, row.rev, now, note, beforeJson)
    }

    for (const [locale, value] of Object.entries({ vi, en })) {
      db.prepare('UPDATE section SET json = ?, rev = rev + 1, updated_at = ? WHERE locale = ? AND key = ?').run(
        JSON.stringify(value),
        now,
        locale,
        section,
      )
    }

    const warnings = []

    const mediaRow = db.prepare('SELECT mime FROM media WHERE id = ?')
    // Giữ ghi chú nguồn (`~` ảnh gần đúng, `↺` ảnh dùng lại) khi media không đổi.
    // Thay media thì ghi chú cũ mô tả một quan hệ không còn tồn tại -> xoá.
    const upsert = db.prepare(
      `INSERT INTO binding (scope, item_id, media_id, note) VALUES (?, ?, ?, ?)
       ON CONFLICT (scope, item_id) DO UPDATE SET
         note = CASE WHEN binding.media_id = excluded.media_id THEN binding.note ELSE excluded.note END,
         media_id = excluded.media_id`,
    )
    const remove = db.prepare('DELETE FROM binding WHERE scope = ? AND item_id = ?')

    for (const slot of slots) {
      const allowed = slotItemIds(slot, vi)
      const previousIds = previousDict ? slotItemIds(slot, previousDict) : new Set()
      const what = slot.name === 'videos' ? 'video' : 'anh'

      const restored = bindings?.[slot.name]
      if (restored) {
        for (const row of before.get(slot.name)) {
          if (allowed.has(row.item_id) || previousIds.has(row.item_id)) remove.run(slot.scope, row.item_id)
        }
        for (const row of restored) {
          if (!allowed.has(row.item_id)) continue
          if (!mediaRow.get(row.media_id)) {
            warnings.push(`${what} #${row.media_id} cua '${row.item_id}' da bi xoa khoi thu vien — muc nay de trong ${what}`)
            continue
          }
          upsert.run(slot.scope, row.item_id, row.media_id, row.note ?? null)
        }
      }

      for (const [itemId, mediaId] of Object.entries(changesBySlot[slot.name] ?? {})) {
        if (!allowed.has(itemId)) {
          throw new WriteError(422, { error: `gan ${what} cho muc khong ton tai`, itemId })
        }
        if (mediaId === null) {
          remove.run(slot.scope, itemId)
          continue
        }
        const media = Number.isInteger(mediaId) ? mediaRow.get(mediaId) : null
        if (!media) {
          throw new WriteError(422, { error: `${what} khong co trong thu vien`, itemId, mediaId })
        }
        // Khe ảnh chỉ nhận ảnh, khe video chỉ nhận video — gắn nhầm thì component nhận
        // một `<img>` trỏ vào file MP4 (ô vỡ) hoặc ngược lại, không có cảnh báo nào.
        if (!media.mime.startsWith(slot.mime)) {
          throw new WriteError(422, { error: `media #${mediaId} khong phai ${what}`, itemId, mediaId })
        }
        upsert.run(slot.scope, itemId, mediaId, null)
      }

      // Mục vừa bị xoá trong lượt này thì media của nó đi theo.
      //
      // CHỈ mục vừa bị xoá — không phải mọi binding không khớp mục nào. Seed có
      // binding "mồ côi" CÓ CHỦ ĐÍCH: logo thật của Becamex và BBI nằm sẵn trong
      // scope `partner` dù hai đối tác đó chưa có trên trang. Bản đầu dọn theo kiểu
      // "không khớp là xoá" và đã xoá im lặng cả hai ngay lượt lưu Đối tác đầu tiên,
      // kể cả khi người dùng không đổi gì. Giữ lại thì thêm lại đối tác đó là logo
      // tự về đúng chỗ.
      for (const row of readSlotBindings(db, slot)) {
        if (previousIds.has(row.item_id) && !allowed.has(row.item_id)) remove.run(slot.scope, row.item_id)
      }
    }

    const result = checkInvariants(assemble(db), getLookups())
    const introduced = (after, earlier) => {
      const seen = new Set(earlier)
      return after.filter((message) => !seen.has(message))
    }

    const newErrors = introduced(result.errors, baseline.errors)
    if (newErrors.length > 0) {
      throw new WriteError(422, { error: 'noi dung vi pham rang buoc cua trang', invariants: newErrors })
    }

    return { rev: currentRev + 2, warnings: [...warnings, ...introduced(result.warnings, baseline.warnings)] }
  })

  const outcome = run()
  invalidate()
  return outcome
}

export function readHistory(section, limit = 20) {
  return getDb()
    .prepare(
      `SELECT id, locale, rev, saved_at, note
         FROM section_history WHERE key = ?
        ORDER BY saved_at DESC, locale ASC
        LIMIT ?`,
    )
    .all(section, limit)
}

/**
 * Khôi phục một bản trong lịch sử.
 *
 * Lấy bản cùng thời điểm của CẢ HAI ngôn ngữ chứ không chỉ dòng được chọn — khôi
 * phục một nửa là đúng cái lệch cấu trúc mà toàn bộ file này sinh ra để chặn.
 * Ảnh cũng quay về, trừ dòng lịch sử có từ trước migration 002 (không lưu ảnh).
 */
export function restoreHistory(historyId) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM section_history WHERE id = ?').get(historyId)
  if (!row) throw new WriteError(404, { error: 'khong co ban ghi lich su nay' })

  const pair = db
    .prepare('SELECT locale, json, bindings_json FROM section_history WHERE key = ? AND saved_at = ?')
    .all(row.key, row.saved_at)

  const values = {}
  for (const entry of pair) values[entry.locale] = JSON.parse(entry.json)
  if (!values.vi || !values.en) {
    throw new WriteError(409, { error: 'ban lich su nay thieu mot ngon ngu, khong khoi phuc duoc' })
  }

  const bindingsJson = pair[0].bindings_json
  const hasMedia = slotsOf(row.key).length > 0

  return writeSectionPair({
    section: row.key,
    vi: values.vi,
    en: values.en,
    bindings: hasMedia && bindingsJson ? parseHistoryBindings(bindingsJson) : undefined,
    note: `khoi phuc tu ${row.saved_at}${hasMedia && !bindingsJson ? ' (giu anh hien tai)' : ''}`,
  })
}
