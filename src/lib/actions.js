/**
 * Nút do admin tạo (API 23) — phần thuần dữ liệu, không JSX.
 *
 * Mỗi nút: `{ id, label, style, arrow?, action, registerKind?, courseId?, formId?, popupId?, href? }`
 * (xem `buttonSchema` ở server/schema/sections.js). Hành động:
 *
 *   register  mở form đăng ký có sẵn (tab + khóa chọn sẵn tuỳ chọn)
 *   form      mở form tự tạo `formId`
 *   popup     mở popup tự tạo `popupId`
 *   link      đi tới `href` (neo trên trang, hoặc https mở tab mới)
 */

/**
 * `style` là ngữ nghĩa; variant của `ui/Button` tuỳ nền nút đứng. Tên class KHÔNG đi vào dữ
 * liệu — Tailwind không sinh CSS cho chuỗi chỉ có trong database.
 */
const VARIANTS = {
  light: { primary: 'filled', secondary: 'outlined' },
  dark: { primary: 'inverted', secondary: 'invertedOutline' },
}
export function variantFor(style, surface = 'light') {
  const table = VARIANTS[surface] ?? VARIANTS.light
  return table[style] ?? table.primary
}

export const isExternal = (href) => /^https?:\/\//.test(href ?? '')

/**
 * Nút cũ (trước API 23) chỉ có chữ, hành động viết cứng trong component. Khôi phục một bản
 * lịch sử cũ ghi lại đúng hình dạng đó (không qua schema), nên khi vắng `buttons` trang dựng
 * nút từ khoá cũ với ĐÚNG hành động cũ — y như migration 025 đã chuyển.
 */
const LEGACY = {
  hero: [
    { key: 'primaryCta', id: 'primary', style: 'primary', arrow: true, action: 'link', href: '#courses' },
    { key: 'secondaryCta', id: 'secondary', style: 'secondary', action: 'link', href: '#facilities' },
  ],
  finalCta: [
    { key: 'primaryCta', id: 'primary', style: 'primary', arrow: true, action: 'register' },
    { key: 'secondaryCta', id: 'secondary', style: 'secondary', action: 'link', href: '#contact' },
  ],
  nav: [{ key: 'cta', id: 'register', style: 'primary', action: 'register' }],
}

/** Nút của một section: `buttons` nếu có (kể cả mảng rỗng — admin xoá hết), không thì khoá cũ. */
export function buttonsOf(section, sectionKey) {
  if (Array.isArray(section?.buttons)) return section.buttons
  return (LEGACY[sectionKey] ?? [])
    .filter(({ key }) => section?.[key])
    .map(({ key, ...button }) => ({ ...button, label: section[key] }))
}

/**
 * Nút có vẽ được không. Không vẽ thay vì vẽ một nút bấm vào không làm gì: link trỏ vào khối
 * admin đã tắt, form đã xoá hoặc đang đóng nhận, popup đã xoá. (Máy chủ chặn xoá form / popup
 * đang được trỏ tới, nhưng bản dự phòng đóng gói có thể cũ hơn database.)
 */
export function isButtonLive(t, button, isLive) {
  if (!button?.label) return false
  switch (button.action) {
    case 'register':
      return true
    case 'form': {
      const form = t.forms?.items?.find((item) => item.id === button.formId)
      return Boolean(form && !form.closed)
    }
    case 'popup':
      return Boolean(t.popups?.items?.some((item) => item.id === button.popupId))
    case 'link':
      return Boolean(button.href) && button.href !== '#' && isLive(button.href)
    default:
      return false
  }
}
