/**
 * Bộ nhớ đệm bản nội dung đã ráp.
 *
 * Ráp lại là đọc chừng trăm dòng rồi `JSON.parse` — rẻ, nhưng đây là thứ mọi lượt
 * truy cập trang đều gọi, trong khi nội dung chỉ đổi khi admin bấm lưu. Khoá đệm
 * theo `rev`, nên không cần ai nhớ đi xoá đệm sau khi ghi: ghi xong `rev` đổi, lần
 * đọc kế tiếp tự ráp lại.
 */
import { assemble, currentRev } from './assemble.js'
import { getDb } from '../db/index.js'

let cached = null

export function getContent() {
  const db = getDb()
  const { rev } = currentRev(db)
  if (cached?.rev === rev) return cached.payload

  const payload = assemble(db)
  // ETag phải ổn định giữa các lần gọi cùng `rev`, nên KHÔNG băm cả payload
  // (`generatedAt` đổi mỗi lần ráp lại sẽ làm ETag đổi theo và cache client vô dụng).
  payload.etag = `W/"content-${rev}"`
  cached = { rev, payload }
  return payload
}

export function invalidate() {
  cached = null
}
