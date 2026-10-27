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

/** Cùng trạng thái `enrolled`, nhưng với thành viên FabLab nghĩa là đã kết nạp. */
export function statusLabel(status, kind) {
  if (kind === 'member' && status === 'enrolled') return 'Đã kết nạp'
  return STATUS[status]?.label ?? status
}

/** Hai loại đăng ký — khớp `REGISTRATION_KINDS` ở server/schema/registration.js. */
export const KIND = {
  course: { label: 'Khóa học', color: 'gray' },
  member: { label: 'Thành viên FabLab', color: 'info' },
}

/** Dòng phụ dưới tên trong danh sách: khóa học (hoặc "cần tư vấn") / "Thành viên FabLab". */
export function registrationTopic(entry) {
  if (entry.kind === 'member') return KIND.member.label
  return entry.courseTitle ?? (entry.courseId ? entry.courseId : 'Cần tư vấn')
}

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
