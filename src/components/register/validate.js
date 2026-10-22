/**
 * Kiểm form đăng ký phía trình duyệt. Máy chủ kiểm lại toàn bộ
 * (`server/schema/registration.js`) — phía này chỉ để báo lỗi sớm, bằng đúng ngôn
 * ngữ người dùng đang xem.
 *
 * Mã lỗi trùng với mã máy chủ trả về, nên cả hai đường cùng tra `register.errors.*`.
 */

export const EMPTY_DRAFT = {
  course: '',
  studentName: '',
  studentGrade: '',
  school: '',
  parentName: '',
  phone: '',
  email: '',
  note: '',
  consent: false,
}

/** Giới hạn độ dài — khớp schema máy chủ. */
export const LIMITS = {
  studentName: 120,
  studentGrade: 40,
  school: 160,
  parentName: 120,
  phone: 20,
  email: 160,
  note: 1000,
}

/**
 * Chuẩn hoá số điện thoại Việt Nam về `0xxxxxxxxx`. Cùng luật với `normalizePhone`
 * ở `server/schema/registration.js` — cố ý chép hai nơi, đổi một bên phải đổi bên kia.
 */
export function normalizePhone(value) {
  let digits = value.replace(/[\s.()-]/g, '')
  if (digits.startsWith('+84')) digits = `0${digits.slice(3)}`
  else if (/^84\d{9,10}$/.test(digits)) digits = `0${digits.slice(2)}`
  return digits
}

const PHONE = /^0\d{9,10}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Thứ tự trường trên form — cũng là thứ tự trong hộp tóm tắt lỗi. */
export const FIELD_ORDER = ['course', 'studentName', 'studentGrade', 'school', 'parentName', 'phone', 'email', 'note', 'consent']

/** `{ tênTrường: mãLỗi }`, rỗng nếu hợp lệ. */
export function validate(draft) {
  const errors = {}
  if (!draft.studentName.trim()) errors.studentName = 'required'
  if (!draft.parentName.trim()) errors.parentName = 'required'

  const phone = normalizePhone(draft.phone)
  if (!phone) errors.phone = 'required'
  else if (!PHONE.test(phone)) errors.phone = 'phone'

  const email = draft.email.trim()
  if (email && !EMAIL.test(email)) errors.email = 'email'

  for (const [field, max] of Object.entries(LIMITS)) {
    if (!errors[field] && draft[field].trim().length > max) errors[field] = 'tooLong'
  }
  if (!draft.consent) errors.consent = 'consent'
  return errors
}
