/**
 * `localStorage` cho các tuỳ chọn hiển thị (sidebar thu gọn, giao diện tối).
 *
 * Mọi truy cập bọc `try/catch` — quy ước bắt buộc của repo: chế độ duyệt riêng tư
 * và trình duyệt chặn lưu trữ sẽ ném lỗi ngay khi chạm vào `localStorage`. Mất tuỳ
 * chọn hiển thị là chấp nhận được; trắng trang thì không.
 */
export function readStored(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value === null ? fallback : JSON.parse(value)
  } catch {
    return fallback
  }
}

export function writeStored(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Không lưu được thì thôi — lần sau mở lại dùng mặc định.
  }
}
