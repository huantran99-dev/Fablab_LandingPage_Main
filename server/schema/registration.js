/**
 * Hợp lệ hoá form đăng ký khóa học.
 *
 * Thông báo lỗi là MÃ (`required`, `phone`…) chứ không phải câu chữ: người gửi đọc
 * lỗi bằng ngôn ngữ họ đang xem, và chữ đó nằm ở `register.errors.*` trong nội
 * dung — sửa được từ dashboard, máy chủ không phải biết tới.
 *
 * Mọi thông báo đều đặt tường minh: `sections.js` bật locale tiếng Việt của Zod cho
 * toàn tiến trình, nên thông báo nào bỏ trống sẽ ra câu tiếng Việt thay vì mã.
 */
import { z } from 'zod'

export const REGISTRATION_SOURCES = ['course-modal', 'final-cta', 'nav', 'nav-drawer']
export const REGISTRATION_STATUSES = ['new', 'contacted', 'enrolled', 'cancelled']

const ERROR_CODES = new Set(['required', 'tooLong', 'phone', 'email', 'consent', 'course'])

/**
 * Chuẩn hoá số điện thoại Việt Nam về dạng `0xxxxxxxxx`.
 * Cùng luật với `normalizePhone` trong `src/components/register/validate.js` —
 * cố ý chép hai nơi, đổi một bên là phải đổi bên kia.
 */
export function normalizePhone(value) {
  if (typeof value !== 'string') return value
  let digits = value.replace(/[\s.()-]/g, '')
  if (digits.startsWith('+84')) digits = `0${digits.slice(3)}`
  else if (/^84\d{9,10}$/.test(digits)) digits = `0${digits.slice(2)}`
  return digits
}

const squash = (value) => (typeof value === 'string' ? value.trim().replace(/[ \t]+/g, ' ') : value)
const blankToUndefined = (value) => {
  const cleaned = squash(value)
  return cleaned === '' || cleaned === null ? undefined : cleaned
}

const required = (max) =>
  z.preprocess(squash, z.string({ error: 'required' }).min(1, 'required').max(max, 'tooLong'))
const optional = (max) =>
  z.preprocess(blankToUndefined, z.string({ error: 'tooLong' }).max(max, 'tooLong').optional())

export const registrationSchema = z.strictObject({
  // '' = chưa chọn khóa. Khóa có thật hay không do route tra, không chặn ở đây:
  // người xem có thể đang cầm snapshot cũ của một khóa vừa bị xoá.
  course: z
    .string({ error: 'course' })
    .max(80, 'course')
    .regex(/^([a-z0-9][a-z0-9-]*)?$/, 'course'),
  studentName: required(120),
  studentGrade: optional(40),
  school: optional(160),
  parentName: required(120),
  phone: z.preprocess(
    normalizePhone,
    z.string({ error: 'required' }).min(1, 'required').regex(/^0\d{9,10}$/, 'phone'),
  ),
  email: z.preprocess(
    blankToUndefined,
    z.email({ error: 'email' }).max(160, 'tooLong').optional(),
  ),
  note: optional(1000),
  consent: z.literal(true, { error: 'consent' }),
  locale: z.enum(['vi', 'en'], { error: 'required' }),
  source: z.enum(REGISTRATION_SOURCES, { error: 'required' }),
  // Chống bot: ô bẫy người thật không nhìn thấy, và thời gian điền form (ms).
  website: z.string({ error: 'required' }).max(200, 'tooLong').optional(),
  elapsed: z.number({ error: 'required' }).int('required').nonnegative('required').optional(),
  // Chỉ phục vụ thống kê, không lưu vào dòng đăng ký.
  ref: z.string({ error: 'tooLong' }).max(120, 'tooLong').optional(),
  width: z.number({ error: 'required' }).optional(),
})

/** Lỗi Zod → `[{ path, code }]`. Mã lạ (khoá thừa, sai kiểu) gom thành `invalid`. */
export function registrationIssues(error) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || (issue.keys ? issue.keys.join(',') : ''),
    code: ERROR_CODES.has(issue.message) ? issue.message : 'invalid',
  }))
}
