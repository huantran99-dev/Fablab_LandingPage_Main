/**
 * Chứng minh việc di trú không làm mất hay đổi nội dung nào. `npm run verify:seed`
 *
 * Đây là điều kiện nghiệm thu thật của GĐ 2, và nó thay cho bộ test mà repo không
 * có: dựng lại `{vi, en}` từ database rồi so SÂU với chính các module i18n gốc.
 *
 * Trường `image` được tách ra so riêng, vì đó là thứ DUY NHẤT cố ý đổi: ảnh chuyển
 * từ map trong mã nguồn sang bảng `binding`, và kích thước lấy theo số đo thật của
 * file thay vì số khai trong `index.js`. Chênh lệch được liệt kê ra từng dòng chứ
 * không im lặng bỏ qua — bỏ qua im lặng thì bộ kiểm này thành vô nghĩa.
 */
import { register } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { ROOT } from '../config.js'
import { assemble } from '../content/assemble.js'
import { getDb, closeDb } from '../db/index.js'

register('./import-hook.mjs', import.meta.url)
const srcUrl = (...parts) => pathToFileURL(join(ROOT, 'src', ...parts)).href

/** Tách mọi trường `image` ra khỏi bản ráp, trả về danh sách đã tách. */
function extractImages(node, path = '', found = []) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => extractImages(item, `${path}[${item?.id ?? index}]`, found))
    return found
  }
  if (node && typeof node === 'object') {
    if (node.image && typeof node.image === 'object' && typeof node.image.url === 'string') {
      found.push({ path, image: node.image })
      delete node.image
    }
    for (const [key, value] of Object.entries(node)) {
      extractImages(value, path ? `${path}.${key}` : key, found)
    }
  }
  return found
}

/** So sâu, trả về danh sách đường khác nhau. Dừng ở 40 dòng cho dễ đọc. */
function diff(a, b, path = '', out = []) {
  if (out.length >= 40) return out

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      out.push(`${path}: mot ben la mang, ben kia khong`)
      return out
    }
    if (a.length !== b.length) out.push(`${path}: do dai ${a.length} != ${b.length}`)
    for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
      diff(a[i], b[i], `${path}[${a[i]?.id ?? i}]`, out)
    }
    return out
  }

  const objA = a && typeof a === 'object'
  const objB = b && typeof b === 'object'
  if (objA !== objB) {
    out.push(`${path}: kieu khac nhau (${typeof a} vs ${typeof b})`)
    return out
  }

  if (objA) {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(key in a)) out.push(`${path}.${key}: chi co trong ban goc`)
      else if (!(key in b)) out.push(`${path}.${key}: chi co trong database`)
      else diff(a[key], b[key], path ? `${path}.${key}` : key, out)
    }
    return out
  }

  if (a !== b) out.push(`${path}: '${a}' != '${b}'`)
  return out
}

const { vi } = await import(srcUrl('i18n', 'vi.js'))
const { en } = await import(srcUrl('i18n', 'en.js'))
const images = await import(srcUrl('assets', 'images', 'index.js'))

const db = getDb()
const built = assemble(db)
const rebuilt = { vi: built.vi, en: built.en }

const attached = { vi: extractImages(rebuilt.vi), en: extractImages(rebuilt.en) }

const problems = [...diff(vi, rebuilt.vi, 'vi'), ...diff(en, rebuilt.en, 'en')]

console.log(`  anh gan vao noi dung: vi=${attached.vi.length} en=${attached.en.length}`)

// Số khai trong index.js so với số đo thật. Chỉ các map có khai kích thước mới so
// được; ba map còn lại dùng hằng số chung.
const byPath = new Map(attached.vi.map((entry) => [entry.path, entry.image]))
const declared = [
  ['facilities', 'facilities.items', images.FACILITY_IMAGES],
  ['partners', 'partners.items', images.PARTNER_LOGOS],
]
const resized = []
for (const [label, prefix, map] of declared) {
  for (const [id, value] of Object.entries(map)) {
    const image = byPath.get(`${prefix}[${id}]`)
    if (!image) continue
    if (image.width !== value.width || image.height !== value.height) {
      resized.push(`${label}/${id}: khai ${value.width}x${value.height} -> that ${image.width}x${image.height}`)
    }
  }
}
const heroImage = byPath.get('hero')
if (heroImage && (heroImage.width !== images.HERO_IMAGE.width || heroImage.height !== images.HERO_IMAGE.height)) {
  resized.push(`hero: khai ${images.HERO_IMAGE.width}x${images.HERO_IMAGE.height} -> that ${heroImage.width}x${heroImage.height}`)
}
for (const [label, size] of [['courses', images.COURSE_IMAGE_SIZE], ['team', images.TEAM_IMAGE_SIZE]]) {
  const off = attached.vi.filter(
    (entry) => entry.path.startsWith(label === 'team' ? 'team.members' : 'courses.items') &&
      (entry.image.width !== size.width || entry.image.height !== size.height),
  )
  if (off.length > 0) resized.push(`${label}: ${off.length} anh lech so voi hang so chung ${size.width}x${size.height}`)
}

if (resized.length > 0) {
  console.log('')
  console.log(`  ${resized.length} anh doi kich thuoc khai bao (CO Y — lay so do that cua file):`)
  for (const line of resized) console.log(`    ${line}`)
}

console.log('')
if (problems.length === 0) {
  console.log('identical — noi dung dung lai tu database khop tuyet doi voi module goc')
  closeDb()
  process.exit(0)
}

for (const line of problems) console.error(`KHAC: ${line}`)
console.error('')
console.error(`KHONG khop — ${problems.length} khac biet${problems.length >= 40 ? ' (da cat bot)' : ''}`)
closeDb()
process.exit(1)
