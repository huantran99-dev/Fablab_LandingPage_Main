/**
 * Quản lý đăng ký (khóa học và thành viên FabLab): danh sách có lọc + phân trang, sửa trạng thái / ghi
 * chú, xoá, xuất CSV.
 *
 * Phân trang ở MÁY CHỦ (khác thư viện ảnh): danh sách này lớn dần theo thời gian.
 * Mọi điều kiện lọc đi qua tham số `?`, không ghép chuỗi người dùng vào SQL.
 *
 * `/registrations/export` phải khai TRƯỚC `/registrations/:id`, kẻo "export" bị
 * hiểu là một id.
 */
import { Router } from 'express'
import { z } from 'zod'

import { requireCsrf, requireSameOrigin, requireSession } from '../auth/middleware.js'
import { getContent } from '../content/cache.js'
import { getDb } from '../db/index.js'
import { REGISTRATION_KINDS, REGISTRATION_STATUSES } from '../schema/registration.js'

export const registrationsRouter = Router()

registrationsRouter.use('/registrations', requireSameOrigin, requireSession)

// Thành viên (`kind = 'member'`): `studentName` = họ tên, `school` = trường / đơn vị —
// quy ước của migration 014.
const COLUMNS = `id, created_at AS createdAt, updated_at AS updatedAt, kind, status, status_at AS statusAt,
  course_id AS courseId, course_title AS courseTitle, locale,
  student_name AS studentName, student_grade AS studentGrade, school,
  parent_name AS parentName, phone, email, note, admin_note AS adminNote,
  birth_year AS birthYear, member_role AS memberRole, interests,
  source, referrer_host AS referrerHost, consent_at AS consentAt, consent_text AS consentText`

const DAY = /^\d{4}-\d{2}-\d{2}$/
const str = (value) => (typeof value === 'string' ? value.trim() : '')

/** 0 giờ (giờ Việt Nam) của một ngày YYYY-MM-DD, cộng thêm `offset` ngày, dạng ISO UTC. */
function vnDayStart(day, offset = 0) {
  return new Date(new Date(`${day}T00:00:00+07:00`).getTime() + offset * 86_400_000).toISOString()
}

