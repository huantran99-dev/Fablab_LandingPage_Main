/**
 * Id của họa tiết vẽ sẵn bằng mã — BẢN CHÉP của src/lib/motifs.js (máy chủ không import
 * mã giao diện). `npm run check:content` so hai bản với nhau, lệch là HỎNG.
 *
 *   BUILTIN_MOTIFS  6 bộ có sẵn (`MOTIFS`) — admin chọn ở sự kiện mùa
 *   MOTIF_GLYPHS    hình đơn (`Object.keys(GLYPHS)`) — làm loại hạt của họa tiết tự tạo
 *
 * Hình tải lên của thư viện họa tiết được tham chiếu bằng `img:<id trong motifs.shapes>`.
 */
export const BUILTIN_MOTIFS = ['snow', 'mai', 'dao', 'lantern', 'confetti', 'halloween']

export const MOTIF_GLYPHS = [
  'snowflake',
  'snowdot',
  'mai',
  'maiPetal',
  'dao',
  'daoPetal',
  'lantern',
  'confettiRect',
  'confettiDot',
  'confettiCurl',
  'bat',
  'pumpkin',
]

export const IMAGE_SHAPE_PREFIX = 'img:'
