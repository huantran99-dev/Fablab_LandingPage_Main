/**
 * Xác nhận một lượt lưu ĐÃ LÊN TRANG CÔNG KHAI — chứ không chỉ "máy chủ trả 200".
 *
 * Sau khi ghi, dashboard đọc `/api/content` đúng như trang công khai đọc (cùng URL,
 * không cookie, bỏ qua cache trình duyệt) rồi so với bản vừa ghi trong database. Khớp
 * nghĩa là cả hai đầu đã thấy bản mới: người xem tải trang — hoặc chỉ cần quay lại tab
 * trang — là thấy.
 *
 * Có từ sau khi người dùng gặp "sửa xong phải tải lại vài lần mới thấy": nguyên nhân là
 * header cache `max-age=60, stale-while-revalidate=600` của `/api/content` (đã đổi sang
 * `no-cache`). Bước kiểm này là chốt để lỗi kiểu đó không quay lại trong im lặng.
 */

/** Đọc bản công khai, BỎ QUA mọi cache — thứ đang kiểm chính là cache. */
async function fetchPublic() {
  const response = await fetch('/api/content', {
    cache: 'no-store',
    credentials: 'omit',
    headers: { accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/**
 * Dạng chuẩn để so: sắp khoá (Zod dựng lại object theo thứ tự schema, không theo thứ
 * tự gửi lên) và bỏ `image` / `video` (bản công khai gắn media lên từng mục, bản quản
 * trị để media riêng — so riêng bên dưới).
 */
const MEDIA_KEYS = new Set(['image', 'video'])

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value).sort()) {
      if (!MEDIA_KEYS.has(key)) out[key] = canonical(value[key])
    }
    return out
  }
  return value
}

const same = (a, b) => JSON.stringify(canonical(a ?? null)) === JSON.stringify(canonical(b ?? null))

/** `{ idMục: url }` của mọi ảnh (`field = 'image'`) hoặc video gắn trong một section công khai (hero: khoá là tên section). */
function publicMedia(section, sectionKey, field) {
  const out = {}
  if (section?.[field]?.url) out[sectionKey] = section[field].url
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk)
    else if (node && typeof node === 'object') {
      if (typeof node.id === 'string' && node[field]?.url) out[node.id] = node[field].url
      for (const [key, child] of Object.entries(node)) if (!MEDIA_KEYS.has(key)) walk(child)
    }
  }
  walk(section)
  return out
}

/** Id mọi mục trong section — ảnh của id không còn trên trang (binding mồ côi) thì không so. */
function itemIds(section, sectionKey) {
  const ids = new Set([sectionKey])
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk)
    else if (node && typeof node === 'object') {
      if (typeof node.id === 'string') ids.add(node.id)
      Object.values(node).forEach(walk)
    }
  }
  walk(section)
  return ids
}

/**
 * So một section công khai với bản trong database (`GET /api/admin/content/:section`).
 * `courses.details` là nhánh riêng (popup), không thuộc lượt lưu section — bỏ khỏi phép so.
 */
export function sectionMatches(content, sectionKey, truth) {
  for (const locale of ['vi', 'en']) {
    const published = content?.[locale]?.[sectionKey]
    if (!published) return false
    const { details: _details, ...rest } = published
    if (!same(sectionKey === 'courses' ? rest : published, truth[locale])) return false
  }

  const ids = itemIds(truth.vi, sectionKey)
  const expected = (bound) =>
    Object.fromEntries(
      Object.entries(bound ?? {})
        .filter(([id]) => ids.has(id))
        .map(([id, media]) => [id, media.url]),
    )
  return (
    same(publicMedia(content.vi[sectionKey], sectionKey, 'image'), expected(truth.images)) &&
    same(publicMedia(content.vi[sectionKey], sectionKey, 'video'), expected(truth.videos))
  )
}

/** So nội dung popup công khai của một khóa với bản hiệu lực trong database. */
export function courseDetailMatches(content, courseId, detail) {
  return ['vi', 'en'].every((locale) => same(content?.[locale]?.courses?.details?.[courseId], detail[locale]?.effective))
}

/** Khoảng chờ giữa các lần thử. Máy chủ ghi đồng bộ nên lần đầu gần như luôn khớp. */
const DELAYS = [0, 400, 900, 1800, 3000]
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Chạy `check(content)` trên bản công khai, thử lại vài lần trong ~6 giây.
 * @returns {Promise<{ ok: boolean, rev: number | null, error?: string }>}
 */
export async function waitForPublished(check) {
  let lastError = null
  let rev = null
  for (const delay of DELAYS) {
    if (delay) await sleep(delay)
    try {
      const content = await fetchPublic()
      rev = content.rev ?? null
      if (await check(content)) return { ok: true, rev }
    } catch (caught) {
      lastError = caught.message
    }
  }
  return { ok: false, rev, error: lastError ?? undefined }
}
