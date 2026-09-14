/**
 * Di trú nội dung từ mã nguồn vào database. Chạy MỘT LẦN: `npm run seed`
 *
 * Nguồn là `src/i18n/*.js` và `src/assets/images/index.js` — chính những file mà
 * trang đang chạy bằng hôm nay. Sau bước này chúng trở thành **hồ sơ nguồn gốc**,
 * không còn là thứ trang đọc.
 *
 * Toàn bộ nằm trong MỘT giao dịch: hỏng ở bước nào thì database vẫn trống trơn,
 * không để lại trạng thái nửa vời khó gỡ.
 */
import { createHash } from 'node:crypto'
import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { register } from 'node:module'
import { basename, extname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'

import { ROOT, paths } from '../config.js'
import { getDb, closeDb } from '../db/index.js'

register('./import-hook.mjs', import.meta.url)

const SRC_IMAGES = join(ROOT, 'src', 'assets', 'images')
// `import()` trên Windows không nhận đường dẫn 'D:\...', phải là URL file://.
const srcUrl = (...parts) => pathToFileURL(join(ROOT, 'src', ...parts)).href

const SECTION_KEYS = [
  'nav', 'hero', 'stats', 'pillars', 'courses', 'facilities',
  'partners', 'activities', 'team', 'testimonials', 'finalCta', 'footer',
]

/**
 * Ghi chú `// ~` và `// ↺` bóc thẳng từ mã nguồn của index.js.
 *
 * Bóc bằng regex chứ không chép tay: chép tay 15 dòng thì sai một dòng cũng không
 * ai biết, mà đây là thông tin không dựng lại được nếu mất.
 */
function readImageNotes() {
  const source = readFileSync(join(SRC_IMAGES, 'index.js'), 'utf8')
  const notes = new Map()
  for (const match of source.matchAll(/^\s{2}'?([A-Za-z0-9-]+)'?:\s*[^,\n]+,\s*\/\/\s*(.+)$/gm)) {
    notes.set(match[1], match[2].trim())
  }
  return notes
}

/** Map ảnh trong index.js dùng hai quy ước giá trị khác nhau. */
const filenameOf = (value) => (typeof value === 'string' ? value : value?.src)

async function main() {
  const { vi } = await import(srcUrl('i18n', 'vi.js'))
  const { en } = await import(srcUrl('i18n', 'en.js'))
  const { courseDetailsVi } = await import(srcUrl('i18n', 'courseDetails.vi.js'))
  const { courseDetailsEn } = await import(srcUrl('i18n', 'courseDetails.en.js'))
  const { experienceDetailsVi } = await import(srcUrl('i18n', 'experienceDetails.vi.js'))
  const { experienceDetailsEn } = await import(srcUrl('i18n', 'experienceDetails.en.js'))
  const images = await import(srcUrl('assets', 'images', 'index.js'))

  const notes = readImageNotes()
  const db = getDb()

  if (db.prepare('SELECT COUNT(*) AS n FROM section').get().n > 0) {
    console.error('Database da co noi dung. Xoa data/fablab.db roi chay lai neu that su muon seed lai.')
    process.exitCode = 1
    return
  }

  // --- 1. Ảnh: băm, chép, đo -------------------------------------------------
  //
  // Đo bằng sharp chứ không tin số khai trong index.js. Đã kiểm: logo đối tác khai
  // 194x120 trong khi file thật tới 2560x663 — số khai là cỡ HIỂN THỊ, không phải
  // cỡ thật. Vì `w-auto` nên sau khi ảnh tải xong trình duyệt vẫn dùng cỡ thật, nên
  // khai đúng là sửa một lệch lạc đang có chứ không phải gây ra thay đổi.
  mkdirSync(paths.media, { recursive: true })

  const scopes = [
    ['course', images.COURSE_IMAGES],
    ['facility', images.FACILITY_IMAGES],
    ['activity', images.ACTIVITY_IMAGES],
    ['partner', images.PARTNER_LOGOS],
    ['team', images.TEAM_IMAGES],
    ['singleton', { hero: images.HERO_IMAGE, logo: images.LOGO_MARK }],
  ]

  const wanted = new Set()
  for (const [, map] of scopes) {
    for (const value of Object.values(map)) {
      const filename = filenameOf(value)
      if (filename) wanted.add(filename)
    }
  }

  const mediaRows = []
  for (const filename of [...wanted].sort()) {
    const from = join(SRC_IMAGES, filename)
    const bytes = readFileSync(from)
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    const meta = await sharp(bytes).metadata()
    const ext = extname(filename)
    const stored = `${basename(filename, ext)}.${sha256.slice(0, 8)}${ext}`

    copyFileSync(from, join(paths.media, stored))
    mediaRows.push({
      original: filename,
      filename: stored,
      sha256,
      mime: `image/${meta.format === 'jpg' ? 'jpeg' : meta.format}`,
      bytes: statSync(from).size,
      width: meta.width,
      height: meta.height,
    })
  }

  // --- 2. Ghi, tất cả trong một giao dịch ------------------------------------
  const now = new Date().toISOString()

  const insertMedia = db.prepare(
    `INSERT INTO media (filename, sha256, mime, bytes, width, height, kind, origin, created_at)
     VALUES (@filename, @sha256, @mime, @bytes, @width, @height, @kind, 'seed', @created_at)`,
  )
  const insertBinding = db.prepare(
    'INSERT INTO binding (scope, item_id, media_id, note) VALUES (?, ?, ?, ?)',
  )
  const insertSection = db.prepare(
    'INSERT INTO section (locale, key, json, rev, updated_at) VALUES (?, ?, ?, 1, ?)',
  )
  const insertDetail = db.prepare(
    'INSERT INTO course_detail (locale, course_id, source, json, updated_at) VALUES (?, ?, ?, ?, ?)',
  )

  const run = db.transaction(() => {
    const idOfFile = new Map()
    for (const row of mediaRows) {
      const info = insertMedia.run({ ...row, kind: null, created_at: now })
      idOfFile.set(row.original, info.lastInsertRowid)
    }

    let bindingCount = 0
    for (const [scope, map] of scopes) {
      for (const [itemId, value] of Object.entries(map)) {
        const filename = filenameOf(value)
        const mediaId = idOfFile.get(filename)
        if (!mediaId) continue
        insertBinding.run(scope, itemId, mediaId, notes.get(itemId) ?? null)
        bindingCount += 1
      }
    }

    for (const [locale, dict] of Object.entries({ vi, en })) {
      for (const key of SECTION_KEYS) {
        // `courses.details` đi đường riêng: nó bất đối xứng giữa hai ngôn ngữ và
        // một nửa là file sinh ra từ scraper. Giữ nó trong dòng `courses` sẽ buộc
        // bộ kiểm đối xứng phải học ngoại lệ.
        let value = dict[key]
        if (key === 'courses') {
          const { details: _details, ...rest } = value
          value = rest
        }
        insertSection.run(locale, key, JSON.stringify(value), now)
      }
    }

    const detailSources = [
      ['vi', 'scraped', courseDetailsVi],
      ['en', 'scraped', courseDetailsEn],
      ['vi', 'handwritten', experienceDetailsVi],
      ['en', 'handwritten', experienceDetailsEn],
    ]
    let detailCount = 0
    for (const [locale, source, map] of detailSources) {
      for (const [courseId, entry] of Object.entries(map)) {
        insertDetail.run(locale, courseId, source, JSON.stringify(entry), now)
        detailCount += 1
      }
    }

    return { bindingCount, detailCount }
  })

  const { bindingCount, detailCount } = run()

  console.log(`  anh:      ${mediaRows.length} file -> ${paths.media}`)
  console.log(`  binding:  ${bindingCount} (co ${[...notes.keys()].length} ghi chu ~ / ↺ mang theo)`)
  console.log(`  section:  ${SECTION_KEYS.length} x 2 ngon ngu`)
  console.log(`  chi tiet: ${detailCount} dong course_detail`)
  console.log('')
  console.log('Seed xong. Chay `npm run verify:seed` de chung minh khong mat gi.')
}

try {
  await main()
} finally {
  closeDb()
}
