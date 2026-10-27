/**
 * Hợp lệ hoá form đăng ký — hai loại, phân biệt bằng `kind`:
 *   - `course`: phụ huynh đăng ký khóa học cho con (học viên + phụ huynh);
 *   - `member`: người từ 16 tuổi tự đăng ký thành viên FabLab.
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
export const REGISTRATION_KINDS = ['course', 'member']

/**
 * Id cố định trong mã (cùng kiểu với trạng thái): nhãn nằm ở `register.memberRoles` /
 * `register.memberInterests` và sửa được từ dashboard, nhưng thêm/bớt id là sửa ở đây,
 * ở schema nội dung (`sections.js`) và ở form — ba chỗ, có chủ đích: id lạ mà lọt vào
 * database thì trang quản trị không có nhãn để hiện.
 */
export const MEMBER_ROLES = ['eiu-student', 'eiu-staff', 'student', 'worker', 'other']
export const MEMBER_INTERESTS = ['3d-printing', 'laser', 'cnc', 'electronics', 'robotics', 'other']

/** Thành viên tự đăng ký và tự đồng ý — dưới tuổi này phải để phụ huynh đăng ký khóa học. */
export const MEMBER_MIN_AGE = 16

const ERROR_CODES = new Set(['required', 'tooLong', 'phone', 'email', 'consent', 'course', 'age', 'birthYear', 'role', 'interests'])

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

/**
 * Năm sinh hợp lệ cho thành viên → mã lỗi, hoặc null nếu đạt. Cùng luật với
 * `birthYearError` ở phía form. Tính theo năm (không theo ngày sinh): form chỉ hỏi năm.
 */
export function birthYearError(value, now = new Date()) {
  const text = String(value ?? '').trim()
  if (!text) return 'required'
  if (!/^\d{4}$/.test(text)) return 'birthYear'
  const year = Number(text)
  if (year < 1900 || year > now.getFullYear()) return 'birthYear'
  if (now.getFullYear() - year < MEMBER_MIN_AGE) return 'age'
  return null
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

const phoneSchema = z.preprocess(
  normalizePhone,
  z.string({ error: 'required' }).min(1, 'required').regex(/^0\d{9,10}$/, 'phone'),
)

/** Trường chung của mọi lượt gửi: chống bot, ngôn ngữ, nguồn, thống kê. */
const common = {
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
}

const courseSchema = z.strictObject({
  kind: z.literal('course'),
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
  phone: phoneSchema,
  email: z.preprocess(blankToUndefined, z.email({ error: 'email' }).max(160, 'tooLong').optional()),
  ...common,
})

const memberSchema = z.strictObject({
  kind: z.literal('member'),
  fullName: required(120),
  birthYear: z.preprocess(squash, z.string({ error: 'required' })).superRefine((value, ctx) => {
    const code = birthYearError(value)
    if (code) ctx.addIssue({ code: 'custom', message: code })
  }),
  phone: phoneSchema,
  // Thành viên tự liên hệ, không qua phụ huynh — email bắt buộc để gửi hướng dẫn thủ tục.
  email: z.preprocess(squash, z.string({ error: 'required' }).min(1, 'required').pipe(z.email({ error: 'email' }).max(160, 'tooLong'))),
  role: z.enum(MEMBER_ROLES, { error: 'role' }),
  organization: optional(160),
  interests: z
    .array(z.enum(MEMBER_INTERESTS, { error: 'interests' }), { error: 'interests' })
    .max(MEMBER_INTERESTS.length, 'interests')
    .refine((list) => new Set(list).size === list.length, 'interests')
    .optional(),
  ...common,
})

/**
 * `kind` vắng = `course`: bundle cũ còn trong cache trình duyệt (trước ngày có loại thành
 * viên) gửi thân không có `kind`, và lượt đăng ký đó vẫn phải vào được.
 */
export const registrationSchema = z.preprocess(
  (value) => (value && typeof value === 'object' && !Array.isArray(value) && value.kind === undefined ? { ...value, kind: 'course' } : value),
  z.discriminatedUnion('kind', [courseSchema, memberSchema], { error: 'required' }),
)

/** Lỗi Zod → `[{ path, code }]`. Mã lạ (khoá thừa, sai kiểu) gom thành `invalid`. */
export function registrationIssues(error) {
  return error.issues.map((issue) => ({
    // `interests.2` → `interests`: form chỉ có một ô lỗi cho cả nhóm.
    path: issue.path.length > 0 ? String(issue.path[0]) : issue.keys ? issue.keys.join(',') : '',
    code: ERROR_CODES.has(issue.message) ? issue.message : 'invalid',
  }))
}
