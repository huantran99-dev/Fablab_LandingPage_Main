/**
 * Mật khẩu và khoá tài khoản.
 *
 * Hash nằm trong bảng `admin_user`, KHÔNG nằm trong biến môi trường — nhờ vậy đổi
 * mật khẩu không cần deploy lại. Và `.gitignore` của repo này vốn không có mục
 * `.env` nào cho tới hôm nay, nên mật khẩu đặt trong `.env` chỉ cách `git add -A`
 * đúng một bước.
 *
 * `bcryptjs` (thuần JS) chứ không phải `bcrypt` (biên dịch sẵn): repo đã vấp một
 * lần với `better-sqlite3` không có nhị phân dựng sẵn cho Node 20 trên Windows.
 * Với đúng một tài khoản thì chênh lệch tốc độ không có ý nghĩa gì.
 */
import bcrypt from 'bcryptjs'

import { getDb } from '../db/index.js'

const COST = 12

/** Sau 5 lần sai thì khoá, lùi theo cấp số nhân, trần 15 phút. */
const FREE_ATTEMPTS = 5
const MAX_LOCK_MS = 15 * 60 * 1000

export function hashPassword(plain) {
  return bcrypt.hash(plain, COST)
}

export function getAdmin() {
  return getDb().prepare('SELECT * FROM admin_user WHERE id = 1').get() ?? null
}

/** Còn bao nhiêu mili giây nữa mới hết khoá. 0 nghĩa là đang mở. */
export function lockRemaining(admin) {
  if (!admin?.locked_until) return 0
  return Math.max(0, new Date(admin.locked_until).getTime() - Date.now())
}

function registerFailure(admin) {
  const failed = admin.failed_count + 1
  let lockedUntil = null

  if (failed >= FREE_ATTEMPTS) {
    const ms = Math.min(2 ** (failed - FREE_ATTEMPTS) * 1000, MAX_LOCK_MS)
    lockedUntil = new Date(Date.now() + ms).toISOString()
  }

  getDb()
    .prepare('UPDATE admin_user SET failed_count = ?, locked_until = ? WHERE id = 1')
    .run(failed, lockedUntil)
}

/**
 * Kiểm mật khẩu. Trả `{ ok, lockedMs }`.
 *
 * Khi không có tài khoản vẫn chạy một lượt bcrypt trên hash giả: thời gian phản
 * hồi không tiết lộ tài khoản có tồn tại hay không. Với đúng một tài khoản thì
 * điều này gần như vô nghĩa, nhưng nó miễn phí và là thói quen đúng.
 */
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKcEe.aQFHXfHqjnMEwCM4tK.rCiI2Wr0Wu2u'

export async function verifyPassword(username, plain) {
  const admin = getAdmin()

  const locked = lockRemaining(admin)
  if (locked > 0) return { ok: false, lockedMs: locked }

  if (!admin) {
    await bcrypt.compare(plain, DUMMY_HASH)
    return { ok: false, lockedMs: 0 }
  }

  const match = username === admin.username && (await bcrypt.compare(plain, admin.password_hash))
  if (!match) {
    registerFailure(admin)
    return { ok: false, lockedMs: lockRemaining(getAdmin()) }
  }

  getDb().prepare('UPDATE admin_user SET failed_count = 0, locked_until = NULL WHERE id = 1').run()
  return { ok: true, lockedMs: 0 }
}

export function setPassword(hash) {
  getDb()
    .prepare('UPDATE admin_user SET password_hash = ?, updated_at = ? WHERE id = 1')
    .run(hash, new Date().toISOString())
}
