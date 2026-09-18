/**
 * Ghi sự kiện thống kê — không cookie, không lưu IP.
 *
 * Khách được nhận diện bằng `sha256(muối trong ngày | IP | UA)` cắt 16 ký tự. Muối
 * ngẫu nhiên, đổi mỗi ngày, và muối cũ bị xoá (`retention.js`): qua ngày hôm sau
 * thì kể cả người giữ database cũng không nối được mã băm về một IP nào.
 *
 * Hệ quả phải nói rõ ở mọi nơi hiện số liệu: "khách" chỉ DUY NHẤT TRONG MỘT NGÀY.
 * Số khách của 30 ngày là tổng khách từng ngày (lượt khách theo ngày), không phải
 * số người khác nhau trong 30 ngày.
 */
import { createHash, randomBytes } from 'node:crypto'

/** Trần sự kiện một ngày: một đợt dội request không được phình database vô hạn. */
const DAILY_EVENT_CAP = 50_000

const BOT_UA = /bot|crawl|spider|slurp|headless|lighthouse|curl|wget|python|httpclient|axios|node-fetch|go-http|java\/|okhttp|scrapy|phantom/i

/** Ngày theo giờ Việt Nam (UTC+7, không có giờ mùa hè). */
export function dayKey(date = new Date()) {
  return new Date(date.getTime() + 7 * 3600_000).toISOString().slice(0, 10)
}

export function isBot(ua) {
  return !ua || BOT_UA.test(ua)
}

/** Người dùng bật "Do Not Track" hoặc Global Privacy Control: không đếm. */
export function optedOut(req) {
  return req.get('dnt') === '1' || req.get('sec-gpc') === '1'
}

/** Loại thiết bị theo bề rộng khung nhìn; thiếu thì đoán từ UA. */
export function deviceOf(width, ua = '') {
  if (Number.isFinite(width) && width > 0) {
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  if (/mobi|android|iphone/i.test(ua)) return 'mobile'
  return 'desktop'
}

/**
 * Chuẩn hoá nguồn truy cập về tên host (hoặc `utm:<nguồn>`). Không bao giờ giữ
 * đường dẫn hay query của trang giới thiệu — chúng có thể chứa dữ liệu cá nhân.
 */
export function normalizeRef(value) {
  if (typeof value !== 'string') return null
  const ref = value.trim().toLowerCase().replace(/^www\./, '')
  return /^(utm:)?[a-z0-9][a-z0-9.-]{0,99}$/.test(ref) ? ref : null
}

function getSalt(db, day) {
  db.prepare('INSERT OR IGNORE INTO analytics_salt (day, salt) VALUES (?, ?)').run(day, randomBytes(32))
  return db.prepare('SELECT salt FROM analytics_salt WHERE day = ?').get(day).salt
}

function visitorHash(db, req, day) {
  return createHash('sha256')
    .update(getSalt(db, day))
    .update(`|${req.ip ?? ''}|${req.get('user-agent') ?? ''}`)
    .digest('hex')
    .slice(0, 16)
}

// Đếm trong bộ nhớ, nạp lại từ database khi sang ngày mới hoặc khởi động lại.
let counter = { day: null, count: 0 }

/**
 * Ghi một sự kiện. Trả `false` khi bị bỏ (bot, người dùng từ chối, vượt trần).
 * Người gọi quyết định có báo lại hay không — route công khai luôn im lặng.
 */
export function recordEvent(db, req, { name, target = null, ref = null, width, lang = null }) {
  const ua = req.get('user-agent') ?? ''
  if (isBot(ua) || optedOut(req)) return false

  const now = new Date()
  const day = dayKey(now)
  if (counter.day !== day) {
    counter = { day, count: db.prepare('SELECT COUNT(*) AS n FROM event WHERE day = ?').get(day).n }
  }
  if (counter.count >= DAILY_EVENT_CAP) return false

  db.prepare(
    `INSERT INTO event (day, at, name, visitor, target, ref_host, device, lang)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    day,
    now.toISOString(),
    name,
    visitorHash(db, req, day),
    target,
    normalizeRef(ref),
    deviceOf(width, ua),
    lang === 'vi' || lang === 'en' ? lang : null,
  )
  counter.count += 1
  return true
}
