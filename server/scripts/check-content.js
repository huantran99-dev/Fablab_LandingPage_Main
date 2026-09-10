/**
 * Bộ kiểm bất biến nội dung. Chạy: `npm run check:content`
 *
 * Repo này KHÔNG có bộ test. Đây là thứ thay thế: nó khẳng định những ràng buộc
 * mà hôm nay đang đúng nhờ dữ liệu tĩnh, và sẽ vỡ ngay khi có dashboard cho phép
 * thêm/sửa mục. Mọi ràng buộc ở đây đều thuộc loại **không có cảnh báo lúc build**
 * — sai là im lặng: chip trống, huy hiệu rỗng, ảnh vỡ, hoặc mục biến mất khỏi trang.
 *
 * Nguyên tắc: **so hai bản với nhau, không so với hằng số**. Con số tổng được in
 * ra như thông tin tham khảo, không bao giờ được dùng làm điều kiện đạt/hỏng.
 *
 * Các bảng tra cứu (icon, neo) được **quét ra từ mã nguồn** chứ không chép tay
 * vào đây — chép tay là tự tạo thêm một chỗ nữa để lệch.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { register } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { assertParity } from '../content/parity.js'

// Phải đăng ký TRƯỚC mọi `await import()` module i18n: chúng dùng specifier thiếu
// đuôi và import thẳng file ảnh, hai thứ Node ESM không tự xử lý được.
register('./import-hook.mjs', import.meta.url)

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const src = (...parts) => join(ROOT, 'src', ...parts)

// `import()` trên Windows KHÔNG nhận đường dẫn 'D:\...' — bắt buộc phải là URL
// file://. Đây là bẫy chỉ lộ ra trên Windows, Linux thì đường dẫn tuyệt đối chạy
// bình thường, nên rất dễ viết ra rồi CI mới báo.
const srcUrl = (...parts) => pathToFileURL(src(...parts)).href

const problems = []
const notes = []
const fail = (message) => problems.push(message)
const note = (message) => notes.push(message)

/** Khoá cấp một của một object literal trong mã nguồn, quét theo thụt đầu dòng 2. */
function literalKeys(file, constName) {
  const source = readFileSync(file, 'utf8')
  const start = source.indexOf(`${constName} = {`)
  if (start === -1) return null
  const body = source.slice(start)
  const end = body.indexOf('\n}')
  if (end === -1) return null
  return [...body.slice(0, end).matchAll(/^ {2}'?([A-Za-z0-9-]+)'?:/gm)].map((match) => match[1])
}

// ---------------------------------------------------------------------------
// Nạp dữ liệu
// ---------------------------------------------------------------------------

const { vi } = await import(srcUrl('i18n', 'vi.js'))
const { en } = await import(srcUrl('i18n', 'en.js'))
const images = await import(srcUrl('assets', 'images', 'index.js'))

const dicts = { vi, en }

const ICON_IDS = literalKeys(src('assets', 'icons', 'CourseIcons.jsx'), 'const PATHS')
const PILLAR_ICON_IDS = literalKeys(src('assets', 'icons', 'Icons.jsx'), 'const PILLAR_PATHS')
const FACILITY_ICON_IDS = literalKeys(src('assets', 'icons', 'Icons.jsx'), 'const FACILITY_PATHS')

for (const [name, value] of [
  ['PATHS (CourseIcons.jsx)', ICON_IDS],
  ['PILLAR_PATHS (Icons.jsx)', PILLAR_ICON_IDS],
  ['FACILITY_PATHS (Icons.jsx)', FACILITY_ICON_IDS],
]) {
  if (!value) fail(`Khong quet duoc bang icon ${name} — bo kiem dang chay mu, sua lai literalKeys()`)
}

/**
 * Tập neo mà các component THẬT SỰ dựng ra.
 *
 * Quét từ mã nguồn rồi cộng thêm hai họ neo suy từ dữ liệu. Nhờ vậy thêm một nhóm
 * khóa học hay một khối hoạt động là neo tự có, không phải nhớ cập nhật ở đây.
 */
function renderedAnchors() {
  const anchors = new Set()
  const dir = src('components')

  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.jsx')) continue
    const source = readFileSync(join(entry.parentPath ?? dir, entry.name), 'utf8')
    for (const match of source.matchAll(/<(?:Section|section|footer)\s+id="([a-z0-9-]+)"/g)) {
      anchors.add(match[1])
    }
  }

  for (const group of vi.activities.groups) anchors.add(group.id)
  for (const group of vi.courses.groups) anchors.add(`courses-${group.id}`)
  return anchors
}

// ---------------------------------------------------------------------------
// 1. Đối xứng cấu trúc hai ngôn ngữ
// ---------------------------------------------------------------------------

const parity = assertParity(vi, en)
note(`doi xung: ${parity.total} duong khoa`)
for (const path of parity.missingInEn) fail(`thieu trong EN: ${path}`)
for (const path of parity.missingInVi) fail(`thieu trong VI: ${path}`)

// ---------------------------------------------------------------------------
// 2. Khoá tra cứu của khoá học
// ---------------------------------------------------------------------------

