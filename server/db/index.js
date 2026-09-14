/**
 * Điểm truy cập DUY NHẤT tới database.
 *
 * Không file nào khác được `import 'better-sqlite3'`. Lý do rất cụ thể: driver
 * này là module biên dịch sẵn, phải khớp phiên bản Node — máy này đã phải lùi về
 * bản 11.x vì bản mới nhất không có nhị phân dựng sẵn cho Node 20 trên Windows,
 * và trên máy chủ sẽ phải `npm rebuild` mỗi lần nâng Node major. Gói toàn bộ vào
 * đây thì đổi driver về sau (kể cả sang `node:sqlite` sẵn có của Node 22+) chỉ
 * phải sửa một file.
 */
import Database from 'better-sqlite3'
import { readFileSync, readdirSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config, paths } from '../config.js'

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations')

let handle = null

function applyMigrations(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS migration (
    name       TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`)

  const applied = new Set(db.prepare('SELECT name FROM migration').all().map((row) => row.name))
  const files = readdirSync(MIGRATIONS_DIR).filter((name) => name.endsWith('.sql')).sort()

  for (const name of files) {
    if (applied.has(name)) continue
    const sql = readFileSync(join(MIGRATIONS_DIR, name), 'utf8')
    // Mỗi migration là MỘT giao dịch: hỏng giữa chừng thì không để lại lược đồ dở.
    db.transaction(() => {
      db.exec(sql)
      db.prepare('INSERT INTO migration (name, applied_at) VALUES (?, ?)').run(name, new Date().toISOString())
    })()
  }
}

export function getDb() {
  if (handle) return handle

  mkdirSync(config.dataDir, { recursive: true })
  const db = new Database(paths.db)

  // WAL: đọc không chặn ghi. `synchronous = NORMAL` là mức an toàn thường dùng
  // kèm WAL — mất điện đúng lúc có thể mất giao dịch cuối, không hỏng file.
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')

  applyMigrations(db)
  handle = db
  return db
}

/** Đóng handle. Chỉ script dùng tới; máy chủ giữ mở suốt vòng đời tiến trình. */
export function closeDb() {
  if (!handle) return
  handle.close()
  handle = null
}

/**
 * Bọc một hàm thành giao dịch.
 *
 * better-sqlite3 đồng bộ nên giao dịch chỉ là một lời gọi hàm — không có `await`
 * nào lọt vào giữa để làm hỏng tính nguyên tử. Đây chính là lý do chọn driver
 * đồng bộ: cam kết "ghi VI và EN cùng lúc hoặc không ghi gì" đúng một cách hiển
 * nhiên, không phải suy luận.
 */
export function transaction(fn) {
  return getDb().transaction(fn)
}
