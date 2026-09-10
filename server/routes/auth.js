/**
 * Đăng nhập, đăng xuất, trạng thái phiên, đổi mật khẩu.
 *
 * Giới hạn số lần thử có HAI tầng, vì một tầng là không đủ:
 *   - theo IP (`express-rate-limit`) chặn dò dồn dập từ một chỗ;
 *   - theo TÀI KHOẢN (`failed_count`/`locked_until` trong database) chặn kẻ đổi IP
 *     liên tục, vốn đi thẳng qua tầng trên.
 * Với đúng một tài khoản thì không có chuyện bị người khác khoá mất, nên không
 * phải đánh đổi gì.
 */
import { Router } from 'express'
import rateLimit from 'express-rate-limit'

import { getAdmin, hashPassword, setPassword, verifyPassword } from '../auth/password.js'
import { requireCsrf, requireSameOrigin, requireSession } from '../auth/middleware.js'
import {
  COOKIE_NAME,
  CSRF_COOKIE,
  cookieOptions,
  createSession,
  destroyAllSessions,
  destroySession,
  newCsrfToken,
  readSession,
} from '../auth/session.js'

export const authRouter = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'thu qua nhieu lan, doi mot lat' },
})

/** Đặt cookie phiên + cookie CSRF. Cookie CSRF CỐ Ý đọc được từ JS. */
function issueCookies(res) {
  const csrf = newCsrfToken()
  res.cookie(CSRF_COOKIE, csrf, { ...cookieOptions(), httpOnly: false })
  return csrf
}

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body ?? {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'thieu ten dang nhap hoac mat khau' })
    return
  }

  const { ok, lockedMs } = await verifyPassword(username, password)
  if (!ok) {
    // KHÔNG phân biệt "sai tài khoản" với "sai mật khẩu": nói ra là tặng không
    // nửa thông tin cho người đang dò.
    const body = { error: 'ten dang nhap hoac mat khau khong dung' }
    if (lockedMs > 0) body.lockedSeconds = Math.ceil(lockedMs / 1000)
    console.warn(`dang nhap that bai tu ${req.ip} — ${req.get('user-agent') ?? '?'}`)
    res.status(401).json(body)
    return
  }

  const token = createSession({ ip: req.ip, userAgent: req.get('user-agent') })
  res.cookie(COOKIE_NAME, token, cookieOptions())
  const csrfToken = issueCookies(res)

  res.json({ authenticated: true, username: getAdmin().username, csrfToken })
})

authRouter.post('/logout', requireSameOrigin, requireSession, (req, res) => {
  destroySession(req.cookies?.[COOKIE_NAME])
  res.clearCookie(COOKIE_NAME, { path: '/' })
  res.clearCookie(CSRF_COOKIE, { path: '/' })
  res.json({ authenticated: false })
})

/**
 * Trạng thái phiên. Không yêu cầu đăng nhập — trả `authenticated: false` là câu
 * trả lời hợp lệ, dashboard dùng nó để quyết định hiện trang đăng nhập hay không.
 */
authRouter.get('/session', (req, res) => {
  const session = readSession(req.cookies?.[COOKIE_NAME])
  if (!session) {
    res.json({ authenticated: false })
    return
  }

  // Cấp lại CSRF token mỗi lần hỏi: tải lại trang là dashboard có token mới, không
  // phải giữ token cũ qua nhiều phiên làm việc.
  const csrfToken = issueCookies(res)
  res.json({ authenticated: true, username: getAdmin()?.username ?? null, csrfToken })
})

authRouter.post('/password', requireSameOrigin, requireSession, requireCsrf, async (req, res) => {
  const { current, next: nextPassword } = req.body ?? {}
  if (typeof current !== 'string' || typeof nextPassword !== 'string') {
    res.status(400).json({ error: 'thieu mat khau hien tai hoac mat khau moi' })
    return
  }
  if (nextPassword.length < 12) {
    res.status(400).json({ error: 'mat khau moi phai it nhat 12 ky tu' })
    return
  }

  const admin = getAdmin()
  const { ok } = await verifyPassword(admin.username, current)
  if (!ok) {
    res.status(401).json({ error: 'mat khau hien tai khong dung' })
    return
  }

  setPassword(await hashPassword(nextPassword))
  // Đổi mật khẩu là đăng xuất MỌI NƠI, kể cả phiên đang thao tác.
  destroyAllSessions()
  res.clearCookie(COOKIE_NAME, { path: '/' })
  res.json({ ok: true, message: 'da doi mat khau, dang nhap lai' })
})
