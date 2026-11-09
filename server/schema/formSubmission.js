/**
 * Kiểm bài gửi của form tự tạo (API 23).
 *
 * Form do admin định nghĩa (section `forms`), nên không có schema cố định như form đăng ký:
 * máy chủ đọc định nghĩa form trong bản VI HIỆN HÀNH rồi kiểm từng ô theo loại của nó. Không
 * tin client — người xem có thể cầm snapshot cũ, nên ô lạ bị từ chối, ô thiếu theo luật.
 *
 * Cùng luật với `src/components/forms/validateForm.js` — cố ý chép hai nơi (như
 * `normalizePhone`), đổi một bên phải đổi bên kia. Mã lỗi là chuỗi ngắn, form tự dịch.
 */
import { z } from 'zod'

import { ageFromYear, eventBirthYearError, normalizePhone } from './registration.js'

/** Chỗ đặt nút có thể mở form tự tạo. Không có CHECK ở bảng — thêm chỗ chỉ sửa ở đây. */
export const FORM_SOURCES = ['hero', 'nav', 'nav-drawer', 'final-cta', 'popup', 'seasonal-popup']
export const FORM_STATUSES = ['new', 'contacted', 'done', 'cancelled']
export const FORM_MIN_AGE = 16

const LIMITS = { text: 200, textarea: 2000, phone: 20, email: 160, number: 20, date: 10 }
const PHONE = /^0\d{9,10}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NUMBER = /^-?\d+(?:[.,]\d+)?$/

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/**
 * Một ô: `{ value }` (đã chuẩn hoá; `null` = để trống) hoặc `{ code }`.
 * Loại không biết (bản lịch sử lạ) coi như chữ một dòng.
 */
export function checkAnswer(field, raw) {
  const type = field.fieldType
  if (type === 'checkbox') {
    if (raw !== undefined && typeof raw !== 'boolean') return { code: 'invalid' }
    if (field.required && raw !== true) return { code: 'required' }
    return { value: raw === true }
  }
  if (type === 'multiselect') {
    if (raw === undefined || raw === null) raw = []
    if (!Array.isArray(raw)) return { code: 'invalid' }
    const ids = new Set((field.options ?? []).map((option) => option.id))
    if (raw.some((value) => !ids.has(value)) || new Set(raw).size !== raw.length) return { code: 'invalid' }
    if (field.required && raw.length === 0) return { code: 'required' }
    // Giữ thứ tự của danh sách lựa chọn, không theo thứ tự bấm.
    const chosen = (field.options ?? []).map((option) => option.id).filter((id) => raw.includes(id))
    return { value: chosen.length ? chosen : null }
  }

  if (raw !== undefined && raw !== null && typeof raw !== 'string') return { code: 'invalid' }
  let value = String(raw ?? '').trim()
  if (type !== 'textarea') value = value.replace(/\s+/g, ' ')
  if (!value) return field.required ? { code: 'required' } : { value: null }

  switch (type) {
    case 'phone':
      value = normalizePhone(value)
      return PHONE.test(value) ? { value } : { code: 'phone' }
    case 'email':
      if (value.length > LIMITS.email) return { code: 'tooLong' }
      return EMAIL.test(value) ? { value } : { code: 'email' }
    case 'number':
      return value.length <= LIMITS.number && NUMBER.test(value) ? { value } : { code: 'invalid' }
    case 'date':
      return validDate(value) ? { value } : { code: 'invalid' }
    case 'select':
      return (field.options ?? []).some((option) => option.id === value) ? { value } : { code: 'invalid' }
    default:
      return value.length <= (LIMITS[type] ?? LIMITS.text) ? { value } : { code: 'tooLong' }
  }
}

/**
 * Chữ đọc được của một câu trả lời, chụp lúc gửi theo nhãn tiếng Việt: lựa chọn lưu bằng id,
 * mà admin có thể đổi nhãn / xoá lựa chọn về sau — bài cũ vẫn phải đọc được.
 */
function answerText(field, value) {
  if (value === null || value === undefined) return ''
  const optionLabel = (id) => (field.options ?? []).find((option) => option.id === id)?.label ?? id
  if (field.fieldType === 'checkbox') return value ? 'Có' : 'Không'
  if (field.fieldType === 'select') return optionLabel(value)
  if (field.fieldType === 'multiselect') return value.map(optionLabel).join('; ')
  return String(value)
}

/** Phần bao của bài gửi — giống `common` của form đăng ký, cộng câu trả lời theo id ô. */
export const submissionEnvelope = z.strictObject({
  answers: z.record(z.string().max(80), z.unknown()).refine((value) => Object.keys(value).length <= 40),
  birthYear: z.string().max(10).optional(),
  parentName: z.string().max(200).optional(),
  consent: z.boolean().optional(),
  locale: z.enum(['vi', 'en']),
  source: z.enum(FORM_SOURCES),
  website: z.string().max(200).optional(),
  elapsed: z.number().int().nonnegative().optional(),
  ref: z.string().max(120).optional(),
  width: z.number().int().nonnegative().max(20_000).optional(),
})

/**
 * Kiểm bài gửi theo định nghĩa form. Trả `{ issues }` (mảng `{ path, code }`, rỗng = hợp lệ)
 * và phần đã chuẩn hoá để lưu.
 */
export function checkSubmission(form, data, now = new Date()) {
  const issues = []
  const answers = []
  const known = new Set(form.fields.map((field) => field.id))
  for (const id of Object.keys(data.answers)) {
    if (!known.has(id)) issues.push({ path: `answers.${id}`, code: 'invalid' })
  }
  for (const field of form.fields) {
    const result = checkAnswer(field, data.answers[field.id])
    if (result.code) issues.push({ path: `answers.${field.id}`, code: result.code })
    else answers.push({ id: field.id, label: field.label, type: field.fieldType, value: result.value, text: answerText(field, result.value) })
  }

  const yearCode = eventBirthYearError(data.birthYear, now)
  const age = yearCode ? null : ageFromYear(data.birthYear, now)
  if (yearCode) issues.push({ path: 'birthYear', code: yearCode })
  else if (age < FORM_MIN_AGE && !form.allowMinors) issues.push({ path: 'birthYear', code: 'age' })

  const minor = age !== null && age < FORM_MIN_AGE
  const parentName = String(data.parentName ?? '').trim().replace(/\s+/g, ' ')
  if (minor && form.allowMinors) {
    if (!parentName) issues.push({ path: 'parentName', code: 'required' })
    else if (parentName.length > 120) issues.push({ path: 'parentName', code: 'tooLong' })
  }
  if (data.consent !== true) issues.push({ path: 'consent', code: 'consent' })

  const first = (type) => answers.find((answer) => answer.type === type && answer.value)?.value ?? null
  return {
    issues,
    answers,
    birthYear: yearCode ? null : Number(String(data.birthYear).trim()),
    // Tên phụ huynh chỉ lưu khi thật sự cần (dưới 16) — nháp còn sót thì bỏ.
    parentName: minor && form.allowMinors ? parentName : null,
    phone: first('phone'),
    email: first('email'),
  }
}