/** Điều kiện lọc → `{ sql, params }`. `ignoreStatus` cho bộ đếm của các tab trạng thái. */
function buildFilter(query, { ignoreStatus = false } = {}) {
  const where = []
  const params = []

  const status = str(query.status)
  if (!ignoreStatus && REGISTRATION_STATUSES.includes(status)) {
    where.push('status = ?')
    params.push(status)
  }

  const kind = str(query.kind)
  if (REGISTRATION_KINDS.includes(kind)) {
    where.push('kind = ?')
    params.push(kind)
  }

  // "Cần tư vấn" (`-`) chỉ là đăng ký KHÓA HỌC chưa chọn khóa — thành viên cũng có
  // `course_id` NULL và không được lẫn vào đây.
  const course = str(query.course)
  if (course === '-') where.push("kind = 'course' AND course_id IS NULL")
  else if (course) {
    where.push('course_id = ?')
    params.push(course)
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

  const q = str(query.q).slice(0, 100)
  if (q) {
    const like = (text) => `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`
    // Số điện thoại lưu dạng liền `0912345678`: gõ "0912 345" vẫn phải khớp.
    const digits = q.replace(/[\s.()+-]/g, '')
    const phone = /^\d{3,}$/.test(digits) ? digits : q
    where.push(
      `(student_name LIKE ? ESCAPE '\\' OR parent_name LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\'
        OR COALESCE(email, '') LIKE ? ESCAPE '\\' OR COALESCE(school, '') LIKE ? ESCAPE '\\')`,
    )
    params.push(like(q), like(q), like(phone), like(q), like(q))
  }

  return { sql: where.length > 0 ? `WHERE ${where.join(' AND ')}` : '', params }
}

/** Tên khóa hiện tại trên trang; khóa đã bị xoá thì dùng tên chụp lúc gửi. */
function currentTitles() {
  return new Map((getContent().vi.courses?.items ?? []).map((item) => [item.id, item.title]))
}

/** Nhãn đối tượng / lĩnh vực của thành viên, theo bản VI hiện tại trên trang. */
function memberLabels() {
  const register = getContent().vi.register ?? {}
  return { roles: register.memberRoles ?? {}, interests: register.memberInterests ?? {} }
}

function parseInterests(text) {
  try {
    const list = JSON.parse(text ?? '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function decorate(row, titles, labels = memberLabels()) {
  const interests = parseInterests(row.interests)
  return {
    ...row,
    courseTitle: (row.courseId && titles.get(row.courseId)) ?? row.courseTitle,
    courseOnPage: row.courseId ? titles.has(row.courseId) : null,
    interests,
    // Id lạ (nhãn bị xoá khỏi nội dung) thì hiện chính id — vẫn đọc được, không mất.
    memberRoleLabel: row.memberRole ? (labels.roles[row.memberRole] ?? row.memberRole) : null,
    interestLabels: interests.map((id) => labels.interests[id] ?? id),
  }
}

registrationsRouter.get('/registrations', (req, res) => {
  const db = getDb()
  const titles = currentTitles()

  const page = Math.max(1, Number.parseInt(str(req.query.page), 10) || 1)
  const pageSize = Math.min(100, Math.max(10, Number.parseInt(str(req.query.pageSize), 10) || 25))

  const filter = buildFilter(req.query)
  const total = db.prepare(`SELECT COUNT(*) AS n FROM registration ${filter.sql}`).get(...filter.params).n
  const labels = memberLabels()
  const items = db
    .prepare(`SELECT ${COLUMNS} FROM registration ${filter.sql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`)
    .all(...filter.params, pageSize, (page - 1) * pageSize)
    .map((row) => decorate(row, titles, labels))

  // Bộ đếm tab bỏ qua chính bộ lọc trạng thái, để tab nào cũng hiện số thật của nó.
  const statusFilter = buildFilter(req.query, { ignoreStatus: true })
  const byStatus = Object.fromEntries(REGISTRATION_STATUSES.map((status) => [status, 0]))
  let all = 0
  for (const row of db
    .prepare(`SELECT status, COUNT(*) AS n FROM registration ${statusFilter.sql} GROUP BY status`)
    .all(...statusFilter.params)) {
    byStatus[row.status] = row.n
    all += row.n
  }

  // Chỉ đăng ký khóa học: thành viên có `course_id` NULL, không lọc là cả nhóm thành viên
  // dồn vào dòng "chưa chọn — cần tư vấn".
  const byCourse = db
    .prepare(
      `SELECT course_id AS courseId, MAX(course_title) AS title, COUNT(*) AS total,
              SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS fresh
         FROM registration WHERE kind = 'course' GROUP BY course_id ORDER BY total DESC`,
    )
    .all()
    .map((row) => ({
      courseId: row.courseId,
      title: (row.courseId && titles.get(row.courseId)) ?? row.title,
      total: row.total,
      new: row.fresh,
    }))

  const byKind = Object.fromEntries(REGISTRATION_KINDS.map((kind) => [kind, 0]))
  for (const row of db.prepare('SELECT kind, COUNT(*) AS n FROM registration GROUP BY kind').all()) byKind[row.kind] = row.n

  res.json({ items, total, page, pageSize, counts: { byStatus: { ...byStatus, all }, byCourse, byKind } })
})

const STATUS_LABELS = { new: 'Mới', contacted: 'Đã liên hệ', enrolled: 'Đã nhập học', cancelled: 'Đã huỷ' }
// Cùng trạng thái `enrolled`, nhưng với thành viên nghĩa là đã kết nạp.
const MEMBER_STATUS_LABELS = { ...STATUS_LABELS, enrolled: 'Đã kết nạp' }
const KIND_LABELS = { course: 'Khóa học', member: 'Thành viên FabLab' }
const SOURCE_LABELS = { 'course-modal': 'Popup khóa học', 'final-cta': 'Khối kêu gọi cuối trang', nav: 'Thanh menu', 'nav-drawer': 'Menu di động' }

/** Giờ Việt Nam, dạng Excel đọc được: `2026-09-18 14:05`. */
const vnTime = (iso) => (iso ? new Date(new Date(iso).getTime() + 7 * 3600_000).toISOString().slice(0, 16).replace('T', ' ') : '')

/**
 * Một ô CSV. Ô bắt đầu bằng `= + - @` bị Excel hiểu là công thức — dữ liệu này do
 * người ngoài gõ vào, nên thêm `'` phía trước để vô hiệu hoá.
 */
function cell(value) {
  let text = value === null || value === undefined ? '' : String(value)
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

registrationsRouter.get('/registrations/export', (req, res) => {
  const db = getDb()
  const titles = currentTitles()
  const filter = buildFilter(req.query)
  const labels = memberLabels()
  const rows = db
    .prepare(`SELECT ${COLUMNS} FROM registration ${filter.sql} ORDER BY created_at DESC, id DESC`)
    .all(...filter.params)
    .map((row) => decorate(row, titles, labels))

  const header = [
    'Mã', 'Thời gian gửi', 'Loại', 'Trạng thái', 'Khóa học', 'Mã khóa', 'Họ tên', 'Năm sinh / lớp', 'Trường / đơn vị',
    'Phụ huynh', 'Đối tượng', 'Lĩnh vực quan tâm', 'Điện thoại', 'Email', 'Ghi chú', 'Ghi chú quản trị', 'Nguồn',
    'Ngôn ngữ', 'Đồng ý lúc',
  ]
  const lines = [header.map(cell).join(',')]
  for (const row of rows) {
    lines.push(
      [
        cell(row.id),
        cell(vnTime(row.createdAt)),
        cell(KIND_LABELS[row.kind] ?? row.kind),
        cell((row.kind === 'member' ? MEMBER_STATUS_LABELS : STATUS_LABELS)[row.status] ?? row.status),
        cell(row.kind === 'member' ? '' : (row.courseTitle ?? (row.courseId ? row.courseId : 'Cần tư vấn'))),
        cell(row.courseId),
        cell(row.studentName),
        cell(row.kind === 'member' ? row.birthYear : row.studentGrade),
        cell(row.school),
        cell(row.parentName),
        cell(row.memberRoleLabel),
        cell(row.interestLabels.join('; ')),
        // Excel bỏ số 0 đầu của "0912…". Số đã được máy chủ chuẩn hoá thành toàn chữ
        // số, nên bọc ="…" ở đây là an toàn — không có gì người gửi chèn được vào.
        `="${row.phone}"`,
        cell(row.email),
        cell(row.note),
        cell(row.adminNote),
        cell(SOURCE_LABELS[row.source] ?? row.source),
        cell(row.locale),
        cell(vnTime(row.consentAt)),
      ].join(','),
    )
  }

  const stamp = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10).replaceAll('-', '')
  console.info(`[registration] xuat CSV ${rows.length} dong`)
  res.set('content-type', 'text/csv; charset=utf-8')
  res.set('content-disposition', `attachment; filename="dang-ky-${stamp}.csv"`)
  res.set('cache-control', 'no-store')
  // BOM để Excel nhận ra UTF-8; thiếu nó chữ Việt vỡ thành ký tự rác.
  res.send(`﻿${lines.join('\r\n')}\r\n`)
})

function readOne(id) {
  const row = getDb().prepare(`SELECT ${COLUMNS} FROM registration WHERE id = ?`).get(id)
  return row ? decorate(row, currentTitles()) : null
}

const idParam = (req) => {
  const id = Number.parseInt(req.params.id, 10)
  return Number.isInteger(id) && id > 0 && String(id) === req.params.id ? id : null
}

registrationsRouter.get('/registrations/:id', (req, res) => {
  const id = idParam(req)
  const item = id ? readOne(id) : null
  if (!item) {
    res.status(404).json({ error: 'khong tim thay dang ky', id: req.params.id })
    return
  }
  res.json({ item })
})

const patchSchema = z.strictObject({
  status: z.enum(REGISTRATION_STATUSES).optional(),
  adminNote: z.string().trim().max(2000, 'toi da 2000 ky tu').nullable().optional(),
})

registrationsRouter.patch('/registrations/:id', requireCsrf, (req, res) => {
  const id = idParam(req)
  const current = id ? readOne(id) : null
  if (!current) {
    res.status(404).json({ error: 'khong tim thay dang ky', id: req.params.id })
    return
  }
  const parsed = patchSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: 'du lieu khong hop le', issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) })
    return
  }

  const { status, adminNote } = parsed.data
  const now = new Date().toISOString()
  const nextStatus = status ?? current.status
  const nextNote = adminNote === undefined ? current.adminNote : adminNote || null

  getDb()
    .prepare(
      `UPDATE registration
          SET status = ?, admin_note = ?, updated_at = ?,
              status_at = CASE WHEN status <> ? THEN ? ELSE status_at END
        WHERE id = ?`,
    )
    .run(nextStatus, nextNote, now, nextStatus, now, id)

  res.json({ item: readOne(id) })
})

// Xoá cứng: phục vụ quyền yêu cầu xoá dữ liệu. Sự kiện thống kê không chứa dữ liệu
// cá nhân và không nối được về dòng này, nên không cần xoá theo.
registrationsRouter.delete('/registrations/:id', requireCsrf, (req, res) => {
  const id = idParam(req)
  const result = id ? getDb().prepare('DELETE FROM registration WHERE id = ?').run(id) : { changes: 0 }
  if (result.changes === 0) {
    res.status(404).json({ error: 'khong tim thay dang ky', id: req.params.id })
    return
  }
  res.json({ ok: true })
})
