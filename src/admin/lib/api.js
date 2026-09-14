/**
 * Lớp gọi API của dashboard.
 *
 * CSRF token đi kèm mọi request không phải GET. Token đến từ `/api/auth/session`
 * (hoặc từ lượt đăng nhập) và được giữ trong module này — không cất vào
 * `localStorage`: nó gắn với phiên hiện tại, cất lâu dài chỉ tạo thêm chỗ để lệch.
 *
 * Hết phiên giữa chừng (401 trên route quản trị) thì báo lên một chỗ duy nhất để
 * App đưa về trang đăng nhập, thay vì mỗi trang tự hiện một lỗi khó hiểu.
 */

let csrfToken = null
let unauthorizedHandler = null

export function setCsrfToken(token) {
  csrfToken = token ?? null
}

export function onUnauthorized(handler) {
  unauthorizedHandler = handler
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? `HTTP ${status}`)
    this.status = status
    this.body = body ?? {}
  }
}

async function request(path, { method = 'GET', body, raw, headers: extra = {} } = {}) {
  const headers = { ...extra }
  if (body !== undefined) headers['content-type'] = 'application/json'
  if (method !== 'GET' && csrfToken) headers['x-csrf-token'] = csrfToken

  const response = await fetch(path, {
    method,
    headers,
    // Cookie phiên là `HttpOnly`, nên phải nói rõ là gửi kèm cookie.
    credentials: 'same-origin',
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  })

  const text = await response.text()
  let parsed = null
  if (text) {
    try {
      parsed = JSON.parse(text)
    } catch {
      // Proxy hay máy chủ chết có thể trả HTML; đừng để lỗi phân tích che mất mã HTTP.
      parsed = { error: `May chu tra ve noi dung khong phai JSON (HTTP ${response.status})` }
    }
  }

  if (!response.ok) {
    if (response.status === 401 && path.startsWith('/api/admin/')) unauthorizedHandler?.()
    throw new ApiError(response.status, parsed)
  }
  return parsed
}

export const api = {
  session: () => request('/api/auth/session'),
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  changePassword: (current, next) => request('/api/auth/password', { method: 'POST', body: { current, next } }),

  meta: () => request('/api/admin/meta'),

  readSection: (section) => request(`/api/admin/content/${section}`),
  writeSection: (section, payload) => request(`/api/admin/content/${section}`, { method: 'PUT', body: payload }),
  history: (section) => request(`/api/admin/history/${section}`),
  restore: (id) => request(`/api/admin/history/${id}/restore`, { method: 'POST' }),

  media: () => request('/api/admin/media'),
  uploadMedia: (file) =>
    request('/api/admin/media', {
      method: 'POST',
      raw: file,
      headers: {
        'content-type': file.type || 'application/octet-stream',
        'x-filename': encodeURIComponent(file.name),
      },
    }),
  updateMedia: (id, sourceNote) => request(`/api/admin/media/${id}`, { method: 'PATCH', body: { sourceNote } }),
  deleteMedia: (id) => request(`/api/admin/media/${id}`, { method: 'DELETE' }),

  courseDetail: (id) => request(`/api/admin/course-details/${encodeURIComponent(id)}`),
  saveCourseDetail: (id, body) =>
    request(`/api/admin/course-details/${encodeURIComponent(id)}`, { method: 'PUT', body }),
}

/** Gom lỗi của một lượt lưu thành một câu đọc được, cho toast. */
export function describeError(error) {
  if (!(error instanceof ApiError)) return error?.message ?? 'Lỗi không xác định'
  if (error.status === 409) return 'Nội dung đã bị sửa ở nơi khác (tab khác?). Tải lại để lấy bản mới.'
  if (error.status === 413) return 'File quá lớn (tối đa 15 MB).'
  if (error.status === 0 || error.status >= 500) return 'Máy chủ gặp lỗi. Thử lại sau.'
  return error.message
}
