/**
 * Bộ kiểm bất biến nội dung. Chạy: `npm run check:content`
 *
 * Repo này KHÔNG có bộ test. Đây là thứ thay thế. Toàn bộ luật nằm ở
 * [content/invariants.js](../content/invariants.js) — dùng chung với đường ghi
 * của dashboard, nên luật chặn lượt lưu và luật của bộ kiểm là MỘT, không phải hai
 * bản chép tay trôi lệch nhau. File này chỉ nạp dữ liệu, gọi, và in báo cáo.
 *
 * Nguyên tắc: **so hai bản với nhau, không so với hằng số**. Con số tổng được in
 * ra như thông tin tham khảo, không bao giờ được dùng làm điều kiện đạt/hỏng.
 */
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { checkInvariants } from '../content/invariants.js'
import { scanLookups } from '../content/lookups.js'

// Phải đăng ký TRƯỚC mọi `await import()` module i18n: chúng dùng specifier thiếu
// đuôi và import thẳng file ảnh, hai thứ Node ESM không tự xử lý được.
register('./import-hook.mjs', import.meta.url)

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const src = (...parts) => join(ROOT, 'src', ...parts)

// `import()` trên Windows KHÔNG nhận đường dẫn 'D:\...' — bắt buộc phải là URL
// file://. Đây là bẫy chỉ lộ ra trên Windows, Linux thì đường dẫn tuyệt đối chạy
// bình thường, nên rất dễ viết ra rồi CI mới báo.
const srcUrl = (...parts) => pathToFileURL(src(...parts)).href

/**
 * Hai nguồn kiểm được, cùng một bộ ràng buộc:
 *
 *   mặc định    — module i18n trong mã nguồn (corpus seed, hồ sơ nguồn gốc)
 *   --snapshot  — `src/content/snapshot.json`, tức bản dự phòng THẬT SỰ được đóng
 *                 gói và phục vụ cho người xem khi API không trả lời
 *
 * Bản dự phòng mới là thứ người dùng nhìn thấy lúc trục trặc, nên nó phải chịu
 * đúng bộ kiểm đó — không được tin rằng "seed đúng thì snapshot tất đúng".
 */
const useSnapshot = process.argv.includes('--snapshot')

const header = []
let vi
let en
let imageMaps = null

if (useSnapshot) {
  const snapshot = JSON.parse(readFileSync(join(ROOT, 'src', 'content', 'snapshot.json'), 'utf8'))
  vi = snapshot.vi
  en = snapshot.en
  header.push(`nguon: snapshot.json (rev ${snapshot.rev})`)
} else {
  ;({ vi } = await import(srcUrl('i18n', 'vi.js')))
  ;({ en } = await import(srcUrl('i18n', 'en.js')))
  imageMaps = await import(srcUrl('assets', 'images', 'index.js'))
  header.push('nguon: module i18n trong ma nguon')
}

const result = checkInvariants({ vi, en }, scanLookups(ROOT), { imageMaps })
const errors = [...result.errors]
const notes = [...header, ...result.notes]

// --- Hai luật CHỈ dành cho corpus seed ---------------------------------------

if (!useSnapshot) {
  // Bẫy đã sập một lần: script thay `age: '...'` hàng loạt ghi đè nhầm vào
  // `nav.switchLanguage` vì chuỗi con 'age: ' nằm trong "switchLangu*age: '*".
  // Đây là chốt cho việc patch FILE bằng regex, không phải luật nội dung — nên
  // không nằm trong invariants.js, kẻo dashboard không bao giờ sửa được ô này.
  if (vi.nav.switchLanguage !== 'Chuyển ngôn ngữ') errors.push(`vi nav.switchLanguage sai: '${vi.nav.switchLanguage}'`)
  if (en.nav.switchLanguage !== 'Switch language') errors.push(`en nav.switchLanguage sai: '${en.nav.switchLanguage}'`)

  // Trộn nông nên mục viết tay THAY HOÀN TOÀN mục sinh ra cùng tên. Đúng ý định,
  // nhưng phải nhìn thấy được, kẻo thành truyền miệng.
  const { courseDetailsVi } = await import(srcUrl('i18n', 'courseDetails.vi.js'))
  const { experienceDetailsVi } = await import(srcUrl('i18n', 'experienceDetails.vi.js'))
  const collisions = Object.keys(experienceDetailsVi).filter((id) => id in courseDetailsVi)
  if (collisions.length > 0) {
    notes.push(`id trung giua courseDetails va experienceDetails: ${collisions.join(', ')} (ban viet tay thang)`)
  }
}

// --- Báo cáo ----------------------------------------------------------------

for (const line of notes) console.log(`  ${line}`)
for (const line of result.warnings) console.log(`  canh bao: ${line}`)
console.log('')

if (errors.length === 0) {
  console.log('KET QUA: DAT')
  process.exit(0)
}

for (const problem of errors) console.error(`LOI: ${problem}`)
console.error('')
console.error(`KET QUA: HONG — ${errors.length} van de`)
process.exit(1)
