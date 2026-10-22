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
  if (!isSameOrigin(req)) {
    res.status(403).json({ error: 'goc request khong hop le', origin: req.get('origin') ?? null })
    return
  }
  next()
}

/**
 * Host có thuộc dải private (loopback + RFC 1918) hay không — dùng để nhận diện
 * các Origin LAN khi chạy dev ở chế độ `--host`. Không xét IPv6 ULA; dev hiếm khi
 * dùng, và nếu cần thì bổ sung sau.
 */
function isPrivateHost(hostname) {
  if (!hostname) return false
  // `URL.hostname` trả IPv6 kèm ngoặc vuông: `[::1]`, không phải `::1`.
  if (hostname === 'localhost' || hostname === '[::1]') return true

  // Phải là IPv4 đủ bốn số. So bằng `startsWith('10.')` thì tên miền như
  // `10.evil.com` cũng lọt qua.
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname)
  if (!match) return false
  const [a, b] = match.slice(1, 3).map(Number)
  if (match.slice(1).some((part) => Number(part) > 255)) return false
  return a === 127 || a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
}

/**
 * Request có đến từ chính trang không. Dùng chung cho route quản trị và route ghi
 * công khai (form đăng ký, sự kiện thống kê) — `sendBeacon` cũng gửi `Origin`.
 *
 * Chấp nhận ba nhóm:
 *   1. `Sec-Fetch-Site: same-origin` — trình duyệt tự đặt, trang không sửa được.
 *   2. `Origin` trùng `config.siteOrigin` — gốc trang đã cấu hình (prod qua nginx).
 *   3. Ở chế độ phát triển, thêm mọi Origin có host thuộc dải private (loopback
 *      + 10/8 + 172.16/12 + 192.168/16). Cho phép `npm run dev -- --host` chia sẻ
 *      dashboard cho máy cùng mạng LAN mà không cần cấu hình nginx.
 *
 * Production KHÔNG dùng nhóm 3: whitelist đóng lại ở đúng gốc trang, mọi request
 * từ IP LAN sẽ bị từ chối y như trước.
 */
export function isSameOrigin(req) {
  const fetchSite = req.get('sec-fetch-site')
  if (fetchSite === 'same-origin') return true

  const origin = req.get('origin')
  if (!origin) return false

  let parsed
  try {
    parsed = new URL(origin)
  } catch {
    return false
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false

  if (origin === config.siteOrigin) return true

  if (!config.isProduction && isPrivateHost(parsed.hostname)) return true

  return false
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
