/**
 * Ráp các dòng trong database thành `{ vi, en }` đúng hình dạng mà component đang
 * đọc hôm nay.
 *
 * Ba nguồn ghép lại:
 *   `section`       -> 12 khối nội dung của mỗi ngôn ngữ
 *   `course_detail` -> nhánh `courses.details`, vốn để riêng vì bất đối xứng
 *   `binding`+`media` -> trường `image` (và `video` cho Cuộc thi) gắn vào từng mục
 */
import { getDb } from '../db/index.js'

/** Thứ tự trộn chi tiết khoá học. Sau đè lên trước. */
export const DETAIL_PRECEDENCE = ['scraped', 'handwritten', 'overridden']

/**
 * Ảnh gắn vào đâu: scope trong bảng `binding` -> đường tới mảng trong từ điển.
 *
 * Thêm một scope mới mà quên khai ở đây thì ảnh seed vào rồi vẫn không hiện —
 * `verify-seed` bắt được vì bản ráp ra sẽ thiếu trường `image`.
 */
const BINDING_TARGETS = {
  course: ['courses', 'items'],
  facility: ['facilities', 'items'],
  equipment: ['equipment', 'items'],
  project: ['projects', 'items'],
  activity: ['activities', 'items'],
  partner: ['partners', 'items'],
  team: ['team', 'members'],
}

/**
 * Video nền: cùng bảng `binding`, scope RIÊNG, gắn thành trường `video` (không phải
 * `image`). Scope riêng chứ không phải cột mới: khoá `(scope, item_id)` giữ nguyên nghĩa
 * "một mục một media cho mỗi khe", và mọi đường ghi/lịch sử/dọn dẹp đã viết cho scope.
 */
const VIDEO_TARGETS = {
  'activity-video': ['activities', 'items'],
}

/**
 * Chiều ngược của `BINDING_TARGETS`, cho đường ghi: lưu section nào thì được gắn
 * ảnh cho những mục nào.
 *
 * `hero` là ngoại lệ vì scope `singleton` còn chứa `logo` (ảnh của Logo.jsx, không
 * thuộc section nào) — đường ghi chỉ được đụng đúng `hero`, nên liệt kê tường minh.
 */
export const SECTION_IMAGES = {
  ...Object.fromEntries(
    Object.entries(BINDING_TARGETS).map(([scope, [section, arrayKey]]) => [section, { scope, arrayKey }]),
  ),
  hero: { scope: 'singleton', arrayKey: null, itemIds: ['hero'] },
}

/** Như `SECTION_IMAGES`, cho video: lưu section nào thì được gắn video cho mục nào. */
export const SECTION_VIDEOS = Object.fromEntries(
  Object.entries(VIDEO_TARGETS).map(([scope, [section, arrayKey]]) => [section, { scope, arrayKey }]),
)

export function mediaUrl(filename) {
  return `/media/${filename}`
}

function readSections(db) {
  const dicts = { vi: {}, en: {} }
  for (const row of db.prepare('SELECT locale, key, json FROM section').all()) {
    dicts[row.locale][row.key] = JSON.parse(row.json)
  }
  return dicts
}

function readDetails(db) {
  const byLocale = { vi: {}, en: {} }
  const rows = db.prepare('SELECT locale, course_id, source, json FROM course_detail').all()

  // Sắp theo mức ưu tiên rồi ghi đè tuần tự. `cnc` là id nằm ở CẢ hai nguồn: bản
  // viết tay phải thắng bản scraper, vì đó là hai chương trình khác nhau trùng tên.
  rows.sort((a, b) => DETAIL_PRECEDENCE.indexOf(a.source) - DETAIL_PRECEDENCE.indexOf(b.source))
  for (const row of rows) {
    byLocale[row.locale][row.course_id] = JSON.parse(row.json)
  }
  return byLocale
}

function readBindings(db) {
  const rows = db
    .prepare(
      `SELECT b.scope, b.item_id, m.filename, m.width, m.height, m.duration
         FROM binding b JOIN media m ON m.id = b.media_id`,
    )
    .all()

  const byScope = new Map()
  for (const row of rows) {
    if (!byScope.has(row.scope)) byScope.set(row.scope, new Map())
    const media = { url: mediaUrl(row.filename), width: row.width, height: row.height }
    // Chỉ video mang `duration` — ảnh giữ nguyên hình dạng cũ (verify-seed so tuyệt đối).
    if (row.scope in VIDEO_TARGETS && row.duration != null) media.duration = row.duration
    byScope.get(row.scope).set(row.item_id, media)
  }
  return byScope
}

/**
 * Gắn ảnh vào từng mục của cả hai ngôn ngữ.
 *
 * Chạy SAU khi kiểm đối xứng: ảnh không theo ngôn ngữ nên nếu đưa vào trước, bộ
 * kiểm sẽ phải học cách bỏ qua chúng — thà giữ bộ kiểm ngu ngốc và nghiêm ngặt.
 */
function attachImages(dict, byScope) {
  const targets = [
    ...Object.entries(BINDING_TARGETS).map(([scope, path]) => [scope, path, 'image']),
    ...Object.entries(VIDEO_TARGETS).map(([scope, path]) => [scope, path, 'video']),
  ]
  for (const [scope, [sectionKey, arrayKey], field] of targets) {
    const bound = byScope.get(scope)
    if (!bound) continue
    const items = dict[sectionKey]?.[arrayKey]
    if (!Array.isArray(items)) continue
    for (const item of items) {
      const media = bound.get(item.id)
      if (media) item[field] = media
    }
  }

  const singleton = byScope.get('singleton')
  const hero = singleton?.get('hero')
  if (hero && dict.hero) dict.hero.image = hero
}

/**
 * Số hiệu bản nội dung: đổi khi có BẤT KỲ thứ gì hiển thị trên trang được ghi.
 *
 * `SUM(section.rev)` thôi là không đủ — sửa popup chi tiết khoá học ghi vào
 * `course_detail`, không đụng `section`. `content_counter` bù phần đó (xem
 * migration 002). Quên cộng ở đây thì bộ đệm, ETag và `contentStore` đều coi nội
 * dung là chưa đổi, và bản vừa lưu không bao giờ lên trang.
 */
export function currentRev(db = getDb()) {
  const row = db
    .prepare(
      `SELECT
         (SELECT COALESCE(SUM(rev), 0) FROM section)
           + (SELECT COALESCE(MAX(value), 0) FROM content_counter) AS total,
         (SELECT MAX(at) FROM (
            SELECT updated_at AS at FROM section
            UNION ALL
            SELECT updated_at AS at FROM course_detail WHERE source = 'overridden'
         )) AS at`,
    )
    .get()
  return { rev: row.total, updatedAt: row.at }
}

/** Bản nội dung đầy đủ, đúng hình dạng `dictionaries` mà frontend đang dùng. */
export function assemble(db = getDb()) {
  const dicts = readSections(db)
  const details = readDetails(db)
  const byScope = readBindings(db)

  for (const locale of ['vi', 'en']) {
    if (dicts[locale].courses) dicts[locale].courses.details = details[locale]
    attachImages(dicts[locale], byScope)
  }

  const { rev, updatedAt } = currentRev(db)
  return { rev, updatedAt, generatedAt: new Date().toISOString(), vi: dicts.vi, en: dicts.en }
}
