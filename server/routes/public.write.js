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
import { ctaTargets } from '../content/buttons.js'
import { getContent } from '../content/cache.js'
import { getDb } from '../db/index.js'
import { checkSubmission, submissionEnvelope } from '../schema/formSubmission.js'
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
  'seasonal-popup',
  'events',
  // Banner Cuộc thi: nút thành viên, nút "Xem chi tiết", nút đăng ký trong popup (API 19).
  'competitions',
  'competition-detail',
  'competition-modal',
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

    const member = data.kind === 'member'
    const isEvent = data.kind === 'event'
    const courseId = data.kind === 'course' ? data.course || null : null
    const content = getContent()

    // Sự kiện: phải có trên trang, loại của nó có nút đăng ký, và chưa đóng đăng ký. Tra bản
    // VI phía máy chủ — không tin client (người xem có thể cầm snapshot cũ).
    let activity = null
    if (isEvent) {
      const activities = content.vi.activities
      activity = activities?.items?.find((item) => item.id === data.event) ?? null
      if (!activity || activity.registerClosed || !activities.registerCta?.[activity.kind]) {
        res.status(422).json({ error: 'su kien khong nhan dang ky', issues: [{ path: 'event', code: 'event' }] })
        return
      }
    }

    const now = new Date()
    // Sự kiện so thêm họ tên: anh chị em cùng số điện thoại phụ huynh vẫn đăng ký được.
    const duplicate = db
      .prepare(
        `SELECT 1 FROM registration
          WHERE phone = ? AND kind = ? AND COALESCE(course_id, '') = ? AND COALESCE(event_id, '') = ?
            AND (? = 0 OR student_name = ?) AND created_at > ?`,
      )
      .get(
        data.phone,
        data.kind,
        courseId ?? '',
        activity?.id ?? '',
        isEvent ? 1 : 0,
        isEvent ? data.fullName : '',
        new Date(now.getTime() - DEDUPE_MS).toISOString(),
      )
    if (duplicate) {
      // Bấm đúp hoặc gửi lại sau lỗi mạng: người gửi thấy thành công, database giữ một dòng.
      res.status(201).json({ ok: true })
      return
    }

    // Tên khóa và câu đồng ý lấy từ nội dung phía máy chủ, không bao giờ tin client.
    // Thành viên / sự kiện đồng ý theo câu chữ của riêng loại đó (`register.member.*`, `register.event.*`).
    const course = courseId ? content.vi.courses?.items?.find((item) => item.id === courseId) : null
    const dict = content[data.locale]
    const words = member ? dict.register?.member : isEvent ? dict.register?.event : dict.register
    const consentText = [words?.consent, fill(words?.privacy, { email: dict.footer?.contact?.email })]
      .filter(Boolean)
      .join('\n\n')

    // Thành viên / sự kiện: `student_name` = họ tên, `school` = trường / đơn vị (xem migration 014).
    // Sự kiện: `parent_name` chỉ có khi người tham gia dưới 16 tuổi (schema đã buộc).
    const row = isEvent
      ? {
          studentName: data.fullName,
          studentGrade: null,
          school: data.organization ?? null,
          parentName: data.parentName ?? null,
          birthYear: Number(data.birthYear),
          memberRole: null,
          interests: null,
        }
      : member
      ? {
          studentName: data.fullName,
          studentGrade: null,
          school: data.organization ?? null,
          parentName: null,
          birthYear: Number(data.birthYear),
          memberRole: data.role,
          interests: data.interests?.length ? JSON.stringify(data.interests) : null,
        }
      : {
          studentName: data.studentName,
          studentGrade: data.studentGrade ?? null,
          school: data.school ?? null,
          parentName: data.parentName,
          birthYear: null,
          memberRole: null,
          interests: null,
        }

    const stamp = now.toISOString()
    db.transaction(() => {
      db.prepare(
        `INSERT INTO registration
           (created_at, updated_at, kind, status, course_id, course_title, event_id, event_title, locale,
            student_name, student_grade, school, parent_name, phone, email, note,
            birth_year, member_role, interests,
            source, referrer_host, consent_at, consent_text)
         VALUES (?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        stamp,
        stamp,
        data.kind,
        courseId,
        course?.title ?? null,
        activity?.id ?? null,
        activity?.title ?? null,
        data.locale,
        row.studentName,
        row.studentGrade,
        row.school,
        row.parentName,
        data.phone,
        data.email ?? null,
        data.note ?? null,
        row.birthYear,
        row.memberRole,
        row.interests,
        data.source,
        normalizeRef(data.ref),
        stamp,
        consentText || '(khong co noi dung dong y)',
      )
      // Sự kiện chuyển đổi do MÁY CHỦ ghi, client không gửi được — nên tỉ lệ đáng tin.
      // Thành viên mang target 'member': thống kê chuyển đổi theo khóa nối với
      // `course_open` theo target, nên không bao giờ khớp nhầm.
      recordEvent(db, req, {
        name: 'register_submit',
        target: member ? 'member' : isEvent ? 'event' : courseId,
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

/** Id thống kê của mọi nút do admin tạo, tính lại theo `rev` nội dung (đệm một bản). */
let ctaCache = { rev: null, ids: new Set() }
function liveCtaIds() {
  const content = getContent()
  if (ctaCache.rev !== content.rev) ctaCache = { rev: content.rev, ids: new Set(ctaTargets(content.vi).keys()) }
  return ctaCache.ids
}

/**
 * Bài gửi của form tự tạo (API 23). Cùng chốt với form đăng ký: nguồn gốc, hai bộ giới hạn
 * theo IP (DÙNG CHUNG bộ đếm với đăng ký — một người không được gấp đôi hạn mức bằng cách đổi
 * form), bẫy bot, trần mỗi ngày (đếm cả hai bảng). Định nghĩa form tra trong bản VI hiện hành.
 */
publicWriteRouter.post(
  '/forms/:id',
  requirePublicOrigin,
  registrationBurst,
  registrationDaily,
  express.json({ limit: '16kb' }),
  (req, res) => {
    const envelope = submissionEnvelope.safeParse(req.body)
    if (!envelope.success) {
      res.status(422).json({ error: 'du lieu khong hop le', issues: [{ path: 'form', code: 'invalid' }] })
      return
    }
    const data = envelope.data

    const content = getContent()
    const form = content.vi.forms?.items?.find((item) => item.id === req.params.id)
    if (!form || form.closed) {
      res.status(422).json({ error: 'form khong nhan bai', issues: [{ path: 'form', code: 'form' }] })
      return
    }

    const checked = checkSubmission(form, data)
    if (checked.issues.length > 0) {
      res.status(422).json({ error: 'du lieu khong hop le', issues: checked.issues })
      return
    }

    // Bot: trả "thành công" để nó không học được gì, và không lưu gì cả.
    if (data.website || (data.elapsed ?? 0) < MIN_FILL_MS || isBot(req.get('user-agent'))) {
      res.status(201).json({ ok: true })
      return
    }

    const db = getDb()
    const since = startOfTodayIso()
    const received =
      db.prepare('SELECT COUNT(*) AS n FROM registration WHERE created_at >= ?').get(since).n +
      db.prepare('SELECT COUNT(*) AS n FROM form_submission WHERE created_at >= ?').get(since).n
    if (received >= config.registrationDailyCap) {
      console.warn(`[form] cham tran ${config.registrationDailyCap} bai gui/ngay, tam ngung nhan`)
      res.status(503).json({ error: 'tam ngung nhan bai gui', code: 'paused' })
      return
    }

    const now = new Date()
    const answersJson = JSON.stringify(checked.answers)
    const duplicate = db
      .prepare('SELECT 1 FROM form_submission WHERE form_id = ? AND answers_json = ? AND birth_year = ? AND created_at > ?')
      .get(form.id, answersJson, checked.birthYear, new Date(now.getTime() - DEDUPE_MS).toISOString())
    if (duplicate) {
      // Bấm đúp hoặc gửi lại sau lỗi mạng: người gửi thấy thành công, database giữ một dòng.
      res.status(201).json({ ok: true })
      return
    }

    // Câu đồng ý theo ngôn ngữ người gửi đang xem, lấy từ nội dung phía máy chủ.
    const words = content[data.locale]?.forms?.items?.find((item) => item.id === form.id) ?? form
    const consentText = [words.consent, fill(words.privacy, { email: content[data.locale]?.footer?.contact?.email })]
      .filter(Boolean)
      .join('\n\n')

    const stamp = now.toISOString()
    db.prepare(
      `INSERT INTO form_submission
         (created_at, updated_at, form_id, form_title, status, locale, answers_json, birth_year, parent_name,
          phone, email, source, referrer_host, consent_at, consent_text)
       VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      stamp,
      stamp,
      form.id,
      form.title,
      data.locale,
      answersJson,
      checked.birthYear,
      checked.parentName,
      checked.phone,
      checked.email,
      data.source,
      normalizeRef(data.ref),
      stamp,
      consentText || '(khong co noi dung dong y)',
    )
    res.status(201).json({ ok: true })
  },
)

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
  // Id cũ (CTA_IDS) hoặc id của một nút do admin tạo đang có trên trang (`${slot}-${id}`).
  if (name === 'cta_click' && !CTA_IDS.has(target) && !(typeof target === 'string' && liveCtaIds().has(target))) {
    return null
  }
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
