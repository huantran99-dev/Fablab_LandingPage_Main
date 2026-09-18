/**
 * Nhãn và màu của trạng thái đăng ký, dùng chung cho trang Đăng ký và Tổng quan.
 * Thứ tự khoá = thứ tự tab và thứ tự trong ô chọn — cũng là vòng đời của một lượt
 * đăng ký. Khớp `REGISTRATION_STATUSES` ở server/schema/registration.js.
 */
export const STATUS = {
  new: { label: 'Mới', color: 'brand' },
  contacted: { label: 'Đã liên hệ', color: 'warning' },
  enrolled: { label: 'Đã nhập học', color: 'success' },
  cancelled: { label: 'Đã huỷ', color: 'gray' },
}

export const STATUS_KEYS = Object.keys(STATUS)

export const SOURCE_LABELS = {
  'course-modal': 'Popup khóa học',
  'final-cta': 'Khối kêu gọi cuối trang',
  nav: 'Nút trên thanh menu',
  'nav-drawer': 'Nút trong menu điện thoại',
}

/** 0912345678 → 0912 345 678 (dễ đọc khi gọi điện). */
export function formatPhone(phone) {
  const digits = String(phone ?? '')
  if (digits.length === 10) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  if (digits.length === 11) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
  return digits
}
