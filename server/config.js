/**
 * Cấu hình máy chủ, đọc một lần từ biến môi trường.
 *
 * Mọi giá trị đều có mặc định chạy được ngay trên máy lập trình, để `npm run
 * server` không cần file `.env` nào. Chỉ khi lên máy chủ thật mới phải đặt.
 */
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const int = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) ? parsed : fallback
}

export const config = {
  port: int(process.env.PORT, 3001),

  /** Thư mục dữ liệu BỀN: database và ảnh tải lên. Không nằm trong git. */
  dataDir: process.env.DATA_DIR ? resolve(process.env.DATA_DIR) : join(ROOT, 'data'),

  /** Thư mục `dist/` do Vite dựng ra; máy chủ phục vụ tĩnh ở chế độ production. */
  distDir: join(ROOT, 'dist'),

  isProduction: process.env.NODE_ENV === 'production',

  /**
   * Gốc trang, dùng để kiểm `Origin` ở GĐ 3. Ở chế độ phát triển là gốc của Vite
   * dev server chứ không phải của chính máy chủ này — trình duyệt đang đứng ở đó.
   */
  siteOrigin: process.env.SITE_ORIGIN ?? 'http://localhost:5173',
}

export const paths = {
  db: join(config.dataDir, 'fablab.db'),
  media: join(config.dataDir, 'media'),
  /** Bản dự phòng đóng gói vào bundle. SINH RA nhưng CÓ commit. */
  snapshot: join(ROOT, 'src', 'content', 'snapshot.json'),
  /** Vite chép nguyên thư mục này vào `dist/`, nhờ đó `dist/` vẫn tự đủ khi offline. */
  publicMedia: join(ROOT, 'public', 'media'),
}
