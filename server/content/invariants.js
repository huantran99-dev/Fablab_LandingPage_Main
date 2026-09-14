/**
 * Bất biến nội dung — MỘT bộ luật, hai nơi dùng.
 *
 *   - `npm run check:content` / `check:snapshot` (thay cho bộ test repo không có)
 *   - đường ghi của dashboard: chạy trên từ điển đã ráp với section mới thay vào,
 *     có lỗi thì cả giao dịch rollback
 *
 * Mọi luật ở đây thuộc loại **không có cảnh báo lúc build** — sai là im lặng: chip
 * trống, huy hiệu rỗng, link chết, hoặc mục rơi sai khối.
 *
 * Ba mức:
 *   errors   — chặn ghi, bộ kiểm báo HỎNG
 *   warnings — ghi được, dashboard hiện ra (vd. mục chưa có ảnh: component đã có
 *              đường lui, và admin phải tạo được mục TRƯỚC rồi mới gắn ảnh)
 *   notes    — thông tin tham khảo
 *
 * Nguyên tắc: **so hai bản với nhau, không so với hằng số.** Con số tổng chỉ in ra.
 */
import { assertParity } from './parity.js'
import { renderedAnchors } from './lookups.js'

/**
 * Trường KHÔNG dịch: phải bằng nhau giữa VI và EN.
 *
 * Mỗi trường là một khoá tra cứu hoặc một con số. Lệch giữa hai bản nghĩa là đổi
 * ngôn ngữ thì khóa học nhảy nhóm, số liệu đổi giá trị, hay menu trỏ chỗ khác.
 * Dashboard ghi chúng bằng một ô duy nhất cho cả hai; luật này chặn đường API.
 */
const SHARED_FIELDS = new Set([
  'group',
  'level',
  'stage',
  'topic',
  'icon',
  'kind',
  'kinds',
  'value',
  'suffix',
  'lead',
  'href',
  'filterable',
])

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)
const isIdList = (value) =>
  Array.isArray(value) && value.length > 0 && value.every((item) => isObject(item) && typeof item.id === 'string')

/**
 * Chỉ so trường dùng chung trên **phần tử của mảng có `id`** (mục, nhóm, link).
 * Tên khoá thôi là không đủ: `courses.filters.stage` là NHÃN dịch ("Cấp học" /
 * "School level") trùng tên với trường tra cứu `courses.items[].stage`. Mọi trường
 * dùng chung thật đều nằm trên một mục có id, nên giới hạn theo vị trí là chính xác.
 */
function compareShared(vi, en, path, report, inItem = false) {
  if (Array.isArray(vi) && Array.isArray(en)) {
    if (isIdList(vi)) {
      const other = new Map(en.filter(isObject).map((item) => [item.id, item]))
      for (const item of vi) {
        if (other.has(item.id)) compareShared(item, other.get(item.id), `${path}[${item.id}]`, report, true)
      }
      return
    }
    vi.forEach((item, index) => {
      if (index < en.length) compareShared(item, en[index], `${path}[${index}]`, report)
    })
    return
  }

  if (!isObject(vi) || !isObject(en)) return
  for (const key of Object.keys(vi)) {
    if (!(key in en)) continue
    const at = path ? `${path}.${key}` : key
    // `activities.kinds` là object nhãn (dịch), còn `groups[].kinds` là mảng id
    // (dùng chung) — cùng tên khoá, phân biệt bằng hình dạng giá trị.
    if (inItem && SHARED_FIELDS.has(key) && !isObject(vi[key])) {
      if (JSON.stringify(vi[key]) !== JSON.stringify(en[key])) report(at, vi[key], en[key])
      continue
    }
    compareShared(vi[key], en[key], at, report)
  }
}

/** Id trùng trong một mảng làm hỏng React key, khoá đối xứng và binding ảnh cùng lúc. */
function findDuplicateIds(value, path, report) {
  if (Array.isArray(value)) {
    if (isIdList(value)) {
      const seen = new Set()
      for (const item of value) {
        if (seen.has(item.id)) report(`${path}: id '${item.id}' bi trung`)
        seen.add(item.id)
      }
    }
    value.forEach((item, index) => findDuplicateIds(item, `${path}[${item?.id ?? index}]`, report))
    return
  }
  if (!isObject(value)) return
  for (const [key, child] of Object.entries(value)) {
    if (key === 'details') continue
    findDuplicateIds(child, path ? `${path}.${key}` : key, report)
  }
}

/**
 * @param {{ vi: object, en: object }} dicts  từ điển đã ráp (có `courses.details`, có `image`)
 * @param {ReturnType<import('./lookups.js').scanLookups>} lookups
 * @param {{ imageMaps?: object | null }} [options]
 *   `imageMaps` = module `src/assets/images/index.js` khi kiểm corpus seed (ảnh tra
 *   qua map riêng); bỏ trống khi kiểm nội dung thật (ảnh nằm sẵn trên từng mục).
 */
