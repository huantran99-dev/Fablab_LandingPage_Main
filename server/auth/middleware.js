/**
 * Chốt chặn cho mọi route quản trị: phiên đăng nhập, gốc request, và CSRF.
 *
 * Ba lớp chống CSRF chồng lên nhau, tổng cộng chưa tới 40 dòng:
 *
 *   1. `SameSite=Lax` trên cookie phiên — trình duyệt hiện hành không gửi cookie
 *      kèm POST từ site khác.
 *   2. **Kiểm `Origin`** trên mọi request không phải GET. Đây mới là lớp chịu lực.
 *   3. **Double-submit token**: một giá trị ngẫu nhiên vừa nằm trong cookie đọc
 *      được vừa phải gửi lại ở header, so bằng thời gian hằng định.
 *
 * Lớp 3 thừa nếu 1 và 2 còn nguyên. Giữ vì nó gần như không tốn gì, và vì nếu về
 * sau ứng dụng nằm sau một proxy chia đường dẫn chung gốc với thứ khác thì 1 và 2
 * đều yếu đi, còn 3 thì không.
 */
import { config } from '../config.js'
import { COOKIE_NAME, CSRF_COOKIE, readSession, safeEqual } from './session.js'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export function requireSession(req, res, next) {
  const session = readSession(req.cookies?.[COOKIE_NAME])
  if (!session) {
    res.status(401).json({ error: 'chua dang nhap' })
    return
  }
  req.session = session
  next()
}

/**
 * Chỉ chấp nhận request không-GET đến từ đúng gốc của trang.
 *
 * `Sec-Fetch-Site: same-origin` được dùng làm bằng chứng phụ vì trình duyệt tự
 * đặt và trang web không sửa được. Thiếu cả `Origin` lẫn `Sec-Fetch-Site` thì từ
 * chối: đó thường là request không phải từ trình duyệt.
 */
export function requireSameOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  const origin = req.get('origin')
  const fetchSite = req.get('sec-fetch-site')

  const allowed = [config.siteOrigin, `http://127.0.0.1:${config.port}`, `http://localhost:${config.port}`]
  const ok = (origin && allowed.includes(origin)) || fetchSite === 'same-origin'

  if (!ok) {
    res.status(403).json({ error: 'goc request khong hop le', origin: origin ?? null })
    return
  }
  next()
}

export function requireCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  const fromCookie = req.cookies?.[CSRF_COOKIE]
  const fromHeader = req.get('x-csrf-token')

  if (!fromCookie || !safeEqual(fromCookie, fromHeader)) {
    res.status(403).json({ error: 'thieu hoac sai CSRF token' })
    return
  }
  next()
}
