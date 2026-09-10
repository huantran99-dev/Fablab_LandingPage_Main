/**
 * Đường đọc nội dung — công khai, không cần đăng nhập.
 *
 * Đây là API mà trang gọi sau khi đã vẽ xong bằng bản dự phòng đóng gói sẵn. Vì
 * vậy nó phải nhanh và phải cache được; nhưng thời gian cache để NGẮN (60 giây),
 * vì admin sửa xong thì muốn thấy đổi ngay chứ không đợi hết hạn cache.
 */
import { Router } from 'express'

import { getContent } from '../content/cache.js'

export const contentRouter = Router()

const LOCALES = new Set(['vi', 'en'])
const CACHE_HEADER = 'public, max-age=60, stale-while-revalidate=600'

/** Trả 304 nếu client đã có đúng bản này. */
function sendCached(req, res, etag, body) {
  res.set('ETag', etag)
  res.set('Cache-Control', CACHE_HEADER)
  if (req.headers['if-none-match'] === etag) {
    res.status(304).end()
    return
  }
  res.json(body)
}

contentRouter.get('/content', (req, res) => {
  const { etag, rev, generatedAt, updatedAt, vi, en } = getContent()
  sendCached(req, res, etag, { rev, generatedAt, updatedAt, vi, en })
})

contentRouter.get('/content/:locale', (req, res) => {
  const { locale } = req.params
  if (!LOCALES.has(locale)) {
    res.status(404).json({ error: 'locale khong ton tai', locale })
    return
  }

  const content = getContent()
  // ETag phải kèm mã ngôn ngữ, kẻo bản VI và EN dùng chung một ETag và client
  // đổi ngôn ngữ sẽ nhận 304 với nội dung của ngôn ngữ trước.
  const etag = content.etag.replace(/"$/, `-${locale}"`)
  sendCached(req, res, etag, {
    rev: content.rev,
    generatedAt: content.generatedAt,
    locale,
    content: content[locale],
  })
})

contentRouter.get('/health', (_req, res) => {
  const { rev, updatedAt } = getContent()
  res.json({ ok: true, rev, updatedAt })
})
