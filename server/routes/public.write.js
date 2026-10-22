/**
 * Hai route GHI duy nhất không cần đăng nhập: form đăng ký và sự kiện thống kê.
 *
 * **Mount TRƯỚC `express.json({ limit: '2mb' })` trong app.js.** Mỗi route tự đọc
 * thân với giới hạn nhỏ của riêng nó (8 KB / 2 KB); mount sau thì bộ đọc chung đã
 * nuốt thân với giới hạn 2 MB từ trước.
 *
 * **Không route nào ở đây được đụng tới `section`, `content_counter` hay gọi
 * `invalidate()`.** Đổi `rev` nội dung là phá bộ đệm của mọi người đang xem trang
 * — mỗi lượt đăng ký sẽ buộc cả thế giới tải lại toàn bộ nội dung.
 *
 * Không có CSRF token vì không có phiên để giả mạo. Chốt nguồn gốc vẫn giữ: chặn
 * site khác nhúng form của ta, và lọc phần lớn request không đến từ trình duyệt.
 */
import express, { Router } from 'express'
import rateLimit from 'express-rate-limit'

import { dayKey, isBot, normalizeRef, recordEvent } from '../analytics/track.js'
import { isSameOrigin } from '../auth/middleware.js'
import { config } from '../config.js'
import { getContent } from '../content/cache.js'
import { getDb } from '../db/index.js'
import { REGISTRATION_SOURCES, registrationIssues, registrationSchema } from '../schema/registration.js'

export const publicWriteRouter = Router()

/** Dưới ngưỡng này thì gần như chắc chắn là máy điền. Client tự chờ cho đủ. */
const MIN_FILL_MS = 3000
const DEDUPE_MS = 10 * 60_000

const CLIENT_EVENTS = new Set(['pageview', 'course_open', 'cta_click', 'register_open'])
/** Id các nút kêu gọi hành động. Cùng danh sách với `CTA` trong `src/lib/track.js`. */
export const CTA_IDS = new Set([
  'nav',
  'nav-drawer',
  'hero-primary',
  'hero-secondary',
  'final-primary',
  'final-secondary',
  'course-modal',
])

function requirePublicOrigin(req, res, next) {
  if (!isSameOrigin(req)) {
    res.status(403).json({ error: 'goc request khong hop le' })
    return
  }
  next()
}

const limiterDefaults = { standardHeaders: 'draft-7', legacyHeaders: false }

const registrationBurst = rateLimit({
  ...limiterDefaults,
  windowMs: 10 * 60_000,
  limit: 5,
  message: { error: 'gui qua nhieu lan', code: 'rateLimited' },
})
const registrationDaily = rateLimit({
  ...limiterDefaults,
  windowMs: 24 * 3600_000,
  limit: 20,
  message: { error: 'gui qua nhieu lan', code: 'rateLimited' },
})
// Vượt giới hạn thì bỏ im lặng: sự kiện thống kê không đáng để báo lỗi cho ai.
const eventLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: false,
  legacyHeaders: false,
  handler: (_req, res) => res.status(204).end(),
})

/** Mốc 0 giờ (giờ Việt Nam) của ngày hôm nay, dạng ISO UTC để so với `created_at`. */
function startOfTodayIso() {
  return new Date(`${dayKey()}T00:00:00+07:00`).toISOString()
}

const fill = (template, values) =>
  String(template ?? '').replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match)

