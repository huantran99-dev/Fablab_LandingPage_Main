/**
 * Nút do admin tạo (từ API 23) — duyệt mọi chỗ có nút trong một từ điển.
 *
 * Dùng chung cho luật kiểm (invariants.js), bộ lọc `cta_click` của thống kê và bảng nhãn
 * nút của dashboard (`/meta` → `ctaLabels`). Thêm một chỗ đặt nút là thêm vào `SLOTS` ở đây
 * VÀ dùng đúng tên slot đó ở component (ActionButton nhận `slot`).
 *
 * Id thống kê của một nút là `${slot}-${id}`. Nút seed giữ id `primary` / `secondary` nên
 * `hero-primary`, `final-primary`… trùng id cũ — số liệu trước API 23 vẫn nối tiếp.
 */

/** Section có danh sách nút ở cấp trên cùng → tên slot. Thanh menu có thêm slot của drawer. */
export const SLOTS = [
  { section: 'hero', slots: ['hero'], label: 'Hero' },
  { section: 'nav', slots: ['nav', 'nav-drawer'], label: 'Thanh menu' },
  { section: 'finalCta', slots: ['final'], label: 'Cuối trang' },
]

/**
 * Mọi nút trong từ điển: `{ where, slots, button, popupId? }`. `popupId` là popup CHỨA nút
 * (để chặn popup tự trỏ vào chính nó).
 */
export function* eachButton(dict) {
  for (const { section, slots, label } of SLOTS) {
    for (const button of dict?.[section]?.buttons ?? []) {
      yield { where: `${section}.buttons[${button.id}]`, slots, place: label, button }
    }
  }
  for (const popup of dict?.popups?.items ?? []) {
    for (const button of popup.buttons ?? []) {
      yield {
        where: `popups.items[${popup.id}].buttons[${button.id}]`,
        slots: [`popup-${popup.id}`],
        place: `Popup “${popup.title}”`,
        button,
        popupId: popup.id,
      }
    }
  }
}

/** Id thống kê → nhãn đọc được, cho mọi nút đang có trong nội dung. */
export function ctaTargets(dict) {
  const out = new Map()
  for (const { slots, place, button } of eachButton(dict)) {
    for (const slot of slots) {
      const where = slot === 'nav-drawer' ? `${place} (điện thoại)` : place
      out.set(`${slot}-${button.id}`, `${where} — ${button.label}`)
    }
  }
  return out
}
