/**
 * Phiên đăng nhập bằng cookie mờ (opaque), lưu trong database.
 *
 * **Không dùng JWT.** JWT không thu hồi được, mà "đổi mật khẩu là đăng xuất mọi
 * nơi" chỉ là một câu `DELETE` khi có bảng — còn với JWT thì phải dựng thêm danh
 * sách đen, tức là vẫn cần đúng cái bảng vừa tránh.
 *
 * **Database chỉ giữ sha256 của token, không giữ token.** Lộ database cũng không
 * lấy được phiên đang sống. Token là 32 byte ngẫu nhiên nên không cần thêm muối:
 * không có gì để dò, và băm ở đây chỉ để một chiều hoá.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

import { config } from '../config.js'
import { getDb } from '../db/index.js'

export const COOKIE_NAME = 'fablab_admin'
export const CSRF_COOKIE = 'fablab_csrf'

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const HARD_LIMIT_MS = 30 * 24 * 60 * 60 * 1000

const hash = (token) => createHash('sha256').update(token).digest('hex')

export function cookieOptions(maxAgeMs = MAX_AGE_MS) {
  return {
    httpOnly: true,
    // Không ép `secure` ở chế độ phát triển, kẻo cookie không bao giờ được đặt
    // trên http://localhost và việc đăng nhập trông như hỏng vô cớ.
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeMs,
  }
}

export function createSession({ ip, userAgent }) {
  const token = randomBytes(32).toString('base64url')
  const now = Date.now()

  getDb()
    .prepare(
      `INSERT INTO session (token_hash, created_at, expires_at, last_seen, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      hash(token),
      new Date(now).toISOString(),
      new Date(now + MAX_AGE_MS).toISOString(),
      new Date(now).toISOString(),
      ip ?? null,
      userAgent ?? null,
    )

  return token
}

/**
 * Tra phiên và gia hạn trượt. Trả `null` nếu không hợp lệ.
 *
 * Hạn cứng tính từ `created_at`: gia hạn trượt giúp người đang dùng không bị đá
 * ra giữa chừng, nhưng một phiên không thể sống mãi mãi chỉ vì được dùng đều.
 */
export function readSession(token) {
  if (!token) return null

  const db = getDb()
  const row = db.prepare('SELECT * FROM session WHERE token_hash = ?').get(hash(token))
  if (!row) return null

  const now = Date.now()
  const expired = now > new Date(row.expires_at).getTime()
  const tooOld = now - new Date(row.created_at).getTime() > HARD_LIMIT_MS

  if (expired || tooOld) {
    db.prepare('DELETE FROM session WHERE token_hash = ?').run(row.token_hash)
    return null
  }

  db.prepare('UPDATE session SET last_seen = ?, expires_at = ? WHERE token_hash = ?').run(
    new Date(now).toISOString(),
    new Date(now + MAX_AGE_MS).toISOString(),
    row.token_hash,
  )
  return row
}

export function destroySession(token) {
  if (!token) return
  getDb().prepare('DELETE FROM session WHERE token_hash = ?').run(hash(token))
}

/** Dùng sau khi đổi mật khẩu: đăng xuất mọi nơi. */
export function destroyAllSessions() {
  getDb().prepare('DELETE FROM session').run()
}

export function newCsrfToken() {
  return randomBytes(24).toString('base64url')
}

/** So chuỗi theo thời gian hằng định, an toàn với độ dài khác nhau. */
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}
