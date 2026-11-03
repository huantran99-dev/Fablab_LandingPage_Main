/**
 * Các khối của trang bật/tắt được từ dashboard (`hidden: true` ở cấp trên cùng của section).
 *
 * Ba thứ suy từ trạng thái bật/tắt, đều ở đây để không chỗ nào phải chép tay danh sách:
 *
 * - `RHYTHM`: khối đi nhịp trượt trái/phải. Chiều tính theo THỨ TỰ CÁC KHỐI ĐANG HIỆN (App.jsx),
 *   nên tắt một khối ở giữa không làm hai khối liền nhau trượt cùng chiều.
 * - `sectionAnchors`: neo mỗi khối sinh ra. Khối tắt thì neo của nó biến mất, và mọi link
 *   trỏ vào đó (menu, footer, nút Hero, nút popup sự kiện mùa) tự ẩn theo — xem `useLiveHref`.
 * - `opposite`: nội dung của một khối trượt ngược chiều tiêu đề.
 *
 * Hero không bao giờ "mất" `#top`: logo navbar trỏ vào đó và vẫn phải đưa về đầu trang.
 */

/**
 * Các khối bật/tắt được, theo đúng thứ tự trên trang. Chép ở `TOGGLEABLE_SECTIONS`
 * (server/schema/sections.js) — `check:admin` so hai bản.
 */
export const PAGE_SECTIONS = ['hero', 'stats', 'facilities', 'projects', 'pillars', 'courses', 'activities', 'team', 'partners', 'testimonials', 'finalCta']

export const RHYTHM = new Set(['facilities', 'projects', 'pillars', 'courses', 'activities', 'team', 'partners', 'testimonials'])

export const opposite = (side) => (side === 'left' ? 'right' : 'left')

/** Neo theo nhóm suy từ dữ liệu, cùng cách Courses / Activities dựng `id` cho từng khối. */
export function sectionAnchors(key, t) {
  switch (key) {
    case 'facilities':
      return ['facilities']
    case 'projects':
      return ['projects']
    case 'pillars':
      return ['about']
    case 'courses':
      return ['courses', ...(t.courses?.groups ?? []).map((group) => `courses-${group.id}`)]
    case 'activities':
      return ['activities', ...(t.activities?.groups ?? []).map((group) => group.id)]
    case 'team':
      return ['team']
    case 'partners':
      return ['partners']
    case 'finalCta':
      return ['register']
    default:
      // hero (`#top` giữ nguyên), stats, testimonials: không có neo nào để link trỏ tới.
      return []
  }
}

export const isHidden = (t, key) => t[key]?.hidden === true

/** Neo của mọi khối đang tắt. */
export function hiddenAnchors(t) {
  const out = new Set()
  for (const key of PAGE_SECTIONS) if (isHidden(t, key)) for (const anchor of sectionAnchors(key, t)) out.add(anchor)
  return out
}

/** `#neo` thuộc khối đang tắt thì chết; `#`, `#top`, link ngoài, email, điện thoại luôn sống. */
export function liveHref(href, hidden) {
  if (typeof href !== 'string' || !href.startsWith('#') || href.length < 2) return true
  return !hidden.has(href.slice(1))
}

/** Menu hai cấp: lọc mục con, bỏ hẳn nhánh không còn con nào. */
export function liveNavLinks(links, isLive) {
  return links.flatMap((link) => {
    if (!link.children) return isLive(link.href) ? [link] : []
    const children = link.children.filter((child) => isLive(child.href))
    return children.length > 0 ? [{ ...link, children }] : []
  })
}
