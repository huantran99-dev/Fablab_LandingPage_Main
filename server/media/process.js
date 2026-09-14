/**
 * Xử lý ảnh tải lên: đo, xoay đúng chiều, thu nhỏ, XOÁ METADATA, băm, lưu.
 *
 * Ba điều không được bỏ:
 *
 * 1. **Xoá EXIF.** Ảnh chụp bằng điện thoại mang toạ độ GPS nơi chụp. Đây là trang
 *    công khai với ảnh học sinh và giảng viên có thật — để lọt metadata là công bố
 *    vị trí của họ. sharp mặc định KHÔNG chép metadata sang ảnh đầu ra; `rotate()`
 *    phải chạy trước để áp hướng xoay EXIF vào điểm ảnh, kẻo xoá EXIF xong ảnh
 *    dựng đứng thành nằm ngang.
 * 2. **Băm SAU khi xử lý**, không băm file gốc: tên file mang băm của đúng những
 *    byte được phục vụ, nên đổi ảnh là đổi URL, cache tự hết hạn.
 * 3. **Chặn ảnh quá nhiều điểm ảnh trước khi giải nén** (`limitInputPixels`) — một
 *    file PNG vài KB có thể nở ra hàng GB bộ nhớ.
 *
 * PNG giữ PNG vì logo đối tác cần nền trong suốt; WebP có kênh alpha cũng thành
 * PNG. Còn lại thành JPEG, đồng bộ với bộ ảnh seed.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'

import { paths } from '../config.js'

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** Cạnh dài tối đa. Khung lớn nhất trên trang là ảnh hero ~600px CSS, ×2 cho màn hình dày điểm ảnh. */
const MAX_EDGE = 1600
const MAX_INPUT_PIXELS = 50_000_000

export class MediaError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

/** Tên file đọc được, không dấu. Tiếng Việt bỏ dấu phải xử lý riêng `đ`, NFD không tách được nó. */
export function slugify(name) {
  const base = String(name ?? '').replace(/\.[^.]*$/, '')
  const slug = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '')
  return slug || 'anh'
}

export async function processImage(buffer) {
  let meta
  try {
    meta = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata()
  } catch {
    throw new MediaError(415, 'file khong phai anh hop le, hoac qua nhieu diem anh')
  }
  if (!['jpeg', 'png', 'webp'].includes(meta.format)) {
    throw new MediaError(415, `dinh dang '${meta.format}' khong duoc nhan — chi JPEG, PNG, WebP`)
  }

  const keepAlpha = meta.format === 'png' || (meta.format === 'webp' && meta.hasAlpha)
  const pipeline = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS })
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })

  const encoded = keepAlpha
    ? pipeline.png({ compressionLevel: 9, adaptiveFiltering: true })
    : pipeline.jpeg({ quality: 82, mozjpeg: true })

  const { data, info } = await encoded.toBuffer({ resolveWithObject: true })
  return {
    data,
    width: info.width,
    height: info.height,
    ext: keepAlpha ? 'png' : 'jpg',
    mime: keepAlpha ? 'image/png' : 'image/jpeg',
    sha256: createHash('sha256').update(data).digest('hex'),
  }
}

/**
 * Lưu ảnh đã xử lý vào thư viện. Trùng nội dung thì trả dòng cũ, không tạo bản sao.
 *
 * Lưu ý: ảnh seed được băm theo file GỐC, ảnh tải lên băm theo bản ĐÃ XỬ LÝ, nên tải
 * lại một ảnh seed sẽ ra một dòng mới. Chấp nhận — hợp nhất hai cách băm là đổi URL
 * của 57 ảnh đang chạy.
 */
export function storeImage(db, processed, originalName) {
  const existing = db.prepare('SELECT * FROM media WHERE sha256 = ?').get(processed.sha256)
  if (existing) return { row: existing, created: false }

  const filename = `${slugify(originalName)}.${processed.sha256.slice(0, 8)}.${processed.ext}`
  mkdirSync(paths.media, { recursive: true })
  writeFileSync(join(paths.media, filename), processed.data)

  const row = db
    .prepare(
      `INSERT INTO media (filename, sha256, mime, bytes, width, height, kind, origin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, 'upload', ?)
       RETURNING *`,
    )
    .get(
      filename,
      processed.sha256,
      processed.mime,
      processed.data.length,
      processed.width,
      processed.height,
      new Date().toISOString(),
    )
  return { row, created: true }
}
