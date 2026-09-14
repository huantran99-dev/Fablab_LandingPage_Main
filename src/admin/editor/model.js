/**
 * Mô hình dữ liệu của form soạn mục.
 *
 * Form không sửa thẳng hai object `vi` / `en`. Nó giữ một **bản làm việc** gộp:
 *
 *   { id, vi: { trường dịch }, en: { trường dịch }, shared: { trường dùng chung } }
 *
 * rồi `fromWorking` dựng lại HAI mục khi bấm Áp dụng. Nhờ vậy trường dùng chung
 * không thể lệch giữa hai bản: nó chỉ tồn tại một lần trong bản làm việc.
 *
 * Mọi thao tác cấu trúc lên bản nháp (thêm, xoá, đổi thứ tự) đi qua `mapBoth` —
 * áp CÙNG một phép biến đổi lên cả hai ngôn ngữ. Giao diện không có đường nào thêm
 * một mục vào riêng bản tiếng Việt.
 */
import { ID_PATTERN, getPath, setPath, slugify, uniqueId } from '../lib/paths'

export const LOCALES = ['vi', 'en']

/** Mọi trường một danh sách có thể có: trường chung + trường của mọi kiểu. */
export function allFields(list) {
  const extra = list.variants?.options.flatMap((option) => option.fields) ?? []
  return [...list.fields, ...extra]
}

export function activeFields(list, variant) {
  const option = list.variants?.options.find((entry) => entry.value === variant)
  return [...list.fields, ...(option?.fields ?? [])]
}

function defaultFor(field) {
  switch (field.type) {
    case 'number':
      return 0
    case 'switch':
    case 'exclusive':
      return false
    case 'multiselect':
    case 'sublist':
      return []
    case 'href':
      return '#'
    default:
      return ''
  }
}

export function toWorking(fields, vi, en) {
  const working = { id: vi?.id ?? '', vi: {}, en: {}, shared: {} }
  for (const field of fields) {
    if (field.type === 'sublist') {
      const enRows = en?.[field.key] ?? []
      working.shared[field.key] = (vi?.[field.key] ?? []).map((row, index) =>
        toWorking(field.itemFields, row, enRows.find((other) => other.id === row.id) ?? enRows[index]),
      )
    } else if (field.translated) {
      working.vi[field.key] = vi?.[field.key] ?? ''
      working.en[field.key] = en?.[field.key] ?? ''
    } else {
      working.shared[field.key] = vi?.[field.key] ?? defaultFor(field)
    }
  }
  return working
}

export function fromWorking(fields, working, locale) {
  const out = { id: working.id }
  for (const field of fields) {
    const value = working.shared[field.key]
    if (field.type === 'sublist') {
      out[field.key] = (value ?? []).map((row) => fromWorking(field.itemFields, row, locale))
    } else if (field.translated) {
      out[field.key] = working[locale][field.key] ?? ''
    } else if (field.type === 'switch' || field.type === 'exclusive') {
      // Chỉ `true` hoặc vắng hẳn — giữ hình dạng dữ liệu y như bản seed.
      if (value) out[field.key] = true
    } else if (field.type === 'number') {
      out[field.key] = Number(value)
    } else {
      out[field.key] = value
    }
  }
  return out
}

/** Dòng con mới có id rỗng; điền id từ nhãn tiếng Việt lúc Áp dụng. */
export function fillSubIds(fields, working) {
  const shared = { ...working.shared }
  for (const field of fields) {
    if (field.type !== 'sublist') continue
    const used = new Set((shared[field.key] ?? []).map((row) => row.id).filter(Boolean))
    shared[field.key] = (shared[field.key] ?? []).map((row) => {
      if (row.id) return row
      const id = uniqueId(slugify(row.vi.label ?? row.vi.title ?? ''), used)
      used.add(id)
      return { ...row, id }
    })
  }
  return { ...working, shared }
}