publicWriteRouter.post(
  '/registrations',
  requirePublicOrigin,
  registrationBurst,
  registrationDaily,
  express.json({ limit: '8kb' }),
  (req, res) => {
    const parsed = registrationSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(422).json({ error: 'du lieu khong hop le', issues: registrationIssues(parsed.error) })
      return
    }
    const data = parsed.data

    // Bot: trả "thành công" để nó không học được gì, và không lưu gì cả.
    if (data.website || (data.elapsed ?? 0) < MIN_FILL_MS || isBot(req.get('user-agent'))) {
      res.status(201).json({ ok: true })
      return
    }

    const db = getDb()
    const received = db
      .prepare('SELECT COUNT(*) AS n FROM registration WHERE created_at >= ?')
      .get(startOfTodayIso()).n
    if (received >= config.registrationDailyCap) {
      console.warn(`[registration] cham tran ${config.registrationDailyCap} dang ky/ngay, tam ngung nhan`)
      res.status(503).json({ error: 'tam ngung nhan dang ky', code: 'paused' })
      return
    }

    const courseId = data.course || null
    const now = new Date()
    const duplicate = db
      .prepare(
        `SELECT 1 FROM registration
          WHERE phone = ? AND COALESCE(course_id, '') = ? AND created_at > ?`,
      )
      .get(data.phone, courseId ?? '', new Date(now.getTime() - DEDUPE_MS).toISOString())
    if (duplicate) {
      // Bấm đúp hoặc gửi lại sau lỗi mạng: người gửi thấy thành công, database giữ một dòng.
      res.status(201).json({ ok: true })
      return
    }

    // Tên khóa và câu đồng ý lấy từ nội dung phía máy chủ, không bao giờ tin client.
    const content = getContent()
    const course = courseId ? content.vi.courses?.items?.find((item) => item.id === courseId) : null
    const dict = content[data.locale]
    const consentText = [
      dict.register?.consent,
      fill(dict.register?.privacy, { email: dict.footer?.contact?.email }),
    ]
      .filter(Boolean)
      .join('\n\n')

    const stamp = now.toISOString()
    db.transaction(() => {
      db.prepare(
        `INSERT INTO registration
           (created_at, updated_at, status, course_id, course_title, locale,
            student_name, student_grade, school, parent_name, phone, email, note,
            source, referrer_host, consent_at, consent_text)
         VALUES (?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        stamp,
        stamp,
        courseId,
        course?.title ?? null,
        data.locale,
        data.studentName,
        data.studentGrade ?? null,
        data.school ?? null,
        data.parentName,
        data.phone,
        data.email ?? null,
        data.note ?? null,
        data.source,
        normalizeRef(data.ref),
        stamp,
        consentText || '(khong co noi dung dong y)',
      )
      // Sự kiện chuyển đổi do MÁY CHỦ ghi, client không gửi được — nên tỉ lệ đáng tin.
      recordEvent(db, req, {
        name: 'register_submit',
        target: courseId,
        width: data.width,
        lang: data.locale,
      })
    })()

    res.status(201).json({ ok: true })
  },
)

function courseIds() {
  return new Set((getContent().vi.courses?.items ?? []).map((item) => item.id))
}

/** Thân sự kiện → bản ghi, hoặc `null` nếu không hợp lệ (bỏ im lặng). */
function parseEvent(raw) {
  let body = raw
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      return null
    }
  }
  if (!body || typeof body !== 'object') return null

  const { n: name, t: target, l: lang, w: width, r: ref } = body
  if (!CLIENT_EVENTS.has(name)) return null

  if (name === 'course_open' && !(typeof target === 'string' && courseIds().has(target))) return null
  if (name === 'cta_click' && !CTA_IDS.has(target)) return null
  if (name === 'register_open' && !REGISTRATION_SOURCES.includes(target)) return null

  return {
    name,
    target: name === 'pageview' ? null : target,
    ref: name === 'pageview' ? ref : null,
    width: Number(width),
    lang,
  }
}

publicWriteRouter.post(
  '/events',
  requirePublicOrigin,
  eventLimiter,
  // sendBeacon với thân chuỗi gửi `text/plain`; đường lui fetch gửi JSON. Đọc cả hai
  // thành chuỗi rồi tự parse, để JSON hỏng cũng chỉ là bỏ im lặng chứ không ra 400.
  express.text({ type: ['text/plain', 'application/json'], limit: '2kb' }),
  (req, res) => {
    const event = parseEvent(req.body)
    if (event) recordEvent(getDb(), req, event)
    res.status(204).end()
  },
)
