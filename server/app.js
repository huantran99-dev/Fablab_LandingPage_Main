/**
 * Lắp ráp ứng dụng Express.
 *
 * Tách khỏi `index.js` để script và về sau là test có thể dựng app lên mà KHÔNG
 * mở cổng. `index.js` là file duy nhất gọi `listen`.
 */
import express from 'express'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { config, paths } from './config.js'
import { contentRouter } from './routes/content.public.js'

export function createApp() {
  const app = express()

  // Sau nginx, `X-Forwarded-For` mới là IP thật. Bắt buộc phải bật, kẻo bộ giới
  // hạn số lần đăng nhập ở GĐ 3 nhìn mọi request thành 127.0.0.1: một lần sai mật
  // khẩu là khoá cả thế giới, mà bộ giới hạn thì trông vẫn như đang chạy đúng.
  app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.use(express.json({ limit: '2mb' }))

  // Ảnh: tên file mang băm nội dung nên đổi ảnh là đổi URL — cache vĩnh viễn được.
  const mediaOptions = { immutable: true, maxAge: '1y', fallthrough: true }
  app.use('/media', express.static(paths.media, mediaOptions))
  // Rơi về ảnh đã đóng gói trong dist: nhờ đó `dist/` mang đi đâu cũng tự đủ.
  app.use('/media', express.static(join(config.distDir, 'media'), mediaOptions))

  app.use('/api', contentRouter)

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'khong co route nay' })
  })

  // Ở production máy chủ phục vụ luôn trang tĩnh. Ở chế độ phát triển thì Vite lo
  // việc đó và chuyển tiếp `/api` sang đây, nên không đụng tới.
  if (existsSync(config.distDir)) {
    app.use(express.static(config.distDir))
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(join(config.distDir, 'index.html'))
    })
  }

  app.use((error, _req, res, _next) => {
    console.error(error)
    res.status(500).json({ error: 'loi may chu' })
  })

  return app
}
