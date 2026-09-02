/**
 * Chữ cái đầu của tên, dùng dựng avatar khi không có ảnh chân dung.
 *
 * Lấy chữ đầu của từ đầu và từ cuối. Với tên tiếng Việt ("Đỗ Nguyễn Anh Tuấn")
 * cho ra họ + tên gọi ("ĐT") — đọc ra vẫn nhận được người, và không bao giờ
 * phải dựng một khuôn mặt không có thật.
 */
export function initialsOf(name) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}
