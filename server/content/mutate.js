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
import { SECTION_IMAGES, assemble, mediaUrl } from './assemble.js'
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

/** Ảnh hiện gắn cho section (chỉ những mục thuộc về nó). `null` nếu section không có ảnh. */
function readSectionBindings(db, section) {
  const target = SECTION_IMAGES[section]
  if (!target) return null
  const rows = db
    .prepare('SELECT item_id, media_id, note FROM binding WHERE scope = ? ORDER BY item_id')
    .all(target.scope)
  return target.itemIds ? rows.filter((row) => target.itemIds.includes(row.item_id)) : rows
}

/** Id các mục được phép mang ảnh trong bản sắp ghi. */
function imageItemIds(section, dict) {
  const target = SECTION_IMAGES[section]
  if (target.itemIds) return new Set(target.itemIds)
  return new Set((dict[target.arrayKey] ?? []).map((item) => item.id))
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

  const target = SECTION_IMAGES[section]
  if (target) {
    const rows = db
      .prepare(
        `SELECT b.item_id, b.note, m.id, m.filename, m.width, m.height
           FROM binding b JOIN media m ON m.id = b.media_id
          WHERE b.scope = ?`,
      )
      .all(target.scope)
    out.images = {}
    for (const row of rows) {
      if (target.itemIds && !target.itemIds.includes(row.item_id)) continue
      out.images[row.item_id] = {
        mediaId: row.id,
        url: mediaUrl(row.filename),
        width: row.width,
        height: row.height,
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
 * @param {Array<{item_id, media_id, note}>} [args.bindings] THAY TOÀN BỘ ảnh của
 *   section — chỉ dùng khi khôi phục lịch sử
 * @returns {{ rev: number, warnings: string[] }}
 *
 * `expectedRev` là chốt chặn ghi đè: hai tab cùng mở, tab cũ bấm lưu sau sẽ nhận
 * 409 thay vì lặng lẽ xoá mất việc của tab kia.
 */
export function writeSectionPair({ section, vi, en, expectedRev, note = null, images, bindings }) {
  const db = getDb()

  const parity = assertParity({ [section]: vi }, { [section]: en })
  if (parity.missingInEn.length > 0 || parity.missingInVi.length > 0) {
    throw new WriteError(422, {
      error: 'hai ngon ngu khong cung cau truc',
      missingInEn: parity.missingInEn,
      missingInVi: parity.missingInVi,
    })
  }

  const target = SECTION_IMAGES[section]
  if (!target && (images || bindings)) {
    throw new WriteError(400, { error: 'section nay khong co anh', section })
  }

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
    const before = readSectionBindings(db, section)
    const beforeJson = before ? JSON.stringify(before) : null

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

    if (target) {
      const allowed = imageItemIds(section, vi)
      const mediaExists = db.prepare('SELECT 1 FROM media WHERE id = ?')
      const remove = db.prepare('DELETE FROM binding WHERE scope = ? AND item_id = ?')
      // Giữ ghi chú nguồn (`~` ảnh gần đúng, `↺` ảnh dùng lại) khi ảnh không đổi.
      // Thay ảnh thì ghi chú cũ mô tả một quan hệ không còn tồn tại -> xoá.
      const upsert = db.prepare(
        `INSERT INTO binding (scope, item_id, media_id, note) VALUES (?, ?, ?, ?)
         ON CONFLICT (scope, item_id) DO UPDATE SET
           note = CASE WHEN binding.media_id = excluded.media_id THEN binding.note ELSE excluded.note END,
           media_id = excluded.media_id`,
      )

      if (bindings) {
        for (const row of before) remove.run(target.scope, row.item_id)
        for (const row of bindings) {
          if (!allowed.has(row.item_id)) continue
          if (!mediaExists.get(row.media_id)) {
            warnings.push(`anh #${row.media_id} cua '${row.item_id}' da bi xoa khoi thu vien — muc nay de trong anh`)
            continue
          }
          upsert.run(target.scope, row.item_id, row.media_id, row.note ?? null)
        }
      }

      for (const [itemId, mediaId] of Object.entries(images ?? {})) {
        if (!allowed.has(itemId)) {
          throw new WriteError(422, { error: 'gan anh cho muc khong ton tai', itemId })
        }
        if (mediaId === null) {
          remove.run(target.scope, itemId)
          continue
        }
        if (!Number.isInteger(mediaId) || !mediaExists.get(mediaId)) {
          throw new WriteError(422, { error: 'anh khong co trong thu vien', itemId, mediaId })
        }
        upsert.run(target.scope, itemId, mediaId, null)
      }

      // Mục đã xoá khỏi section thì ảnh của nó cũng đi theo — không để binding mồ côi
      // chờ một mục mới trùng id "thừa kế" nhầm ảnh của người khác.
      for (const row of readSectionBindings(db, section)) {
        if (!allowed.has(row.item_id)) remove.run(target.scope, row.item_id)
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
  const hasImages = Boolean(SECTION_IMAGES[row.key])

  return writeSectionPair({
    section: row.key,
    vi: values.vi,
    en: values.en,
    bindings: hasImages && bindingsJson ? JSON.parse(bindingsJson) : undefined,
    note: `khoi phuc tu ${row.saved_at}${hasImages && !bindingsJson ? ' (giu anh hien tai)' : ''}`,
  })
}
