/**
 * Nội dung popup chi tiết khóa học (`courses.details`).
 *
 * Bảng `course_detail` giữ tới ba bản cho mỗi (khóa, ngôn ngữ), trộn theo
 * `DETAIL_PRECEDENCE` — bản sau đè bản trước:
 *
 *   scraped      bóc từ LearnPress, chạy lại scraper chỉ được đụng dòng này
 *   handwritten  viết tay từ catalogue chính thức
 *   overridden   bản admin sửa từ dashboard  <- route này CHỈ ghi vào đây
 *
 * Nhờ vậy sửa từ dashboard **không bao giờ phá hồ sơ nguồn**: gỡ bản sửa (gửi
 * `null`) là trang quay về đúng bản gốc.
 *
 * Hai điều cố ý khác với đường ghi section:
 *   - KHÔNG kiểm đối xứng VI/EN — nhánh này bất đối xứng có chủ đích (năm khóa
 *     không có trang tiếng Anh, EN mang `viOnly`).
 *   - KHÔNG có lịch sử. Bản gốc luôn còn, nên "khôi phục" là gỡ bản sửa.
 *
 * Ghi xong phải tăng `content_counter`, vì thay đổi ở đây không đụng `section.rev`
 * (xem migration 002) — thiếu bước này thì bản sửa không bao giờ lên trang.
 */
import { Router } from 'express'
import { z } from 'zod'

import { requireCsrf, requireSameOrigin, requireSession } from '../auth/middleware.js'
import { DETAIL_PRECEDENCE, currentRev } from '../content/assemble.js'
import { invalidate } from '../content/cache.js'
import { getDb } from '../db/index.js'
import { formatIssues, idSchema } from '../schema/sections.js'

export const courseDetailsRouter = Router()

courseDetailsRouter.use(requireSameOrigin, requireSession)

const lines = z.array(z.string().trim().min(1, 'dong khong duoc de trong').max(1000)).max(60)

export const detailSchema = z.strictObject({
  overview: lines.optional(),
  knowledge: lines.optional(),
  skills: lines.optional(),
  curriculum: lines.optional(),
  audience: z.string().trim().min(1).max(300).optional(),
  sourceUrl: z.url({ protocol: /^https?$/ }).optional(),
  viOnly: z.literal(true).optional(),
})

const LOCALES = ['vi', 'en']

function readDetail(db, courseId) {
  const rows = db
    .prepare('SELECT locale, source, json, updated_at FROM course_detail WHERE course_id = ?')
    .all(courseId)

  const out = {}
  for (const locale of LOCALES) {
    const byLocale = { scraped: null, handwritten: null, overridden: null, effective: null, overriddenAt: null }
    for (const source of DETAIL_PRECEDENCE) {
      const row = rows.find((entry) => entry.locale === locale && entry.source === source)
      if (!row) continue
      byLocale[source] = JSON.parse(row.json)
      byLocale.effective = byLocale[source]
      if (source === 'overridden') byLocale.overriddenAt = row.updated_at
    }
    out[locale] = byLocale
  }
  return out
}

/** Khóa học phải đang có trên trang: không cho tạo nội dung popup mồ côi mới. */
function courseExists(db, courseId) {
  const row = db.prepare("SELECT json FROM section WHERE locale = 'vi' AND key = 'courses'").get()
  return Boolean(row && JSON.parse(row.json).items?.some((course) => course.id === courseId))
}

courseDetailsRouter.get('/course-details/:id', (req, res) => {
  const parsedId = idSchema.safeParse(req.params.id)
  if (!parsedId.success) {
    res.status(400).json({ error: 'id khoa hoc khong hop le' })
    return
  }
  const db = getDb()
  res.json({ courseId: parsedId.data, exists: courseExists(db, parsedId.data), ...readDetail(db, parsedId.data) })
})

courseDetailsRouter.put('/course-details/:id', requireCsrf, (req, res) => {
  const parsedId = idSchema.safeParse(req.params.id)
  if (!parsedId.success) {
    res.status(400).json({ error: 'id khoa hoc khong hop le' })
    return
  }
  const courseId = parsedId.data
  const body = req.body ?? {}

  // Bắt buộc gửi CẢ HAI khoá, kể cả khi là `null`. Thiếu một khoá thì không phân
  // biệt được "gỡ bản sửa" với "quên gửi" — mà hai việc đó cho ra hai trang khác nhau.
  if (!LOCALES.every((locale) => Object.hasOwn(body, locale))) {
    res.status(400).json({ error: 'phai gui ca vi va en (null = go ban sua, quay ve ban goc)' })
    return
  }

  const issues = {}
  const values = {}
  for (const locale of LOCALES) {
    if (body[locale] === null) {
      values[locale] = null
      continue
    }
    const parsed = detailSchema.safeParse(body[locale])
    if (parsed.success) values[locale] = parsed.data
    else issues[locale] = formatIssues(parsed.error)
  }
  if (Object.keys(issues).length > 0) {
    res.status(422).json({ error: 'noi dung khong hop le', vi: issues.vi ?? [], en: issues.en ?? [] })
    return
  }

  const db = getDb()
  if (!courseExists(db, courseId)) {
    res.status(404).json({ error: 'khong co khoa hoc nay tren trang', courseId })
    return
  }

  const now = new Date().toISOString()
  db.transaction(() => {
    for (const locale of LOCALES) {
      if (values[locale] === null) {
        db.prepare("DELETE FROM course_detail WHERE locale = ? AND course_id = ? AND source = 'overridden'").run(
          locale,
          courseId,
        )
      } else {
        db.prepare(
          `INSERT INTO course_detail (locale, course_id, source, json, updated_at)
           VALUES (?, ?, 'overridden', ?, ?)
           ON CONFLICT (locale, course_id, source) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at`,
        ).run(locale, courseId, JSON.stringify(values[locale]), now)
      }
    }
    db.prepare('UPDATE content_counter SET value = value + 1 WHERE id = 1').run()
  })()

  invalidate()
  res.json({ ok: true, rev: currentRev(db).rev, courseId, ...readDetail(db, courseId) })
})