/** Kiểm nhanh phía trình duyệt. Máy chủ vẫn là nơi quyết định; đây chỉ đỡ một vòng lưu hỏng. */
export function validateWorking(fields, working, { checkId = false, usedIds } = {}) {
  const errors = {}
  if (checkId) {
    if (!ID_PATTERN.test(working.id)) errors.id = 'Id chỉ gồm chữ thường không dấu, số và dấu gạch ngang.'
    else if (usedIds?.has(working.id)) errors.id = 'Id này đã có trong danh sách.'
  }

  for (const field of fields) {
    if (field.type === 'sublist') {
      const rows = working.shared[field.key] ?? []
      if (field.minItems && rows.length < field.minItems) errors[`shared.${field.key}`] = `Cần ít nhất ${field.minItems} mục.`
      rows.forEach((row, index) => {
        for (const [key, message] of Object.entries(validateWorking(field.itemFields, row))) {
          errors[`shared.${field.key}.${index}.${key}`] = message
        }
      })
      continue
    }
    if (field.optional) continue

    if (field.translated) {
      for (const locale of LOCALES) {
        if (!String(working[locale][field.key] ?? '').trim()) errors[`${locale}.${field.key}`] = 'Không được để trống.'
      }
      continue
    }

    const value = working.shared[field.key]
    if (field.type === 'number') {
      if (value === '' || !Number.isInteger(Number(value)) || Number(value) < 0) {
        errors[`shared.${field.key}`] = 'Phải là số nguyên không âm.'
      }
    } else if (['text', 'select', 'href', 'icon'].includes(field.type) && !String(value ?? '').trim()) {
      errors[`shared.${field.key}`] = 'Không được để trống.'
    }
  }
  return errors
}

/** Áp một phép biến đổi lên mảng ở `path` của CẢ HAI ngôn ngữ. */
export function mapBoth(draft, path, fn) {
  return {
    vi: setPath(draft.vi, path, fn(getPath(draft.vi, path) ?? [], 'vi')),
    en: setPath(draft.en, path, fn(getPath(draft.en, path) ?? [], 'en')),
  }
}

export function omitKey(object, key) {
  const { [key]: _removed, ...rest } = object
  return rest
}

/**
 * Lỗi máy chủ nằm dưới `prefix`, đổi thành map `${locale}.${đường còn lại}`.
 * `issues` là `{ vi: [{path, message}], en: [...] }` đúng như 422 trả về.
 */
export function issuesUnder(issues, prefix) {
  const out = {}
  if (!issues) return out
  for (const locale of LOCALES) {
    for (const issue of issues[locale] ?? []) {
      if (prefix && issue.path !== prefix && !issue.path.startsWith(`${prefix}.`)) continue
      const rest = prefix ? issue.path.slice(prefix.length + 1) : issue.path
      out[`${locale}.${rest}`] ??= issue.message
    }
  }
  return out
}

/** Map lỗi (dạng `${scope}.${đường}`) thu hẹp vào một nhánh con. */
export function narrow(errors, prefix) {
  const out = {}
  for (const [key, message] of Object.entries(errors)) {
    const dot = key.indexOf('.')
    const scope = key.slice(0, dot)
    const rest = key.slice(dot + 1)
    if (rest.startsWith(`${prefix}.`)) out[`${scope}.${rest.slice(prefix.length + 1)}`] = message
  }
  return out
}

export function hasIssuesUnder(issues, prefix) {
  return LOCALES.some((locale) => (issues?.[locale] ?? []).some((issue) => issue.path.startsWith(`${prefix}.`)))
}

/** Đường khoá kỹ thuật -> câu người đọc được, cho thông báo lỗi. */
export function describePath(descriptor, draft, path) {
  for (const list of descriptor.lists) {
    if (!path.startsWith(`${list.path}.`)) continue
    const [indexText, ...rest] = path.slice(list.path.length + 1).split('.')
    const item = getPath(draft.vi, list.path)?.[Number(indexText)]
    const field = allFields(list).find((entry) => entry.key === rest[0])
    const name = item ? (item[list.titleField] || item.id) : `#${indexText}`
    return [list.title, name, field?.label ?? rest.join('.')].filter(Boolean).join(' › ')
  }
  for (const group of descriptor.groups) {
    const field = group.fields.find((entry) => entry.key === path)
    if (field) return `${group.title} › ${field.label}`
  }
  return path || descriptor.label
}
