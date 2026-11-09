/**
 * Kiểm form tự tạo phía trình duyệt (API 23). Cùng luật với `server/schema/formSubmission.js`
 * — cố ý chép hai nơi (như `normalizePhone`), đổi một bên phải đổi bên kia. Máy chủ vẫn là nơi
 * quyết định; đây chỉ để báo lỗi ngay khi gõ.
 *
 * Khoá lỗi: `answers.<id ô>`, `birthYear`, `parentName`, `consent` — trùng `path` máy chủ trả
 * về trong 422, nên lỗi hai phía gộp được vào một bảng.
 */
import { MEMBER_MIN_AGE, eventBirthYearError, needsParent, normalizePhone } from '../register/validate'

export const LIMITS = { text: 200, textarea: 2000, phone: 20, email: 160, number: 20, date: 10, parentName: 120 }
const PHONE = /^0\d{9,10}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NUMBER = /^-?\d+(?:[.,]\d+)?$/

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

/** Mã lỗi của một ô, hoặc `null`. */
export function answerError(field, raw) {
  const type = field.fieldType
  if (type === 'checkbox') return field.required && raw !== true ? 'required' : null
  if (type === 'multiselect') return field.required && !(raw?.length > 0) ? 'required' : null

  let value = String(raw ?? '').trim()
  if (type !== 'textarea') value = value.replace(/\s+/g, ' ')
  if (!value) return field.required ? 'required' : null
  switch (type) {
    case 'phone':
      return PHONE.test(normalizePhone(value)) ? null : 'phone'
    case 'email':
      if (value.length > LIMITS.email) return 'tooLong'
      return EMAIL.test(value) ? null : 'email'
    case 'number':
      return value.length <= LIMITS.number && NUMBER.test(value) ? null : 'invalid'
    case 'date':
      return validDate(value) ? null : 'invalid'
    case 'select':
      return (field.options ?? []).some((option) => option.id === value) ? null : 'invalid'
    default:
      return value.length <= (LIMITS[type] ?? LIMITS.text) ? null : 'tooLong'
  }
}

/** Form có bật nhận người dưới 16 và năm sinh vừa nhập cho ra dưới 16 → cần tên phụ huynh. */
export function formNeedsParent(form, birthYear) {
  return Boolean(form?.allowMinors) && needsParent(birthYear)
}

export function validateCustomForm(form, draft, now = new Date()) {
  const errors = {}
  for (const field of form.fields ?? []) {
    const code = answerError(field, draft.answers[field.id])
    if (code) errors[`answers.${field.id}`] = code
  }
  const yearCode = eventBirthYearError(draft.birthYear, now)
  if (yearCode) errors.birthYear = yearCode
  else if (!form.allowMinors && now.getFullYear() - Number(String(draft.birthYear).trim()) < MEMBER_MIN_AGE) {
    errors.birthYear = 'age'
  }
  if (formNeedsParent(form, draft.birthYear)) {
    const parent = String(draft.parentName ?? '').trim()
    if (!parent) errors.parentName = 'required'
    else if (parent.length > LIMITS.parentName) errors.parentName = 'tooLong'
  }
  if (draft.consent !== true) errors.consent = 'consent'
  return errors
}

/** Thứ tự lỗi trong hộp tóm tắt = thứ tự trên form. */
export function errorOrder(form) {
  return [...(form.fields ?? []).map((field) => `answers.${field.id}`), 'birthYear', 'parentName', 'consent']
}
