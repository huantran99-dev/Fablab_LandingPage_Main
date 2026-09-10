/**
 * Xuất bản dự phòng: database -> `src/content/snapshot.json` + `public/media/`.
 *
 * Đây là mắt xích giữ hai tính chất mà repo đang có và không được mất:
 *
 * 1. **Không bao giờ trắng trang.** Trang vẽ ngay bằng snapshot đóng gói trong
 *    bundle, rồi mới gọi API lấy bản mới. API chết thì vẫn hiển thị đủ nội dung.
 * 2. **Vẫn chạy được offline.** Ảnh được đồng bộ sang `public/media/` để `vite
 *    build` chép vào `dist/media/`. Nhờ đó `dist/` mang đi đâu cũng tự đủ, không
 *    phụ thuộc tiến trình Node nào.
 *
 * Chạy tự động ở `prebuild`, nên mỗi lần deploy là bản dự phòng tươi lại.
 *
 * Cờ `--if-available`: không có database thì cảnh báo rồi thoát 0, giữ nguyên
 * snapshot đã commit. Nhờ vậy `npm run build` trên máy chưa seed vẫn chạy.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

import { paths } from '../config.js'

const ifAvailable = process.argv.includes('--if-available')

/**
 * Sắp khoá đệ quy cho thứ tự ổn định.
 *
 * MẢNG GIỮ NGUYÊN THỨ TỰ — thứ tự mảng là thứ tự hiển thị trên trang, sắp lại là
 * đổi nội dung. Chỉ sắp khoá của object, để diff git sau mỗi lần deploy chỉ hiện
 * thứ thật sự đổi thay vì nhiễu do thứ tự khoá nhảy lung tung.
 */
function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value).sort()) out[key] = stable(value[key])
    return out
  }
  return value
}

/** Ghi qua file tạm rồi đổi tên: đứt giữa chừng không để lại JSON hỏng. */
function writeAtomic(target, text) {
  const temp = `${target}.tmp`
  writeFileSync(temp, text, 'utf8')
  renameSync(temp, target)
}

function syncMedia() {
  if (!existsSync(paths.media)) return 0
  mkdirSync(paths.publicMedia, { recursive: true })

  let copied = 0
  for (const name of readdirSync(paths.media)) {
    const to = join(paths.publicMedia, name)
    // Tên file mang băm nội dung, nên trùng tên là trùng nội dung — khỏi chép lại.
    if (existsSync(to)) continue
    copyFileSync(join(paths.media, name), to)
    copied += 1
  }
  return copied
}

if (!existsSync(paths.db)) {
  const message = `Khong tim thay database tai ${paths.db}`
  if (ifAvailable) {
    console.warn(`  ${message} — giu nguyen snapshot da commit.`)
    process.exit(0)
  }
  console.error(message)
  process.exit(1)
}

const { getContent } = await import('../content/cache.js')
const { closeDb } = await import('../db/index.js')

const content = getContent()

// CỐ Ý không ghi `generatedAt`: nó đổi mỗi lần chạy, nên file sẽ hiện là "đã sửa"
// ở mọi lần build dù nội dung y nguyên. `rev` và `updatedAt` chỉ đổi khi có người
// thật sự sửa nội dung — vừa đủ cho bảng đo độ tươi, vừa giữ diff git sạch.
const snapshot = stable({
  rev: content.rev,
  updatedAt: content.updatedAt,
  vi: content.vi,
  en: content.en,
})

const text = `${JSON.stringify(snapshot, null, 2)}\n`
const existing = existsSync(paths.snapshot) ? readFileSync(paths.snapshot, 'utf8') : null

mkdirSync(join(paths.snapshot, '..'), { recursive: true })
if (existing === text) {
  console.log(`  snapshot khong doi (rev ${content.rev})`)
} else {
  writeAtomic(paths.snapshot, text)
  console.log(`  snapshot -> rev ${content.rev}, ${(text.length / 1024).toFixed(1)} KB`)
}

const copied = syncMedia()
console.log(`  anh dong bo sang public/media: ${copied} file moi`)

closeDb()
