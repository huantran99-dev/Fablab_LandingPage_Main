/**
 * Bài gửi của form tự tạo (API 23): danh sách có lọc + phân trang, sửa trạng thái / ghi chú,
 * xoá, xuất CSV. Cùng khuôn với registrations.admin.js.
 *
 * Câu trả lời nằm ở `answers_json` kèm nhãn + chữ đọc được chụp lúc gửi, nên form bị sửa hay
 * xoá về sau vẫn đọc được bài cũ. CSV của MỘT form mở mỗi ô thành một cột (ô hiện tại theo
 * thứ tự của form, rồi tới ô chỉ còn trong bài cũ); không chọn form thì gộp câu trả lời vào
 * một cột.
 *
 * `/form-submissions/export` phải khai TRƯỚC `/form-submissions/:id`.
 */
import { Router } from 'express'
import { z } from 'zod'

import { requireCsrf, requireSameOrigin, requireSession } from '../auth/middleware.js'
import { getContent } from '../content/cache.js'
import { getDb } from '../db/index.js'
import { FORM_STATUSES } from '../schema/formSubmission.js'

export const formsRouter = Router()

formsRouter.use('/form-submissions', requireSameOrigin, requireSession)

const COLUMNS = `id, created_at AS createdAt, updated_at AS updatedAt, form_id AS formId, form_title AS formTitle,
  status, status_at AS statusAt, locale, answers_json AS answersJson, birth_year AS birthYear,
  parent_name AS parentName, phone, email, source, referrer_host AS referrerHost, admin_note AS adminNote,
  consent_at AS consentAt, consent_text AS consentText`

const DAY = /^\d{4}-\d{2}-\d{2}$/
const ID = /^[a-z0-9][a-z0-9-]*$/
const str = (value) => (typeof value === 'string' ? value.trim() : '')
const vnDayStart = (day, offset = 0) =>
  new Date(new Date(`${day}T00:00:00+07:00`).getTime() + offset * 86_400_000).toISOString()

function buildFilter(query, { ignoreStatus = false } = {}) {
  const where = []
  const params = []
  const status = str(query.status)
  if (!ignoreStatus && FORM_STATUSES.includes(status)) {
    where.push('status = ?')
    params.push(status)
  }
  const form = str(query.form)
  if (ID.test(form)) {
    where.push('form_id = ?')
    params.push(form)
  }
  const from = str(query.from)
  if (DAY.test(from)) {
    where.push('created_at >= ?')
    params.push(vnDayStart(from))
  }
  const to = str(query.to)
  if (DAY.test(to)) {
    where.push('created_at < ?')
    params.push(vnDayStart(to, 1))
  }
  // Tìm trong câu trả lời (JSON thô — đủ cho tên, ghi chú), điện thoại, email, phụ huynh.
  const q = str(query.q).slice(0, 100)
  if (q) {
    const like = `%${q.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
    const digits = q.replace(/\D/g, '')
    const clauses = ["answers_json LIKE ? ESCAPE '\\'", "email LIKE ? ESCAPE '\\'", "parent_name LIKE ? ESCAPE '\\'"]
    params.push(like, like, like)
    if (digits.length >= 3) {
      clauses.push('phone LIKE ?')
      params.push(`%${digits}%`)
    }
    where.push(`(${clauses.join(' OR ')})`)
  }
  return { sql: where.length ? `WHERE ${where.join(' AND ')}` : '', params }
}

function currentForms() {
  return new Map((getContent().vi.forms?.items ?? []).map((form) => [form.id, form]))
}

function decorate(row, forms) {
  const { answersJson, ...rest } = row
  let answers = []
  try {
    answers = JSON.parse(answersJson)
  } catch {
    /* dòng hỏng — vẫn trả về phần còn lại */
  }
  const form = forms.get(row.formId)
  return { ...rest, answers, formTitle: form?.title ?? row.formTitle, formOnPage: Boolean(form) }
}

formsRouter.get('/form-submissions', (req, res) => {
  const db = getDb()
  const forms = currentForms()
  const page = Math.max(1, Number.parseInt(str(req.query.page), 10) || 1)
  const pageSize = Math.min(100, Math.max(10, Number.parseInt(str(req.query.pageSize), 10) || 25))

  const filter = buildFilter(req.query)
  const total = db.prepare(`SELECT COUNT(*) AS n FROM form_submission ${filter.sql}`).get(...filter.params).n
  const items = db
    .prepare(`SELECT ${COLUMNS} FROM form_submission ${filter.sql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...filter.params, pageSize, (page - 1) * pageSize)
    .map((row) => decorate(row, forms))

  const statusFilter = buildFilter(req.query, { ignoreStatus: true })
  const byStatus = Object.fromEntries(FORM_STATUSES.map((status) => [status, 0]))
  let all = 0
  for (const row of db
    .prepare(`SELECT status, COUNT(*) AS n FROM form_submission ${statusFilter.sql} GROUP BY status`)
    .all(...statusFilter.params)) {
    byStatus[row.status] = row.n
    all += row.n
  }

  // Mọi form từng có bài gửi, kể cả form đã xoá (tên chụp lúc gửi) — cho ô lọc.
  const byForm = db
    .prepare(
      `SELECT form_id AS formId, MAX(form_title) AS title, COUNT(*) AS total,
              SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS fresh
         FROM form_submission GROUP BY form_id ORDER BY total DESC`,
    )
    .all()
    .map((row) => ({
      formId: row.formId,
      title: forms.get(row.formId)?.title ?? row.title,
      onPage: forms.has(row.formId),
      total: row.total,
      new: row.fresh,
    }))

  res.json({ items, total, page, pageSize, counts: { byStatus: { ...byStatus, all }, byForm } })
})

