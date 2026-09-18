/**
 * Số liệu cho trang Thống kê.
 *
 * "Khách" ở đây là LƯỢT KHÁCH THEO NGÀY: muối băm đổi mỗi ngày (`analytics/track.js`),
 * nên một người quay lại ba ngày được đếm ba lần. Mọi con số khách đều là tổng theo
 * ngày, và mọi phép đếm "khách duy nhất" đều đếm cặp (ngày, mã khách).
 *
 * Số ĐĂNG KÝ lấy từ bảng `registration` — đó là số thật admin đang phải xử lý, kể cả
 * người bật chống theo dõi. Tỉ lệ chuyển đổi thì lấy từ sự kiện, để tử số và mẫu số
 * cùng một tập người được đếm.
 */
import { Router } from 'express'

import { dayKey } from '../analytics/track.js'
import { requireSameOrigin, requireSession } from '../auth/middleware.js'
import { config } from '../config.js'
import { getContent } from '../content/cache.js'
import { getDb } from '../db/index.js'

export const statsRouter = Router()

statsRouter.use('/stats', requireSameOrigin, requireSession)

const RANGES = { '7d': 7, '30d': 30, '90d': 90 }

/** Ngày Việt Nam của một mốc ISO — cùng cách chia ngày với bảng `event`. */
const VN_DAY = "date(created_at, '+7 hours')"

const ratio = (part, whole) => (whole > 0 ? Math.round((part / whole) * 1000) / 1000 : null)

statsRouter.get('/stats', (req, res) => {
  const range = typeof req.query.range === 'string' ? req.query.range : '30d'
  if (!Object.hasOwn(RANGES, range)) {
    res.status(400).json({ error: 'range phai la 7d, 30d hoac 90d', range })
    return
  }

  const db = getDb()
  const length = RANGES[range]
  const now = Date.now()
  const days = Array.from({ length }, (_, index) => dayKey(new Date(now - (length - 1 - index) * 86_400_000)))
  const from = days[0]
  const to = days.at(-1)
  const fromIso = new Date(`${from}T00:00:00+07:00`).toISOString()

  const perDay = new Map(days.map((day) => [day, { day, views: 0, visitors: 0, registrations: 0 }]))
  for (const row of db
    .prepare(
      `SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors
         FROM event WHERE name = 'pageview' AND day >= ? GROUP BY day`,
    )
    .all(from)) {
    const slot = perDay.get(row.day)
    if (slot) Object.assign(slot, { views: row.views, visitors: row.visitors })
  }
  for (const row of db
    .prepare(`SELECT ${VN_DAY} AS day, COUNT(*) AS n FROM registration WHERE created_at >= ? GROUP BY day`)
    .all(fromIso)) {
    const slot = perDay.get(row.day)
    if (slot) slot.registrations = row.n
  }
  const series = [...perDay.values()]

  const visitorDays = (name, extra = '') =>
    db
      .prepare(`SELECT COUNT(DISTINCT day || '|' || visitor) AS n FROM event WHERE name = ? AND day >= ? ${extra}`)
      .get(name, from).n
  const count = (name) => db.prepare('SELECT COUNT(*) AS n FROM event WHERE name = ? AND day >= ?').get(name, from).n

  const views = series.reduce((sum, day) => sum + day.views, 0)
  const visitors = series.reduce((sum, day) => sum + day.visitors, 0)
  const registrations = series.reduce((sum, day) => sum + day.registrations, 0)
  const submitVisitors = visitorDays('register_submit')

  const titles = new Map((getContent().vi.courses?.items ?? []).map((item) => [item.id, item.title]))
  const courses = new Map()
  const course = (id) => {
    if (!courses.has(id)) {
      courses.set(id, { courseId: id, title: titles.get(id) ?? null, opens: 0, openVisitors: 0, converted: 0, registrations: 0 })
    }
    return courses.get(id)
  }
  for (const row of db
    .prepare(
      `SELECT target, COUNT(*) AS opens, COUNT(DISTINCT day || '|' || visitor) AS openVisitors
         FROM event WHERE name = 'course_open' AND day >= ? AND target IS NOT NULL GROUP BY target`,
    )
    .all(from)) {
    Object.assign(course(row.target), { opens: row.opens, openVisitors: row.openVisitors })
  }
  // Mở popup của khóa X rồi gửi đăng ký khóa X trong cùng ngày.
  for (const row of db
    .prepare(
      `SELECT o.target, COUNT(DISTINCT o.day || '|' || o.visitor) AS n
         FROM event o
        WHERE o.name = 'course_open' AND o.day >= ? AND o.target IS NOT NULL
          AND EXISTS (SELECT 1 FROM event s
                       WHERE s.name = 'register_submit' AND s.day = o.day
                         AND s.visitor = o.visitor AND s.target = o.target)
        GROUP BY o.target`,
    )
    .all(from)) {
    course(row.target).converted = row.n
  }
  for (const row of db
    .prepare(
      `SELECT course_id AS courseId, MAX(course_title) AS title, COUNT(*) AS n
         FROM registration WHERE created_at >= ? AND course_id IS NOT NULL GROUP BY course_id`,
    )
    .all(fromIso)) {
    const entry = course(row.courseId)
    entry.registrations = row.n
    entry.title ??= row.title
  }

  res.json({
    range,
    from,
    to,
    days: series,
    totals: {
      views,
      visitors,
      registrations,
      courseOpens: count('course_open'),
      ctaClicks: count('cta_click'),
      registerOpens: count('register_open'),
      conversion: ratio(submitVisitors, visitorDays('pageview')),
    },
    referrers: db
      .prepare(
        `SELECT ref_host AS host, COUNT(*) AS views FROM event
          WHERE name = 'pageview' AND day >= ? GROUP BY ref_host ORDER BY views DESC LIMIT 10`,
      )
      .all(from),
    devices: db
      .prepare(
        `SELECT device, COUNT(DISTINCT day || '|' || visitor) AS visitors FROM event
          WHERE name = 'pageview' AND day >= ? GROUP BY device ORDER BY visitors DESC`,
      )
      .all(from),
    languages: db
      .prepare(
        `SELECT lang, COUNT(*) AS views FROM event
          WHERE name = 'pageview' AND day >= ? GROUP BY lang ORDER BY views DESC`,
      )
      .all(from),
    ctas: db
      .prepare(
        `SELECT target AS cta, COUNT(*) AS clicks FROM event
          WHERE name = 'cta_click' AND day >= ? GROUP BY target ORDER BY clicks DESC`,
      )
      .all(from),
    courses: [...courses.values()]
      .map(({ converted, ...entry }) => ({ ...entry, conversion: ratio(converted, entry.openVisitors) }))
      .sort((a, b) => b.opens - a.opens || b.registrations - a.registrations),
    retentionDays: config.analyticsRetentionDays,
  })
})
