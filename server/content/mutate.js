/**
 * Đường ghi nội dung.
 *
 * Một nguyên tắc duy nhất, và nó loại được gần hết rủi ro lệch cấu trúc: **mọi
 * thao tác ghi đều tác động lên CẢ HAI ngôn ngữ trong CÙNG một giao dịch.**
 *
 * Nhờ đó "VI và EN khác thứ tự" hay "thêm mục vào VI mà quên EN" trở thành trạng
 * thái **không biểu diễn được**, thay vì một lỗi phải trông chờ bộ kiểm bắt được
 * sau khi đã ghi.
 */
import { assertParity } from './parity.js'
import { invalidate } from './cache.js'
import { getDb } from '../db/index.js'

export class WriteError extends Error {
  constructor(status, body) {
    super(body.error ?? 'loi ghi')
    this.status = status
    this.body = body
  }
}

export function readSectionPair(section) {
  const db = getDb()
  const rows = db.prepare('SELECT locale, json, rev FROM section WHERE key = ?').all(section)
  if (rows.length === 0) throw new WriteError(404, { error: 'khong co section nay', section })

  const out = { section, vi: null, en: null, rev: 0 }
  for (const row of rows) {
    out[row.locale] = JSON.parse(row.json)
    out.rev += row.rev
  }
  return out
}

/**
 * Ghi cả hai ngôn ngữ của một section.
 *
 * `expectedRev` là chốt chặn ghi đè: hai tab cùng mở, tab cũ bấm lưu sau sẽ nhận
 * 409 thay vì lặng lẽ xoá mất việc của tab kia.
 */
export function writeSectionPair({ section, vi, en, expectedRev, note = null }) {
  const db = getDb()

  const parity = assertParity({ [section]: vi }, { [section]: en })
  if (parity.missingInEn.length > 0 || parity.missingInVi.length > 0) {
    throw new WriteError(422, {
      error: 'hai ngon ngu khong cung cau truc',
      missingInEn: parity.missingInEn,
      missingInVi: parity.missingInVi,
    })
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

    const now = new Date().toISOString()
    for (const row of current) {
      // Chép bản cũ sang lịch sử TRƯỚC khi ghi đè, nên luôn quay lại được.
      db.prepare(
        'INSERT INTO section_history (locale, key, json, rev, saved_at, note) VALUES (?, ?, ?, ?, ?, ?)',
      ).run(row.locale, section, row.json, row.rev, now, note)
    }

    for (const [locale, value] of Object.entries({ vi, en })) {
      db.prepare('UPDATE section SET json = ?, rev = rev + 1, updated_at = ? WHERE locale = ? AND key = ?').run(
        JSON.stringify(value),
        now,
        locale,
        section,
      )
    }

    return currentRev + 2
  })

  const newRev = run()
  invalidate()
  return newRev
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
 */
export function restoreHistory(historyId) {
  const db = getDb()
  const row = db.prepare('SELECT * FROM section_history WHERE id = ?').get(historyId)
  if (!row) throw new WriteError(404, { error: 'khong co ban ghi lich su nay' })

  const pair = db
    .prepare('SELECT locale, json FROM section_history WHERE key = ? AND saved_at = ?')
    .all(row.key, row.saved_at)

  const values = {}
  for (const entry of pair) values[entry.locale] = JSON.parse(entry.json)
  if (!values.vi || !values.en) {
    throw new WriteError(409, { error: 'ban lich su nay thieu mot ngon ngu, khong khoi phuc duoc' })
  }

  return writeSectionPair({
    section: row.key,
    vi: values.vi,
    en: values.en,
    note: `khoi phuc tu ${row.saved_at}`,
  })
}