for (const [lang, dict] of Object.entries(dicts)) {
  const stageIds = new Set(dict.courses.stages.map((stage) => stage.id))
  const topicIds = new Set(dict.courses.topics.map((topic) => topic.id))
  const groupIds = new Set(dict.courses.groups.map((group) => group.id))
  const levelIds = new Set(Object.keys(dict.courses.levels))

  for (const course of dict.courses.items) {
    const at = `${lang} courses.items[${course.id}]`
    if (!groupIds.has(course.group)) fail(`${at}: group '${course.group}' khong co trong courses.groups`)

    if (course.group === 'experience') {
      if (!stageIds.has(course.stage)) fail(`${at}: stage '${course.stage}' khong co -> chip trong`)
      if (!topicIds.has(course.topic)) fail(`${at}: topic '${course.topic}' khong co -> chip trong`)
      if (ICON_IDS && !ICON_IDS.includes(course.icon)) fail(`${at}: icon '${course.icon}' khong co -> huy hieu rong`)
    } else {
      if (!levelIds.has(course.level)) fail(`${at}: level '${course.level}' khong co trong courses.levels`)
      if (ICON_IDS && !ICON_IDS.includes(course.id)) fail(`${at}: khong co icon tra theo id -> huy hieu rong`)
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Hoạt động: mọi `kind` phải có nhãn và phải rơi vào một khối
// ---------------------------------------------------------------------------

// Ánh xạ kind -> khối nay nằm trong dữ liệu (`activities.groups[].kinds`), nên
// kiểm được trực tiếp thay vì phải quét mã nguồn component.
//
// Component đã có đường lui (kind lạ rơi vào khối cuối) nên đây không còn là lỗi
// "biến mất khỏi trang" nữa. Vẫn để mức LỖI: rơi vào khối cuối là **đặt sai chỗ**,
// chỉ khác là sai một cách nhìn thấy được.
for (const [lang, dict] of Object.entries(dicts)) {
  const kindLabels = new Set(Object.keys(dict.activities.kinds))
  const claimed = new Set(dict.activities.groups.flatMap((group) => group.kinds ?? []))

  for (const item of dict.activities.items) {
    const at = `${lang} activities.items[${item.id}]`
    if (!kindLabels.has(item.kind)) fail(`${at}: kind '${item.kind}' khong co nhan trong activities.kinds`)
    if (!claimed.has(item.kind)) {
      fail(`${at}: kind '${item.kind}' khong khoi nao nhan -> roi vao khoi cuoi, sai cho`)
    }
  }

  for (const kind of claimed) {
    if (!kindLabels.has(kind)) fail(`${lang} activities.groups: nhan kind '${kind}' nhung khong co nhan chu`)
  }
}

// ---------------------------------------------------------------------------
// 4. Trụ cột và thiết bị: id phải có trong bảng icon và bảng bố cục
// ---------------------------------------------------------------------------

// Từ GĐ 1 các chỗ này đều có đường lui: thiếu icon thì bỏ hẳn huy hiệu, thiếu
// trong bảng sắc/bố cục thì lấy theo vòng lặp chỉ số. Không còn là lỗi làm trắng
// trang, nên chỉ ghi chú — đây là khoảng trống nội dung, không phải hỏng hóc.
const PILLAR_TONE_IDS = literalKeys(src('components', 'Pillars.jsx'), 'const TONES')
const FACILITY_LAYOUT_IDS = literalKeys(src('components', 'Facilities.jsx'), 'const LAYOUT')

const TOLERANT = [
  ['pillars.items', vi.pillars.items, PILLAR_ICON_IDS, 'khong co icon rieng'],
  ['facilities.items', vi.facilities.items, FACILITY_ICON_IDS, 'khong co icon rieng'],
  ['pillars.items', vi.pillars.items, PILLAR_TONE_IDS, 'lay sac theo vong lap'],
  ['facilities.items', vi.facilities.items, FACILITY_LAYOUT_IDS, 'lay bo cuc theo vong lap'],
]

for (const [label, items, known, reason] of TOLERANT) {
  if (!known) continue
  const missing = items.filter((item) => !known.includes(item.id)).map((item) => item.id)
  if (missing.length > 0) note(`${label}: ${missing.join(', ')} -> ${reason}`)
}

// ---------------------------------------------------------------------------
// 5. Ảnh: mọi mục phải có ảnh, và không key ảnh nào mồ côi
// ---------------------------------------------------------------------------

const IMAGE_BINDINGS = [
  ['courses.items', vi.courses.items, images.COURSE_IMAGES, true],
  ['facilities.items', vi.facilities.items, images.FACILITY_IMAGES, true],
  ['activities.items', vi.activities.items, images.ACTIVITY_IMAGES, true],
  ['partners.items', vi.partners.items, images.PARTNER_LOGOS, false],
  ['team.members', vi.team.members, images.TEAM_IMAGES, false],
]

for (const [label, items, map, required] of IMAGE_BINDINGS) {
  const ids = new Set(items.map((item) => item.id))
  for (const item of items) {
    if (required && !map[item.id]) fail(`${label}[${item.id}]: thieu anh -> card hien ANH VO`)
  }
  const orphans = Object.keys(map).filter((key) => !ids.has(key))
  if (orphans.length > 0) note(`${label}: ${orphans.length} key anh mo coi -> ${orphans.join(', ')}`)

  if (!required) {
    const missing = items.filter((item) => !map[item.id]).map((item) => item.id)
    if (missing.length > 0) note(`${label}: ${missing.length} muc dung ban du phong (${missing.join(', ')})`)
  }
}

// ---------------------------------------------------------------------------
// 6. Các bất biến lặt vặt nhưng im lặng khi sai
// ---------------------------------------------------------------------------

for (const [lang, dict] of Object.entries(dicts)) {
  const leads = dict.team.members.filter((member) => member.lead)
  if (leads.length !== 1) fail(`${lang} team.members: phai co dung 1 nguoi 'lead', dang co ${leads.length}`)

  for (const stat of dict.stats.items) {
    if (typeof stat.value !== 'number') {
      fail(`${lang} stats.items[${stat.id}].value la ${typeof stat.value}, phai la number -> CountUp tinh rac`)
    }
  }
}

// Tên người không được phép khác nhau giữa hai bản dịch.
for (const [index, member] of vi.team.members.entries()) {
  const other = en.team.members[index]
  if (other && member.name !== other.name) {
    fail(`team.members[${member.id}]: ten khac nhau giua hai ban — vi '${member.name}' / en '${other.name}'`)
  }
}

// Bẫy đã sập một lần: script thay `age: '...'` hàng loạt ghi đè nhầm vào
// `nav.switchLanguage` vì chuoi con 'age: ' nam trong "switchLangu*age: '*".
if (vi.nav.switchLanguage !== 'Chuyển ngôn ngữ') fail(`vi nav.switchLanguage sai: '${vi.nav.switchLanguage}'`)
if (en.nav.switchLanguage !== 'Switch language') fail(`en nav.switchLanguage sai: '${en.nav.switchLanguage}'`)

// ---------------------------------------------------------------------------
// 7. Mọi href phải trỏ tới neo có thật
// ---------------------------------------------------------------------------

const anchors = renderedAnchors()
note(`neo dung ra: ${[...anchors].sort().join(', ')}`)

function checkHref(where, href) {
  if (!href || !href.startsWith('#')) return
  const id = href.slice(1)
  if (id && !anchors.has(id)) fail(`${where}: href '${href}' khong tro toi neo nao -> link chet, khong bao loi`)
}

for (const [lang, dict] of Object.entries(dicts)) {
  for (const link of dict.nav.links) {
    if (link.href) checkHref(`${lang} nav.links[${link.id}]`, link.href)
    for (const child of link.children ?? []) checkHref(`${lang} nav.links[${link.id}].children[${child.id}]`, child.href)
    if (link.href && link.children) fail(`${lang} nav.links[${link.id}]: co ca href lan children`)
    if (!link.href && !link.children) fail(`${lang} nav.links[${link.id}]: khong co href lan children`)
  }
  for (const column of dict.footer.columns) {
    for (const link of column.links) checkHref(`${lang} footer.columns[${column.id}].links[${link.id}]`, link.href)
  }
}

// ---------------------------------------------------------------------------
// 8. Chi tiết khoá học: mục mồ côi và id trùng giữa hai nguồn
// ---------------------------------------------------------------------------

const { courseDetailsVi } = await import(srcUrl('i18n', 'courseDetails.vi.js'))
const { experienceDetailsVi } = await import(srcUrl('i18n', 'experienceDetails.vi.js'))

const courseIds = new Set(vi.courses.items.map((course) => course.id))
const orphanDetails = Object.keys(vi.courses.details).filter((id) => !courseIds.has(id))
if (orphanDetails.length > 0) {
  note(`courses.details: ${orphanDetails.length} muc mo coi (khong co card nao tra toi) -> ${orphanDetails.join(', ')}`)
}
const missingDetails = [...courseIds].filter((id) => !vi.courses.details[id])
if (missingDetails.length > 0) note(`courses.details: ${missingDetails.length} khoa chua co noi dung popup -> ${missingDetails.join(', ')}`)

// Trộn nông nên mục viết tay THAY HOÀN TOÀN mục sinh ra cùng tên. Đúng ý định,
// nhưng phải nhìn thấy được, kẻo thành truyền miệng.
const collisions = Object.keys(experienceDetailsVi).filter((id) => id in courseDetailsVi)
if (collisions.length > 0) note(`id trung giua courseDetails va experienceDetails: ${collisions.join(', ')} (ban viet tay thang)`)

// ---------------------------------------------------------------------------
// Báo cáo
// ---------------------------------------------------------------------------

for (const line of notes) console.log(`  ${line}`)
console.log('')

if (problems.length === 0) {
  console.log('KET QUA: DAT')
  process.exit(0)
}

for (const problem of problems) console.error(`LOI: ${problem}`)
console.error('')
console.error(`KET QUA: HONG — ${problems.length} van de`)
process.exit(1)
