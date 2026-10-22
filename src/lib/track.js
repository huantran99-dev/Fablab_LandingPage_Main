/**
 * Gửi sự kiện thống kê về máy chủ của chính trang — không cookie, không
 * localStorage, không mã định danh nào lưu ở trình duyệt.
 *
 * Máy chủ tự nhận diện "khách trong ngày" bằng mã băm có muối đổi theo ngày; phía
 * này chỉ gửi tên sự kiện và vài thông tin thô (ngôn ngữ, bề rộng khung nhìn).
 *
 * Người dùng bật Do Not Track hoặc Global Privacy Control thì không gửi gì cả. Số
 * liệu vì thế thấp hơn thực tế một chút — trang Thống kê trong dashboard ghi rõ.
 *
 * Mọi lỗi đều nuốt im lặng: thống kê hỏng không bao giờ được làm hỏng trang.
 */
const ENDPOINT = '/api/events'

function optedOut() {
  try {
    return navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1'
  } catch {
    return true
  }
}

/** Nguồn truy cập: `utm_source` nếu có, không thì tên host của trang giới thiệu. */
function referrerHost() {
  try {
    const utm = new URLSearchParams(window.location.search).get('utm_source')
    if (utm) return `utm:${utm.toLowerCase().slice(0, 60)}`
    if (!document.referrer) return undefined
    const url = new URL(document.referrer)
    // Chỉ giữ tên host — đường dẫn và query của trang giới thiệu có thể chứa dữ liệu cá nhân.
    return url.host === window.location.host ? undefined : url.hostname
  } catch {
    return undefined
  }
}

/** Nguồn truy cập đi kèm lượt đăng ký — cũng tôn trọng DNT/GPC như mọi sự kiện. */
export function registrationReferrer() {
  return optedOut() ? undefined : referrerHost()
}

function send(payload) {
  const body = JSON.stringify(payload)
  try {
    // Gửi CHUỖI (thành `text/plain`), không gửi Blob `application/json`: Chromium từng
    // ném lỗi với Blob mang kiểu không thuộc nhóm CORS-safelisted.
    if (navigator.sendBeacon?.(ENDPOINT, body)) return
  } catch {
    // rơi xuống fetch
  }
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      body,
      keepalive: true,
      credentials: 'omit',
      headers: { 'content-type': 'text/plain' },
    }).catch(() => {})
  } catch {
    // bỏ qua
  }
}

const base = () => ({ l: document.documentElement.lang, w: window.innerWidth })

/**
 * Ghi một tương tác. `name`: `course_open` | `cta_click` | `register_open`.
 * `target`: id khóa học, id nút (xem `CTA_IDS` ở `server/routes/public.write.js`),
 * hoặc nguồn mở form. Máy chủ bỏ im lặng mọi giá trị nằm ngoài danh sách.
 */
export function track(name, target) {
  if (optedOut()) return
  send({ ...base(), n: name, t: target })
}

let pageviewSent = false

/**
 * Một lượt xem trang. Chạy lúc trình duyệt rảnh, ngoài đường găng của lần vẽ đầu.
 * Cờ `pageviewSent` chặn StrictMode gọi effect hai lần ở chế độ phát triển.
 */
export function trackPageview() {
  if (pageviewSent || optedOut()) return
  pageviewSent = true
  const run = () => send({ ...base(), n: 'pageview', r: referrerHost() })
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 4000 })
  else setTimeout(run, 1500)
}