export function checkInvariants({ vi, en }, lookups, { imageMaps = null } = {}) {
  const errors = []
  const warnings = []
  const notes = []
  const fail = (message) => errors.push(message)
  const warn = (message) => warnings.push(message)
  const note = (message) => notes.push(message)
  const dicts = { vi, en }

  for (const problem of lookups.problems) warn(problem)

  // --- 1. Đối xứng cấu trúc, id trùng, trường dùng chung ----------------------

  const parity = assertParity(vi, en)
  note(`doi xung: ${parity.total} duong khoa`)
  for (const path of parity.missingInEn) fail(`thieu trong EN: ${path}`)
  for (const path of parity.missingInVi) fail(`thieu trong VI: ${path}`)

  for (const [lang, dict] of Object.entries(dicts)) {
    findDuplicateIds(dict, '', (message) => fail(`${lang} ${message}`))
  }

  compareShared(vi, en, '', (path, a, b) => {
    fail(`${path}: truong khong dich nhung khac nhau — vi ${JSON.stringify(a)} / en ${JSON.stringify(b)}`)
  })

  // --- 2. Khoá tra cứu của khoá học ------------------------------------------

  const courseIcons = lookups.courseIcons
  for (const [lang, dict] of Object.entries(dicts)) {
    const courses = dict.courses
    if (!courses) continue
    const stageIds = new Set((courses.stages ?? []).map((stage) => stage.id))
    const topicIds = new Set((courses.topics ?? []).map((topic) => topic.id))
    const groupIds = new Set((courses.groups ?? []).map((group) => group.id))
    const levelIds = new Set(Object.keys(courses.levels ?? {}))

    for (const course of courses.items ?? []) {
      const at = `${lang} courses.items[${course.id}]`
      if (!groupIds.has(course.group)) fail(`${at}: group '${course.group}' khong co trong courses.groups`)

      if ('stage' in course || 'topic' in course || 'icon' in course) {
        if (!stageIds.has(course.stage)) fail(`${at}: stage '${course.stage}' khong co -> chip trong`)
        if (!topicIds.has(course.topic)) fail(`${at}: topic '${course.topic}' khong co -> chip trong`)
        if (courseIcons && !courseIcons.includes(course.icon)) fail(`${at}: icon '${course.icon}' khong co -> huy hieu rong`)
      } else {
        if (!levelIds.has(course.level)) fail(`${at}: level '${course.level}' khong co trong courses.levels`)
        // Thẻ cấp độ tra icon theo `id`. Component đã bỏ hẳn huy hiệu khi tra hụt,
        // nên khóa học mới tạo từ dashboard chỉ thiếu icon chứ không hỏng.
        if (courseIcons && !courseIcons.includes(course.id)) warn(`${at}: khong co icon tra theo id -> khong co huy hieu`)
      }
    }
  }

  // --- 3. Hoạt động: mọi `kind` phải có nhãn và phải rơi vào một khối ---------

  for (const [lang, dict] of Object.entries(dicts)) {
    const activities = dict.activities
    if (!activities) continue
    const kindLabels = new Set(Object.keys(activities.kinds ?? {}))
    const claimed = new Set((activities.groups ?? []).flatMap((group) => group.kinds ?? []))

    for (const item of activities.items ?? []) {
      const at = `${lang} activities.items[${item.id}]`
      if (!kindLabels.has(item.kind)) fail(`${at}: kind '${item.kind}' khong co nhan trong activities.kinds`)
      if (!claimed.has(item.kind)) fail(`${at}: kind '${item.kind}' khong khoi nao nhan -> roi vao khoi cuoi, sai cho`)
    }
    for (const kind of claimed) {
      if (!kindLabels.has(kind)) fail(`${lang} activities.groups: nhan kind '${kind}' nhung khong co nhan chu`)
    }
  }

  // --- 4. Trụ cột và thiết bị: có đường lui, chỉ ghi chú ----------------------

  const TOLERANT = [
    ['pillars.items', vi.pillars?.items, lookups.pillarIcons, 'khong co icon rieng'],
    ['facilities.items', vi.facilities?.items, lookups.facilityIcons, 'khong co icon rieng'],
    ['pillars.items', vi.pillars?.items, lookups.pillarTones, 'lay sac theo vong lap'],
    ['facilities.items', vi.facilities?.items, lookups.facilityLayouts, 'lay bo cuc theo vong lap'],
  ]
  for (const [label, items, known, reason] of TOLERANT) {
    if (!known || !items) continue
    const missing = items.filter((item) => !known.includes(item.id)).map((item) => item.id)
    if (missing.length > 0) note(`${label}: ${missing.join(', ')} -> ${reason}`)
  }

  // --- 5. Ảnh -----------------------------------------------------------------

  // `card` = mục hiển thị trong khung ảnh: thiếu ảnh thì khung trống (cảnh báo).
  // Còn lại có bản dự phòng đẹp (tên bằng chữ, avatar chữ cái đầu) nên chỉ ghi chú.
  const IMAGE_TARGETS = [
    ['courses.items', vi.courses?.items, 'COURSE_IMAGES', true],
    ['facilities.items', vi.facilities?.items, 'FACILITY_IMAGES', true],
    ['activities.items', vi.activities?.items, 'ACTIVITY_IMAGES', true],
    ['partners.items', vi.partners?.items, 'PARTNER_LOGOS', false],
    ['team.members', vi.team?.members, 'TEAM_IMAGES', false],
  ]
  for (const [label, items, mapName, card] of IMAGE_TARGETS) {
    if (!items) continue
    const map = imageMaps?.[mapName]
    const has = (item) => (imageMaps ? Boolean(map?.[item.id]) : Boolean(item.image?.url))

    const missing = items.filter((item) => !has(item)).map((item) => item.id)
    if (card) {
      for (const id of missing) warn(`${label}[${id}]: chua co anh -> khung anh trong`)
    } else if (missing.length > 0) {
      note(`${label}: ${missing.length} muc dung ban du phong (${missing.join(', ')})`)
    }

    if (map) {
      const ids = new Set(items.map((item) => item.id))
      const orphans = Object.keys(map).filter((key) => !ids.has(key))
      if (orphans.length > 0) note(`${label}: ${orphans.length} key anh mo coi -> ${orphans.join(', ')}`)
    }
  }
  if (!imageMaps && vi.hero && !vi.hero.image?.url) warn('hero: chua co anh')

  // --- 6. Các bất biến lặt vặt nhưng im lặng khi sai -------------------------

  for (const [lang, dict] of Object.entries(dicts)) {
    if (dict.team) {
      const leads = (dict.team.members ?? []).filter((member) => member.lead)
      if (leads.length !== 1) fail(`${lang} team.members: phai co dung 1 nguoi 'lead', dang co ${leads.length}`)
    }
    for (const stat of dict.stats?.items ?? []) {
      if (typeof stat.value !== 'number') {
        fail(`${lang} stats.items[${stat.id}].value la ${typeof stat.value}, phai la number -> CountUp tinh rac`)
      }
    }
  }

  // Tên người không dịch.
  for (const [index, member] of (vi.team?.members ?? []).entries()) {
    const other = en.team?.members?.[index]
    if (other && member.name !== other.name) {
      fail(`team.members[${member.id}]: ten khac nhau giua hai ban — vi '${member.name}' / en '${other.name}'`)
    }
  }

  // --- 7. Mọi href trong trang phải trỏ tới neo có thật ----------------------

  const anchors = renderedAnchors(vi, lookups)
  if (anchors) {
    note(`neo dung ra: ${[...anchors].sort().join(', ')}`)

    const checkHref = (where, href) => {
      if (!href || !href.startsWith('#')) return
      const id = href.slice(1)
      if (id && !anchors.has(id)) fail(`${where}: href '${href}' khong tro toi neo nao -> link chet, khong bao loi`)
    }

    for (const [lang, dict] of Object.entries(dicts)) {
      for (const link of dict.nav?.links ?? []) {
        if (link.href) checkHref(`${lang} nav.links[${link.id}]`, link.href)
        for (const child of link.children ?? []) {
          checkHref(`${lang} nav.links[${link.id}].children[${child.id}]`, child.href)
        }
        if (link.href && link.children) fail(`${lang} nav.links[${link.id}]: co ca href lan children`)
        if (!link.href && !link.children) fail(`${lang} nav.links[${link.id}]: khong co href lan children`)
      }
      for (const column of dict.footer?.columns ?? []) {
        for (const link of column.links ?? []) {
          checkHref(`${lang} footer.columns[${column.id}].links[${link.id}]`, link.href)
        }
      }
    }
  }

  // --- 8. Chi tiết khoá học: mục mồ côi --------------------------------------

  if (vi.courses?.details) {
    const courseIds = new Set((vi.courses.items ?? []).map((course) => course.id))
    const orphanDetails = Object.keys(vi.courses.details).filter((id) => !courseIds.has(id))
    if (orphanDetails.length > 0) {
      note(`courses.details: ${orphanDetails.length} muc mo coi (khong co card nao tra toi) -> ${orphanDetails.join(', ')}`)
    }
    const missingDetails = [...courseIds].filter((id) => !vi.courses.details[id])
    if (missingDetails.length > 0) {
      note(`courses.details: ${missingDetails.length} khoa chua co noi dung popup -> ${missingDetails.join(', ')}`)
    }
  }

  return { errors, warnings, notes, anchors }
}
