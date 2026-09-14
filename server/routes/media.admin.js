/**
 * Thư viện ảnh của dashboard.
 *
 * Tải lên là `express.raw` với đúng ba kiểu ảnh, KHÔNG dùng multer: mỗi lượt gửi
 * một file, tên file đi trong header `x-filename`. Không cần multipart thì không cần
 * thêm một thư viện phân tích form vào máy chủ công khai.
 *
 * Xác thực đứng TRƯỚC bộ đọc thân request, nên người chưa đăng nhập không đẩy
 * được 15 MB nào vào bộ nhớ máy chủ.
 *
 * Xoá ảnh chỉ xoá file trong `data/media/`. Bản chép ở `public/media/` CỐ Ý giữ lại:
 * snapshot đã commit có thể vẫn trỏ tới ảnh đó cho bản chạy offline, cho tới lần
 * build kế tiếp.
 */
import express, { Router } from 'express'
import { unlinkSync } from 'node:fs'
import { join } from 'node:path'

import { requireCsrf, requireSameOrigin, requireSession } from '../auth/middleware.js'
import { paths } from '../config.js'
import { SECTION_IMAGES, mediaUrl } from '../content/assemble.js'
import { getContent } from '../content/cache.js'
import { getDb } from '../db/index.js'
import { ACCEPTED_TYPES, MediaError, processImage, storeImage } from '../media/process.js'

export const mediaRouter = Router()

mediaRouter.use(requireSameOrigin, requireSession)

/** scope trong bảng binding -> section. `singleton` tách theo item: hero là section, logo thì không. */
const SECTION_OF_SCOPE = Object.fromEntries(
  Object.entries(SECTION_IMAGES)
    .filter(([, target]) => !target.itemIds)
    .map(([section, target]) => [target.scope, section]),
)

function describeUsage(row, dict) {
  if (row.scope === 'singleton') {
    return { scope: row.scope, itemId: row.item_id, section: row.item_id === 'hero' ? 'hero' : null, label: row.item_id }
  }
  const section = SECTION_OF_SCOPE[row.scope] ?? null
  const arrayKey = section ? SECTION_IMAGES[section].arrayKey : null
  const item = arrayKey ? dict[section]?.[arrayKey]?.find((entry) => entry.id === row.item_id) : null
  return {
    scope: row.scope,
    itemId: row.item_id,
    section,
    label: item?.title ?? item?.name ?? row.item_id,
  }
}

function usagesByMedia(db) {
  const dict = getContent().vi
  const map = new Map()
  for (const row of db.prepare('SELECT scope, item_id, media_id FROM binding ORDER BY scope, item_id').all()) {
    if (!map.has(row.media_id)) map.set(row.media_id, [])
    map.get(row.media_id).push(describeUsage(row, dict))
  }
  return map
}

function present(row, usages = []) {
  return {
    id: row.id,
    url: mediaUrl(row.filename),
    filename: row.filename,
    mime: row.mime,
    bytes: row.bytes,
    width: row.width,
    height: row.height,
    origin: row.origin,
    sourceNote: row.source_note,
    createdAt: row.created_at,
    usages,
  }
}

const parseId = (value) => {
  const id = Number.parseInt(value, 10)
  return Number.isInteger(id) && id > 0 ? id : null
}

mediaRouter.get('/media', (_req, res) => {
  const db = getDb()
  const usages = usagesByMedia(db)
  const rows = db.prepare('SELECT * FROM media ORDER BY created_at DESC, id DESC').all()
  res.json({ items: rows.map((row) => present(row, usages.get(row.id))) })
})

mediaRouter.post(
  '/media',
  requireCsrf,
  express.raw({ type: ACCEPTED_TYPES, limit: '15mb' }),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      res.status(415).json({ error: 'chi nhan anh JPEG, PNG, WebP (dat Content-Type dung kieu anh)' })
      return
    }

    let originalName = 'anh'
    try {
      originalName = decodeURIComponent(req.get('x-filename') ?? 'anh')
    } catch {
      // Header hỏng thì dùng tên mặc định — tên file chỉ để đọc cho dễ, không quan trọng.
    }

    try {
      const processed = await processImage(req.body)
      const db = getDb()
      const { row, created } = storeImage(db, processed, originalName)
      res.status(created ? 201 : 200).json({
        created,
        item: present(row, usagesByMedia(db).get(row.id)),
        original: { bytes: req.body.length },
      })
    } catch (error) {
      if (error instanceof MediaError) {
        res.status(error.status).json({ error: error.message })
        return
      }
      throw error
    }
  },
)

mediaRouter.patch('/media/:id', requireCsrf, (req, res) => {
  const id = parseId(req.params.id)
  const note = req.body?.sourceNote
  if (!id || !(note === null || typeof note === 'string')) {
    res.status(400).json({ error: 'can id anh va sourceNote (chuoi hoac null)' })
    return
  }

  const db = getDb()
  const trimmed = typeof note === 'string' ? note.trim().slice(0, 300) || null : null
  const row = db.prepare('UPDATE media SET source_note = ? WHERE id = ? RETURNING *').get(trimmed, id)
  if (!row) {
    res.status(404).json({ error: 'khong co anh nay' })
    return
  }
  res.json({ item: present(row, usagesByMedia(db).get(row.id)) })
})

mediaRouter.delete('/media/:id', requireCsrf, (req, res) => {
  const id = parseId(req.params.id)
  const db = getDb()
  const row = id ? db.prepare('SELECT * FROM media WHERE id = ?').get(id) : null
  if (!row) {
    res.status(404).json({ error: 'khong co anh nay' })
    return
  }

  // Bảng binding đã có `ON DELETE RESTRICT`, nhưng hỏi trước để trả về DANH SÁCH
  // chỗ đang dùng — thông báo "vi phạm khoá ngoại" thì không ai biết phải làm gì.
  const usages = usagesByMedia(db).get(id) ?? []
  if (usages.length > 0) {
    res.status(409).json({ error: 'anh dang duoc dung, go khoi cac muc truoc', usages })
    return
  }

  db.prepare('DELETE FROM media WHERE id = ?').run(id)
  try {
    unlinkSync(join(paths.media, row.filename))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  res.json({ ok: true })
})
