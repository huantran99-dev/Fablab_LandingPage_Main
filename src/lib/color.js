/**
 * Tương phản màu theo WCAG 2 — chọn màu chữ trên nút khi sự kiện mùa đổi màu chủ đạo, và
 * cảnh báo tương phản trong dashboard.
 *
 * BẢN CHÉP của `server/content/color.js` (bundle trình duyệt không import được mã máy
 * chủ, cùng tiền lệ `normalizePhone`). Đổi công thức ở một bên là phải đổi bên kia.
 */

const HEX = /^#([0-9a-f]{6})$/i

/** Độ chói tương đối của `#rrggbb`, hoặc `null` nếu không phải mã hex 6 chữ số. */
export function luminance(hex) {
  const match = HEX.exec(String(hex ?? ''))
  if (!match) return null
  const value = Number.parseInt(match[1], 16)
  const channel = (shift) => {
    const c = ((value >> shift) & 0xff) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(16) + 0.7152 * channel(8) + 0.0722 * channel(0)
}

/** Tỉ lệ tương phản giữa hai màu (1–21), hoặc `null` nếu một trong hai không hợp lệ. */
export function contrast(a, b) {
  const la = luminance(a)
  const lb = luminance(b)
  if (la === null || lb === null) return null
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

export const WHITE = '#ffffff'
/** `--color-ink` của trang. */
export const INK = '#101214'

/** Chữ đọc được trên nền `hex`: trắng nếu đủ tương phản, không thì màu mực. */
export function readableOn(hex) {
  const white = contrast(WHITE, hex)
  const ink = contrast(INK, hex)
  if (white === null) return WHITE
  return white >= 4.5 || white >= ink ? WHITE : INK
}
