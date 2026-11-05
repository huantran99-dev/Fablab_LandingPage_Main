/**
 * Kiểm form đăng ký phía trình duyệt — ba loại: `course` (phụ huynh đăng ký khóa học),
 * `member` (người từ 16 tuổi đăng ký thành viên FabLab) và `event` (đăng ký một cuộc thi /
 * workshop / hội thảo — mọi tuổi, dưới 16 thì có tên phụ huynh). Máy chủ kiểm lại toàn bộ
 * (`server/schema/registration.js`) — phía này chỉ để báo lỗi sớm, bằng đúng ngôn ngữ
 * người dùng đang xem.
 *
 * Mã lỗi trùng với mã máy chủ trả về, nên cả hai đường cùng tra `register.errors.*`.
 */

/** Hai TAB của form. `event` không phải tab: form sự kiện chỉ mở từ nút trên từng slide. */
export const KINDS = ['member', 'course']

/**
 * Id đối tượng / lĩnh vực của thành viên. CHÉP từ `MEMBER_ROLES` / `MEMBER_INTERESTS` ở
 * server/schema/registration.js (bundle trình duyệt không import được mã máy chủ) — đổi
 * một bên là phải đổi bên kia, và đổi cả schema nội dung `register.memberRoles`.
 */
export const MEMBER_ROLES = ['eiu-student', 'eiu-staff', 'student', 'worker', 'other']
export const MEMBER_INTERESTS = ['3d-printing', 'laser', 'cnc', 'electronics', 'robotics', 'other']
export const MEMBER_MIN_AGE = 16

/** Mỗi loại một bản nháp riêng: số điện thoại phụ huynh và số của thành viên là hai thứ. */
export const EMPTY_DRAFTS = {
  course: {
    course: '',
    studentName: '',
    studentGrade: '',
    school: '',
    parentName: '',
    phone: '',
    email: '',
    note: '',
    consent: false,
  },
  member: {
    fullName: '',
    birthYear: '',
    phone: '',
    email: '',
    role: '',
    organization: '',
    interests: [],
    note: '',
    consent: false,
  },
  event: {
    event: '',
    fullName: '',
    birthYear: '',
    parentName: '',
    phone: '',
    email: '',
    organization: '',
    note: '',
    consent: false,
  },
}

/** Giới hạn độ dài — khớp schema máy chủ. */
export const LIMITS = {
  course: {
    studentName: 120,
    studentGrade: 40,
    school: 160,
    parentName: 120,
    phone: 20,
    email: 160,
    note: 1000,
  },
  member: {
    fullName: 120,
    birthYear: 4,
    phone: 20,
    email: 160,
    organization: 160,
    note: 1000,
  },
  event: {
    fullName: 120,
    birthYear: 4,
    parentName: 120,
    phone: 20,
    email: 160,
    organization: 160,
    note: 1000,
  },
}

/** Thứ tự trường trên form — cũng là thứ tự trong hộp tóm tắt lỗi. */
export const FIELD_ORDER = {
  course: ['course', 'studentName', 'studentGrade', 'school', 'parentName', 'phone', 'email', 'note', 'consent'],
  member: ['fullName', 'birthYear', 'phone', 'email', 'role', 'organization', 'interests', 'note', 'consent'],
  // `event` đứng đầu: máy chủ báo sự kiện đã đóng đăng ký bằng đường này.
  event: ['event', 'fullName', 'birthYear', 'parentName', 'phone', 'email', 'organization', 'note', 'consent'],
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

/** Cùng luật với `birthYearError` ở máy chủ: tính theo năm, từ 16 tuổi. */
export function birthYearError(value, now = new Date()) {
  const text = String(value ?? '').trim()
  if (!text) return 'required'
  if (!/^\d{4}$/.test(text)) return 'birthYear'
  const year = Number(text)
  if (year < 1900 || year > now.getFullYear()) return 'birthYear'
  if (now.getFullYear() - year < MEMBER_MIN_AGE) return 'age'
  return null
}

/**
 * Năm sinh của người tham gia sự kiện: năm hợp lệ, KHÔNG chặn tuổi. Cùng luật với
 * `eventBirthYearError` ở máy chủ.
 */
export function eventBirthYearError(value, now = new Date()) {
  const text = String(value ?? '').trim()
  if (!text) return 'required'
  if (!/^\d{4}$/.test(text)) return 'birthYear'
  const year = Number(text)
  if (year < 1900 || year > now.getFullYear()) return 'birthYear'
  return null
}

/** Người tham gia dưới 16 tuổi (tính theo năm) → form đòi tên phụ huynh. Năm chưa hợp lệ = chưa biết. */
export function needsParent(birthYear, now = new Date()) {
  if (eventBirthYearError(birthYear, now)) return false
  return now.getFullYear() - Number(String(birthYear).trim()) < MEMBER_MIN_AGE
}

const PHONE = /^0\d{9,10}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function checkPhone(draft, errors) {
  const phone = normalizePhone(draft.phone)
  if (!phone) errors.phone = 'required'
  else if (!PHONE.test(phone)) errors.phone = 'phone'
}

function checkLimits(draft, limits, errors) {
  for (const [field, max] of Object.entries(limits)) {
    if (!errors[field] && draft[field].trim().length > max) errors[field] = 'tooLong'
  }
}

/** `{ tênTrường: mãLỗi }`, rỗng nếu hợp lệ. */
export function validate(kind, draft) {
  const errors = {}
  if (kind === 'member') {
    if (!draft.fullName.trim()) errors.fullName = 'required'
    const year = birthYearError(draft.birthYear)
    if (year) errors.birthYear = year
    checkPhone(draft, errors)
    const email = draft.email.trim()
    if (!email) errors.email = 'required'
    else if (!EMAIL.test(email)) errors.email = 'email'
    if (!MEMBER_ROLES.includes(draft.role)) errors.role = 'role'
    checkLimits(draft, LIMITS.member, errors)
  } else if (kind === 'event') {
    if (!draft.event) errors.event = 'event'
    if (!draft.fullName.trim()) errors.fullName = 'required'
    const year = eventBirthYearError(draft.birthYear)
    if (year) errors.birthYear = year
    if (needsParent(draft.birthYear) && !draft.parentName.trim()) errors.parentName = 'required'
    checkPhone(draft, errors)
    const email = draft.email.trim()
    if (email && !EMAIL.test(email)) errors.email = 'email'
    checkLimits(draft, LIMITS.event, errors)
  } else {
    if (!draft.studentName.trim()) errors.studentName = 'required'
    if (!draft.parentName.trim()) errors.parentName = 'required'
    checkPhone(draft, errors)
    const email = draft.email.trim()
    if (email && !EMAIL.test(email)) errors.email = 'email'
    checkLimits(draft, LIMITS.course, errors)
  }
  if (!draft.consent) errors.consent = 'consent'
  return errors
}
