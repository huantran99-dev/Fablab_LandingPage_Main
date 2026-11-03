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
import { WHITE, contrast } from './color.js'
import { BUILTIN_MOTIFS, IMAGE_SHAPE_PREFIX, MOTIF_GLYPHS } from './motifs.js'
import { assertParity } from './parity.js'
import { renderedAnchors } from './lookups.js'
import { TOGGLEABLE_SECTIONS } from '../schema/sections.js'

/** Màu mặc định của trang (`@theme` trong src/index.css) — dùng khi sự kiện để trống ô màu. */
const DEFAULT_COLORS = { primary: '#1868db', surface: '#e9f2fe', dark: '#123263' }

/**
 * Trường KHÔNG dịch: phải bằng nhau giữa VI và EN.
 *
 * Mỗi trường là một khoá tra cứu hoặc một con số. Lệch giữa hai bản nghĩa là đổi
 * ngôn ngữ thì khóa học nhảy nhóm, số liệu đổi giá trị, hay menu trỏ chỗ khác.
 * Dashboard ghi chúng bằng một ô duy nhất cho cả hai; luật này chặn đường API.
 */
export const SHARED_FIELDS = new Set([
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
  'videoBanner',
  'facility',
  'status',
  // Sự kiện mùa: lịch, công tắc, hành động của nút và bảng màu là một cho cả hai bản.
  'enabled',
  'now',
  'popup',
  'start',
  'end',
  'ctaAction',
  'colorPrimary',
  'colorSurface',
  'colorDark',
  'colorAccent',
  'motif',
  'fall',
  // Thư viện họa tiết (`motifs`): mọi thứ trừ tên là thông số máy đọc.
  'particles',
  'shape',
  'weight',
  'sizeMin',
  'sizeMax',
  'flap',
  'direction',
  'motion',
  'speedMin',
  'speedMax',
  'sway',
  'density',
  'ornamentShape',
  'ornamentCorner',
  'ornamentSize',
  // Link trang ngoài của hoạt động (popup Cuộc thi) — một URL cho cả hai bản.
  'link',
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

  // --- 3b. Máy: mọi `facility` phải là một ô có thật ở section Thiết bị -------
  //
  // Luật cắt ngang hai section, nên chỉ kiểm được trên từ điển đã ráp. Sai là máy
  // biến mất khỏi trang không một lời báo (không ô nào nhận nó). Chiều ngược lại
  // cũng được chặn nhờ đây: xoá một ô còn máy trỏ tới là lượt lưu bị từ chối.

  for (const [lang, dict] of Object.entries(dicts)) {
    if (!dict.equipment || !dict.facilities) continue
    const facilityIds = new Set((dict.facilities.items ?? []).map((item) => item.id))
    for (const device of dict.equipment.items ?? []) {
      if (!facilityIds.has(device.facility)) {
        fail(`${lang} equipment.items[${device.id}]: facility '${device.facility}' khong co trong facilities.items -> may bien mat khoi trang`)
      }
    }
  }

  // --- 3c. Dự án: `status` (nếu có) phải là một khoá của `projects.statuses` ----
  //
  // Vắng là hợp lệ và có chủ đích (trang gốc không ghi trạng thái). Có mà tra hụt thì
  // card bỏ nhãn — người sửa tưởng đã đánh dấu mà trang không hiện gì.

  for (const [lang, dict] of Object.entries(dicts)) {
    const projects = dict.projects
    if (!projects) continue
    const statusIds = new Set(Object.keys(projects.statuses ?? {}))
    for (const project of projects.items ?? []) {
      if ('status' in project && !statusIds.has(project.status)) {
        fail(`${lang} projects.items[${project.id}]: status '${project.status}' khong co trong projects.statuses -> khong hien nhan`)
      }
    }
  }

  // --- 3d. Sự kiện mùa --------------------------------------------------------
  //
  // Lỗi: những gì làm popup / nút hỏng thật. Cảnh báo: những gì vẫn chạy nhưng nên xem
  // lại — trùng lịch (mục đứng trước thắng), chữ khó đọc, popup không có ảnh.
  // Trường dùng chung (ngày, màu, hành động) bằng nhau giữa hai bản nhờ luật số 1, nên
  // kiểm trên bản VI là đủ; chỉ nhãn nút (dịch) phải kiểm cả hai.

  const seasons = vi.seasonal?.items ?? []
  for (const [lang, dict] of Object.entries(dicts)) {
    for (const season of dict.seasonal?.items ?? []) {
      if (season.ctaAction && season.ctaAction !== 'none' && !String(season.ctaLabel ?? '').trim()) {
        fail(`${lang} seasonal.items[${season.id}]: co nut nhung chua co chu tren nut (ctaLabel)`)
      }
    }
  }
  for (const season of seasons) {
    const at = `seasonal.items[${season.id}]`
    if (season.start && season.end && season.start > season.end) {
      fail(`${at}: ngay bat dau ${season.start} sau ngay ket thuc ${season.end}`)
    }
    if (season.ctaAction === 'link' && (!season.href || season.href === '#')) {
      fail(`${at}: nut dang la "mo link" nhung chua co duong dan`)
    }
    // Chỉ sự kiện đang bật: mục mẫu đang tắt chưa có ảnh là bình thường, báo mãi thành nhiễu.
    if (season.enabled && season.popup && !season.image?.url && !imageMaps) {
      warn(`${at}: bat popup nhung chua co anh popup -> popup chi co chu`)
    }
    if (season.fall && !season.motif) {
      warn(`${at}: bat hat roi nhung chua chon bo hoa tiet -> khong co gi roi`)
    }
    const dark = season.colorDark ?? DEFAULT_COLORS.dark
    const onDark = contrast(WHITE, dark)
    if (onDark !== null && onDark < 4.5) {
      warn(`${at}: chu trang tren mau toi ${dark} chi dat ${onDark.toFixed(1)}:1 (can 4.5:1) -> khoi keu goi cuoi trang kho doc`)
    }
    if (season.colorPrimary || season.colorSurface) {
      const primary = season.colorPrimary ?? DEFAULT_COLORS.primary
      const surface = season.colorSurface ?? DEFAULT_COLORS.surface
      const ratio = contrast(primary, surface)
      if (ratio !== null && ratio < 4.5) {
        warn(`${at}: mau chu dao ${primary} tren nen ${surface} chi dat ${ratio.toFixed(1)}:1 (can 4.5:1) -> nhan nho kho doc`)
      }
    }
  }
  // Mục "hiện ngay" (`now`) chạy từ bây giờ tới `end` — coi như bắt đầu từ đầu thời gian,
  // để vẫn báo khi nó che một mục khác đang bật.
  const enabled = seasons.filter((season) => season.enabled && season.end && (season.start || season.now))
  const startOf = (season) => (season.now ? '0000-01-01' : season.start)
  for (let i = 0; i < enabled.length; i++) {
    for (let j = i + 1; j < enabled.length; j++) {
      const [a, b] = [enabled[i], enabled[j]]
      if (startOf(a) <= b.end && startOf(b) <= a.end) {
        warn(`seasonal: '${a.id}' va '${b.id}' cung bat va trung ngay -> trang dung '${a.id}' (dung truoc trong danh sach)`)
      }
    }
  }

  // --- 3e. Thư viện họa tiết -------------------------------------------------------
  //
  // Cắt ngang hai section như luật `facility`: sự kiện trỏ tới họa tiết không có thật thì
  // trang lặng lẽ mất trang trí — và chiều ngược lại, xoá họa tiết đang được dùng bị chặn.
  // Trường dùng chung bằng nhau giữa hai bản (luật số 1), nên kiểm trên bản VI là đủ.

  const library = vi.motifs
  const builtin = new Set(BUILTIN_MOTIFS)
  const glyphs = new Set(MOTIF_GLYPHS)
  const customIds = new Set((library?.items ?? []).map((item) => item.id))
  const shapeImages = new Map((library?.shapes ?? []).map((shape) => [shape.id, shape]))

  for (const season of seasons) {
    if (season.motif && !builtin.has(season.motif) && !customIds.has(season.motif)) {
      fail(`seasonal.items[${season.id}]: hoa tiet '${season.motif}' khong co (bo co san hoac motifs.items) -> nut va hat roi mat trang tri`)
    }
  }

  /** `null` = hợp lệ; còn lại là câu báo lỗi. */
  const shapeProblem = (ref) => {
    if (ref.startsWith(IMAGE_SHAPE_PREFIX)) {
      return shapeImages.has(ref.slice(IMAGE_SHAPE_PREFIX.length)) ? null : `anh '${ref}' khong co trong motifs.shapes`
    }
    return glyphs.has(ref) ? null : `hinh co san '${ref}' khong ton tai`
  }
  const missingImage = (ref) =>
    ref.startsWith(IMAGE_SHAPE_PREFIX) && !imageMaps && !shapeImages.get(ref.slice(IMAGE_SHAPE_PREFIX.length))?.image?.url

  for (const motif of library?.items ?? []) {
    const at = `motifs.items[${motif.id}]`
    if (builtin.has(motif.id)) fail(`${at}: id trung voi bo co san '${motif.id}' -> dat id khac`)
    if (motif.speedMin > motif.speedMax) fail(`${at}: toc do nho nhat ${motif.speedMin} lon hon lon nhat ${motif.speedMax}`)
    for (const particle of motif.particles ?? []) {
      const where = `${at}.particles[${particle.id}]`
      const problem = shapeProblem(particle.shape)
      if (problem) fail(`${where}: ${problem}`)
      else if (missingImage(particle.shape)) warn(`${where}: anh '${particle.shape}' chua gan file -> loai hat nay khong roi`)
      if (particle.sizeMin > particle.sizeMax) fail(`${where}: co nho nhat ${particle.sizeMin} lon hon lon nhat ${particle.sizeMax}`)
    }
    if (motif.ornamentShape) {
      const problem = shapeProblem(motif.ornamentShape)
      if (problem) fail(`${at}.ornamentShape: ${problem}`)
      else if (missingImage(motif.ornamentShape)) warn(`${at}: anh trang tri nut '${motif.ornamentShape}' chua gan file -> nut khong co trang tri`)
    }
  }

  // --- 3f. Bật/tắt section: hai bản phải cùng trạng thái ------------------------
  //
  // Dashboard luôn ghi `hidden` cho CẢ HAI bản nên lệch chỉ có thể do sửa tay database —
  // khi đó khối hiện ở tiếng Việt mà mất ở tiếng Anh (hoặc ngược lại). `hidden` ở cấp trên
  // cùng của section nên luật số 1 (chỉ so trên phần tử có `id`) không bắt được.
  for (const key of TOGGLEABLE_SECTIONS) {
    if (Boolean(vi[key]?.hidden) !== Boolean(en[key]?.hidden)) {
      fail(`${key}.hidden: vi=${Boolean(vi[key]?.hidden)} en=${Boolean(en[key]?.hidden)} -> hai ban phai cung bat hoac cung tat`)
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
    ['projects.items', vi.projects?.items, 'PROJECT_IMAGES', true],
    ['partners.items', vi.partners?.items, 'PARTNER_LOGOS', false],
    // Thiếu ảnh thì popup chỉ bỏ khung ảnh, phần thông số vẫn đủ — nên chỉ ghi chú.
    ['equipment.items', vi.equipment?.items, 'EQUIPMENT_IMAGES', false],
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
      // Nút của popup sự kiện: chỉ kiểm khi nút thật sự là link.
      for (const season of dict.seasonal?.items ?? []) {
        if (season.ctaAction === 'link') checkHref(`${lang} seasonal.items[${season.id}]`, season.href)
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