export const FORM_STATUS_LABELS = { new: 'Mới', contacted: 'Đã liên hệ', done: 'Đã xử lý', cancelled: 'Đã huỷ' }
const SOURCE_LABELS = {
  hero: 'Hero',
  nav: 'Thanh menu',
  'nav-drawer': 'Menu di động',
  'final-cta': 'Khối kêu gọi cuối trang',
  popup: 'Popup tự tạo',
  'seasonal-popup': 'Popup sự kiện mùa',
}

const vnTime = (iso) => (iso ? new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 16).replace('T', ' ') : '')

/** Một ô CSV — chặn công thức Excel (`= + - @`) như CSV đăng ký: dữ liệu do người ngoài gõ. */
function cell(value) {
  let text = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
const phoneCell = (phone) => (phone ? `="${phone}"` : '')
const textOf = (answer) => (answer?.type === 'phone' ? answer.value : answer?.text ?? '')

formsRouter.get('/form-submissions/export', (req, res) => {
  const db = getDb()
  const forms = currentForms()
  const filter = buildFilter(req.query)
  const rows = db
    .prepare(`SELECT ${COLUMNS} FROM form_submission ${filter.sql} ORDER BY created_at DESC, id DESC`)
    .all(...filter.params)
    .map((row) => decorate(row, forms))

  const formId = ID.test(str(req.query.form)) ? str(req.query.form) : null
  // Cột câu trả lời: ô hiện tại của form theo thứ tự, rồi ô chỉ còn trong bài cũ.
  let answerColumns = []
  if (formId) {
    const seen = new Map((forms.get(formId)?.fields ?? []).map((field) => [field.id, field.label]))
    for (const row of rows) for (const answer of row.answers) if (!seen.has(answer.id)) seen.set(answer.id, answer.label)
    answerColumns = [...seen.entries()]
  }

  const header = [
    'Mã',
    'Thời gian gửi',
    'Form',
    'Trạng thái',
    ...(formId ? answerColumns.map(([, label]) => label) : ['Câu trả lời']),
    'Năm sinh',
    'Phụ huynh',
    'Ghi chú quản trị',
    'Nguồn',
    'Ngôn ngữ',
    'Đồng ý lúc',
  ]
  const lines = [header.map(cell).join(',')]
  for (const row of rows) {
    const byId = new Map(row.answers.map((answer) => [answer.id, answer]))
    const answerCells = formId
      ? answerColumns.map(([id]) => {
          const answer = byId.get(id)
          return answer?.type === 'phone' ? phoneCell(answer.value) : cell(textOf(answer))
        })
      : [cell(row.answers.map((answer) => `${answer.label}: ${textOf(answer)}`).join('\n'))]
    lines.push(
      [
        cell(row.id),
        cell(vnTime(row.createdAt)),
        cell(row.formTitle),
        cell(FORM_STATUS_LABELS[row.status] ?? row.status),
        ...answerCells,
        cell(row.birthYear),
        cell(row.parentName),
        cell(row.adminNote),
        cell(SOURCE_LABELS[row.source] ?? row.source),
        cell(row.locale),
        cell(vnTime(row.consentAt)),
      ].join(','),
    )
  }

  const stamp = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10).replaceAll('-', '')
  console.info(`[form] xuat CSV ${rows.length} dong`)
  res.set('content-type', 'text/csv; charset=utf-8')
  res.set('content-disposition', `attachment; filename="bai-gui-${formId ?? 'form'}-${stamp}.csv"`)
  res.set('cache-control', 'no-store')
  res.send(`﻿${lines.join('\r\n')}\r\n`)
})

const idParam = (req) => {
  const id = Number.parseInt(req.params.id, 10)
  return Number.isInteger(id) && id > 0 && String(id) === req.params.id ? id : null
}
function readOne(id) {
  const row = getDb().prepare(`SELECT ${COLUMNS} FROM form_submission WHERE id = ?`).get(id)
  return row ? decorate(row, currentForms()) : null
}

formsRouter.get('/form-submissions/:id', (req, res) => {
  const id = idParam(req)
  const item = id ? readOne(id) : null
  if (!item) {
    res.status(404).json({ error: 'khong tim thay bai gui', id: req.params.id })
    return
  }
  res.json({ item })
})

const patchSchema = z.strictObject({
  status: z.enum(FORM_STATUSES).optional(),
  adminNote: z.string().trim().max(2000, 'toi da 2000 ky tu').nullable().optional(),
})

formsRouter.patch('/form-submissions/:id', requireCsrf, (req, res) => {
  const id = idParam(req)
  const current = id ? readOne(id) : null
  if (!current) {
    res.status(404).json({ error: 'khong tim thay bai gui', id: req.params.id })
    return
  }
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({
      error: 'du lieu khong hop le',
      issues: parsed.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
    })
    return
  }
  const { status, adminNote } = parsed.data
  const now = new Date().toISOString()
  const nextStatus = status ?? current.status
  const nextNote = adminNote === undefined ? current.adminNote : adminNote || null
  getDb()
    .prepare(
      `UPDATE form_submission
          SET status = ?, admin_note = ?, updated_at = ?,
              status_at = CASE WHEN status <> ? THEN ? ELSE status_at END
        WHERE id = ?`,
    )
    .run(nextStatus, nextNote, now, nextStatus, now, id)
  res.json({ item: readOne(id) })
})

formsRouter.delete('/form-submissions/:id', requireCsrf, (req, res) => {
  const id = idParam(req)
  const result = id ? getDb().prepare('DELETE FROM form_submission WHERE id = ?').run(id) : { changes: 0 }
  if (result.changes === 0) {
    res.status(404).json({ error: 'khong tim thay bai gui', id: req.params.id })
    return
  }
  res.json({ ok: true })
})
