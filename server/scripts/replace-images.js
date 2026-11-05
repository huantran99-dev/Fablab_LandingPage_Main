/**
 * Thay ảnh của một scope ĐÃ CÓ ẢNH bằng ảnh đóng gói hiện tại trong index.js:
 * `npm run images:replace -- course`
 *
 * Khác `seed:images`: script kia chỉ điền scope CHƯA có ảnh nào (thêm scope mới sau ngày
 * seed) và cố ý không đụng scope admin đang quản lý. Script này dành cho lúc người dùng
 * yêu cầu thay hàng loạt — vd. ảnh khóa học lấy từ bộ slide chính thức "Giới thiệu STEMLab".
 *
 * Đi ĐÚNG đường lưu của dashboard (`writeSectionPair`), không ghi binding trực tiếp:
 * - lịch sử chép bản cũ trước khi ghi → khôi phục được về ảnh cũ từ trang Lịch sử;
 * - `rev` tăng, bộ bất biến chạy, chữ của section giữ nguyên (chỉ gửi lại đúng bản đang có).
 *
 * Ảnh đi qua `processImage` y như ảnh tải lên. Mục đã gắn đúng ảnh (cùng sha256 sau xử lý)
 * thì bỏ qua — chạy lại bao nhiêu lần cũng an toàn. Chỉ đụng mục đang có trên trang; ảnh cũ
 * vẫn ở thư viện, không xoá.
 *
 * Chạy được khi máy chủ đang bật: bộ đệm nội dung khoá theo `rev` đọc từ database.
 * Kiểm thử thì chạy trên BẢN SAO: `DATA_DIR=<thư mục khác> npm run images:replace -- course`.
 */
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { ROOT } from '../config.js'
import { MEDIA_SLOTS } from '../content/assemble.js'
import { WriteError, readSectionPair, writeSectionPair } from '../content/mutate.js'
import { closeDb, getDb } from '../db/index.js'
import { processImage, storeImage } from '../media/process.js'
import { formatIssues, schemaFor } from '../schema/sections.js'
import { SRC_IMAGES, filenameOf, imageScopes } from './image-sources.js'

register('./import-hook.mjs', import.meta.url)

const scope = process.argv[2]
const targets = MEDIA_SLOTS.find((entry) => entry.slot === 'images').targets

function fail(message) {
  console.error(message)
  process.exitCode = 1
}

async function main() {
  if (!scope || !targets[scope]) {
    fail(`Cach dung: npm run images:replace -- <scope>\n  scope: ${Object.keys(targets).join(', ')}`)
    return
  }
  const [section, arrayKey] = targets[scope]
  const images = await import(pathToFileURL(join(ROOT, 'src', 'assets', 'images', 'index.js')).href)
  const map = imageScopes(images).find(([name]) => name === scope)?.[1]
  if (!map) {
    fail(`index.js khong co anh dong goi cho scope '${scope}'.`)
    return
  }

  const db = getDb()
  const pair = readSectionPair(section)
  const live = new Set((pair.vi?.[arrayKey] ?? []).map((item) => item.id))
  const currentSha = db.prepare('SELECT m.sha256 FROM binding b JOIN media m ON m.id = b.media_id WHERE b.scope = ? AND b.item_id = ?')

  const pending = []
  let same = 0
  for (const [itemId, value] of Object.entries(map)) {
    const filename = filenameOf(value)
    if (!filename || !live.has(itemId)) continue
    const processed = await processImage(readFileSync(join(SRC_IMAGES, filename)))
    if (currentSha.get(scope, itemId)?.sha256 === processed.sha256) {
      same += 1
      continue
    }
    pending.push({ itemId, filename, processed, old: pair.images?.[itemId]?.url ?? '(chua co anh)' })
  }

  if (pending.length === 0) {
    console.log(`Khong co gi de thay: ${same} muc da gan dung anh.`)
    return
  }

  // Chữ gửi lại đúng như route PUT làm: qua schema trước khi ghi.
  const schema = schemaFor(section)
  const vi = schema.safeParse(pair.vi)
  const en = schema.safeParse(pair.en)
  if (!vi.success || !en.success) {
    fail(`Noi dung hien tai cua '${section}' khong qua schema — sua tren dashboard truoc:\n${JSON.stringify(formatIssues(vi.error ?? en.error), null, 2)}`)
    return
  }

  const changes = {}
  for (const entry of pending) {
    const { row } = storeImage(db, entry.processed, entry.filename)
    changes[entry.itemId] = row.id
    entry.url = `/media/${row.filename}`
  }

  const outcome = writeSectionPair({
    section,
    vi: vi.data,
    en: en.data,
    images: changes,
    expectedRev: pair.rev,
    note: `thay ${pending.length} anh bang npm run images:replace`,
  })

  for (const entry of pending) console.log(`  ${entry.itemId.padEnd(24)} ${entry.old}  ->  ${entry.url}`)
  console.log(`Da thay ${pending.length} anh (${same} muc da dung tu truoc). rev ${section}: ${outcome.rev}.`)
  for (const warning of outcome.warnings ?? []) console.log(`  canh bao: ${warning}`)
  console.log('Chay `npm run build` de ban offline (snapshot + public/media) mang anh moi.')
}

try {
  await main()
} catch (error) {
  if (error instanceof WriteError) fail(`May chu tu choi (${error.status}): ${JSON.stringify(error.body)}`)
  else throw error
} finally {
  closeDb()
}
