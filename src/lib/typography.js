/**
 * Nối hai chữ cuối của mỗi đoạn chữ bằng dấu cách không ngắt (U+00A0), để dòng cuối không
 * bao giờ chỉ còn một chữ ("…cho cộng / đồng.").
 *
 * Vì sao cần, khi `body` đã có `text-wrap: pretty` (index.css):
 * - Chrome chỉ né khi dòng cuối NGẮN theo bề rộng. Chữ cuối dài ("2019–2023.",
 *   "entrepreneurship.") vẫn bị để trơ trọi — đo bằng puppeteer: còn 25 chỗ.
 * - Firefox và Safari trước bản 26 không hỗ trợ `pretty`.
 *
 * Làm lúc NẠP nội dung (contentStore), không ghi vào database: chữ admin sửa trên
 * dashboard vẫn y nguyên, chèn `&nbsp;` tay vào dữ liệu thì vỡ ngay lần sửa kế tiếp. Máy
 * chủ chỉ nhận `id` từ trang (form đăng ký, thống kê), không nhận chữ, nên ký tự lạ không
 * đi ngược về đâu.
 *
 * Không đụng:
 * - khoá tra cứu / đường dẫn (`SKIP_KEYS`) — đổi một ký tự là tra hụt;
 * - chuỗi dưới 3 chữ (nhãn, nút) — không có gì để rớt;
 * - cặp chữ cuối dài quá `MAX_TIE` ký tự — dính lại thì ô hẹp có thể tràn ngang.
 */
const SKIP_KEYS = new Set([
  'id',
  'href',
  'url',
  'sourceUrl',
  'group',
  'level',
  'stage',
  'topic',
  'icon',
  'kind',
  'kinds',
  'facility',
  'status',
])

const MAX_TIE = 24
// Dấu cách thường cuối cùng, theo sau là chữ cuối (và khoảng trắng thừa nếu có).
const LAST_GAP = / (\S+)(\s*)$/

export function tieLastWords(value, key) {
  if (typeof value === 'string') {
    if (SKIP_KEYS.has(key)) return value
    const words = value.trim().split(/\s+/)
    if (words.length < 3) return value
    const pair = words.slice(-2).join(' ')
    if (pair.length > MAX_TIE) return value
    return value.replace(LAST_GAP, ' $1$2')
  }
  if (Array.isArray(value)) return value.map((item) => tieLastWords(item, key))
  if (value && typeof value === 'object') {
    const out = {}
    for (const [childKey, child] of Object.entries(value)) {
      out[childKey] = SKIP_KEYS.has(childKey) ? child : tieLastWords(child, childKey)
    }
    return out
  }
  return value
}
