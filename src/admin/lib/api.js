/**
 * Lớp gọi API của dashboard.
 *
 * CSRF token đi kèm mọi request không phải GET. Token đến từ `/api/auth/session`
 * (hoặc từ lượt đăng nhập) và được giữ trong module này — không cất vào
 * `localStorage`: nó gắn với phiên hiện tại, cất lâu dài chỉ tạo thêm chỗ để lệch.
 */

let csrfToken = null

export function setCsrfToken(token) {
  csrfToken = token ?? null
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? `HTTP ${status}`)
    this.status = status
    this.body = body ?? {}
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['content-type'] = 'application/json'
  if (method !== 'GET' && csrfToken) headers['x-csrf-token'] = csrfToken

  const response = await fetch(path, {
    method,
    headers,
    // Cookie phiên là `HttpOnly`, nên phải nói rõ là gửi kèm cookie.
    credentials: 'same-origin',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const text = await response.text()
  const parsed = text ? JSON.parse(text) : null

  if (!response.ok) throw new ApiError(response.status, parsed)
  return parsed
}

export const api = {
  session: () => request('/api/auth/session'),
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: { username, password } }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),

  editableSections: () => request('/api/admin/sections'),
  readSection: (section) => request(`/api/admin/content/${section}`),
  writeSection: (section, payload) =>
    request(`/api/admin/content/${section}`, { method: 'PUT', body: payload }),

  history: (section) => request(`/api/admin/history/${section}`),
  restore: (id) => request(`/api/admin/history/${id}/restore`, { method: 'POST' }),
}
