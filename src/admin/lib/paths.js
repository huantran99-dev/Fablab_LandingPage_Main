/**
 * Đọc/ghi theo đường khoá dạng `social.items.0.href` — cùng dạng với `path` trong
 * lỗi máy chủ trả về, nên một chuỗi dùng được cho cả dữ liệu lẫn lỗi.
 *
 * `setPath` KHÔNG sửa tại chỗ: bản nháp là state React, phải đổi tham chiếu thì
 * giao diện mới vẽ lại.
 */
export function getPath(object, path) {
  if (!path) return object
  return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), object)
}

export function setPath(object, path, value) {
  if (!path) return value
  const [head, ...rest] = path.split('.')
  const base = object ?? (/^\d+$/.test(head) ? [] : {})
  const copy = Array.isArray(base) ? [...base] : { ...base }
  copy[head] = rest.length > 0 ? setPath(base[head], rest.join('.'), value) : value
  return copy
}

/** Đúng luật `idSchema` của máy chủ. */
export const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/

/** Id gợi ý từ tiêu đề tiếng Việt. `đ` phải xử lý riêng — NFD không tách được nó. */
export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '')
}

export function uniqueId(base, used) {
  const root = base || 'muc-moi'
  if (!used.has(root)) return root
  let n = 2
  while (used.has(`${root}-${n}`)) n += 1
  return `${root}-${n}`
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}
