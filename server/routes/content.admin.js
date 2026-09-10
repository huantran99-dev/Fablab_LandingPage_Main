/**
 * Đường ghi nội dung cho dashboard. Mọi route đều đòi phiên đăng nhập.
 *
 * `GET` và `PUT` đều làm việc với **cặp hai ngôn ngữ cùng lúc**, không phải từng
 * ngôn ngữ một. Đó không phải cho tiện: một API chỉ ghi được một ngôn ngữ thì
 * "quên cập nhật bản kia" luôn luôn là chuyện có thể xảy ra, dù có bao nhiêu bộ
 * kiểm chạy sau đó.
 */
import { Router } from 'express'

import { requireCsrf, requireSameOrigin, requireSession } from '../auth/middleware.js'
import { WriteError, readHistory, readSectionPair, restoreHistory, writeSectionPair } from '../content/mutate.js'
import { EDITABLE_SECTIONS, formatIssues, schemaFor } from '../schema/sections.js'

export const adminContentRouter = Router()

adminContentRouter.use(requireSameOrigin, requireSession)

function handle(res, fn) {
  try {
    fn()
  } catch (error) {
    if (error instanceof WriteError) {
      res.status(error.status).json(error.body)
      return
    }
    throw error
  }
}

adminContentRouter.get('/sections', (_req, res) => {
  res.json({ editable: EDITABLE_SECTIONS })
})

adminContentRouter.get('/content/:section', (req, res) => {
  handle(res, () => res.json(readSectionPair(req.params.section)))
})

adminContentRouter.put('/content/:section', requireCsrf, (req, res) => {
  const { section } = req.params
  const schema = schemaFor(section)

  // Không có schema thì TỪ CHỐI, đừng cho ghi bừa. Section chưa có schema là
  // section chưa được rà, và ghi vào đó là cách chắc chắn nhất để làm hỏng trang.
  if (!schema) {
    res.status(400).json({
      error: 'section nay chua mo cho sua',
      section,
      editable: EDITABLE_SECTIONS,
    })
    return
  }

  const { vi, en, rev, note } = req.body ?? {}

  const parsed = { vi: schema.safeParse(vi), en: schema.safeParse(en) }
  if (!parsed.vi.success || !parsed.en.success) {
    res.status(422).json({
      error: 'noi dung khong hop le',
      vi: parsed.vi.success ? [] : formatIssues(parsed.vi.error),
      en: parsed.en.success ? [] : formatIssues(parsed.en.error),
    })
    return
  }

  handle(res, () => {
    const newRev = writeSectionPair({
      section,
      vi: parsed.vi.data,
      en: parsed.en.data,
      expectedRev: typeof rev === 'number' ? rev : undefined,
      note: typeof note === 'string' ? note.slice(0, 200) : null,
    })
    res.json({ ok: true, section, rev: newRev })
  })
})

adminContentRouter.get('/history/:section', (req, res) => {
  res.json({ section: req.params.section, entries: readHistory(req.params.section) })
})

adminContentRouter.post('/history/:id/restore', requireCsrf, (req, res) => {
  handle(res, () => {
    const rev = restoreHistory(Number.parseInt(req.params.id, 10))
    res.json({ ok: true, rev })
  })
})
