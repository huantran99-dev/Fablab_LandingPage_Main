/**
 * Bộ kiểm descriptor của dashboard. Chạy: `npm run check:admin`
 *
 * Form dashboard dựng lại mục CHỈ từ những trường descriptor mô tả
 * (src/admin/sections/descriptors.js). Hai kiểu sai ở đó đều im lặng:
 *
 *   1. Một khoá của nội dung KHÔNG được mô tả -> rơi mất ở lượt lưu kế tiếp. Không
 *      lỗi build, không lỗi máy chủ (schema strict chỉ báo khi khoá đó bắt buộc).
 *   2. Một trường dùng chung bị mô tả thành trường dịch (hai ô VI | EN), hoặc ngược
 *      lại -> form dựng ra dữ liệu mà bộ bất biến của máy chủ từ chối.
 *
 * Kiểm trên snapshot thật: mọi mục của cả hai ngôn ngữ phải đi qua bản làm việc của
 * form rồi quay về Y NGUYÊN, và mọi chữ cấp một của section phải có ô sửa.
 */
import { readFileSync } from 'node:fs'
import { register } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { ROOT, paths } from '../config.js'
import { SHARED_FIELDS } from '../content/invariants.js'

// Module của dashboard dùng specifier thiếu đuôi và import JSX icon; hook lo phần
// specifier, còn JSX thì descriptor và model KHÔNG import tới — giữ như vậy.
register('./import-hook.mjs', import.meta.url)
const srcUrl = (...parts) => pathToFileURL(join(ROOT, 'src', ...parts)).href

const { SECTIONS } = await import(srcUrl('admin', 'sections', 'descriptors.js'))
const { allFields, activeFields, toWorking, fromWorking } = await import(srcUrl('admin', 'editor', 'model.js'))
const { getPath } = await import(srcUrl('admin', 'lib', 'paths.js'))

/** Trường không dịch nhưng không phải khoá tra cứu: tên người (invariants kiểm riêng). */
const SHARED_EXCEPTIONS = new Set(['team.members.name'])

const snapshot = JSON.parse(readFileSync(paths.snapshot, 'utf8'))
const problems = []
const fail = (message) => problems.push(message)

const withoutImages = (value) =>
  Array.isArray(value)
    ? value.map(withoutImages)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'image').map(([key, child]) => [key, withoutImages(child)]))
      : value

const sortKeys = (value) =>
  Array.isArray(value)
    ? value.map(sortKeys)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])]))
      : value

function checkFieldKinds(fields, where) {
  for (const field of fields) {
    if (field.type === 'sublist') {
      checkFieldKinds(field.itemFields, `${where}.${field.key}`)
      continue
    }
    const shared = SHARED_FIELDS.has(field.key) || SHARED_EXCEPTIONS.has(`${where}.${field.key}`)
    if (field.translated && shared) fail(`${where}.${field.key}: la truong dung chung nhung descriptor mo ta thanh truong dich (hai o)`)
    if (!field.translated && !shared) {
      fail(`${where}.${field.key}: descriptor mo ta thanh truong dung chung nhung khong co trong SHARED_FIELDS — may chu se khong kiem hai ban bang nhau`)
    }
  }
}

let items = 0

for (const descriptor of SECTIONS) {
  const vi = withoutImages(snapshot.vi[descriptor.key])
  const en = withoutImages(snapshot.en[descriptor.key])
  if (!vi || !en) {
    fail(`${descriptor.key}: khong co trong snapshot`)
    continue
  }

  // 1. Mọi chữ cấp một có ô sửa.
  const covered = new Set([
    ...descriptor.groups.flatMap((group) => group.fields.map((field) => field.key)),
    ...descriptor.lists.map((list) => list.path),
    ...(descriptor.records ?? []).map((record) => record.path),
  ])
  const walk = (value, path) => {
    if (covered.has(path) || (descriptor.key === 'courses' && path === 'details')) return
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [key, child] of Object.entries(value)) walk(child, path ? `${path}.${key}` : key)
      return
    }
    fail(`${descriptor.key}.${path}: khong co o nao sua duoc tren dashboard`)
  }
  walk(vi, '')

  for (const group of descriptor.groups) {
    for (const field of group.fields) {
      if (!field.translated) fail(`${descriptor.key}.${field.key}: chu chung cua section phai la truong dich`)
    }
  }

  for (const list of descriptor.lists) {
    // 2. Trường dịch / dùng chung khớp máy chủ.
    checkFieldKinds(allFields(list), `${descriptor.key}.${list.path}`)

    // 3. Mọi mục đi qua bản làm việc rồi quay về y nguyên.
    const enItems = getPath(en, list.path) ?? []
    for (const item of getPath(vi, list.path) ?? []) {
      const other = enItems.find((entry) => entry.id === item.id)
      const working = toWorking(allFields(list), item, other)
      const fields = activeFields(list, list.variants ? list.variants.detect(item) : null)
      for (const [locale, original] of [
        ['vi', item],
        ['en', other],
      ]) {
        items += 1
        const back = fromWorking(fields, working, locale)
        if (JSON.stringify(sortKeys(back)) !== JSON.stringify(sortKeys(original))) {
          fail(
            `${descriptor.key}.${list.path}[${item.id}] ${locale}: form lam mat hoac doi du lieu\n` +
              `      goc: ${JSON.stringify(sortKeys(original))}\n      ve : ${JSON.stringify(sortKeys(back))}`,
          )
        }
      }
    }
  }
}

console.log(`  ${SECTIONS.length} section, ${items} muc (vi + en) di qua form`)
console.log('')

if (problems.length === 0) {
  console.log('KET QUA: DAT')
  process.exit(0)
}
for (const problem of problems) console.error(`LOI: ${problem}`)
console.error('')
console.error(`KET QUA: HONG — ${problems.length} van de`)
process.exit(1)
