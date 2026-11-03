/**
 * Bộ họa tiết của sự kiện mùa — MỘT nguồn hình cho ba nơi:
 *   - vật trang trí đậu trên nút chính (`ornamentPieces`, vẽ bằng `MotifOrnament` trong
 *     MotifArt.jsx, dùng ở ui/Button.jsx);
 *   - hạt rơi trên trang (`PARTICLES` + `drawGlyph`, dùng trong SeasonFall.jsx, vẽ canvas);
 *   - khung xem trước trong dashboard (src/admin/editor/SeasonPreview.jsx).
 *
 * Hình là DỮ LIỆU (path SVG trong hộp 24×24), không phải ảnh tải lên: nhẹ, sắc ở mọi cỡ,
 * và canvas vẽ lại đúng cùng path bằng `Path2D`. Vị trí vật trang trí đặt bằng `style`
 * chứ không bằng class — dashboard có stylesheet riêng không quét src/components/.
 *
 * Id bộ (`MOTIFS`) và id hình (`GLYPHS`) CHÉP ở server/content/motifs.js — `check:content`
 * so hai bản, lệch là HỎNG — và ở ô chọn trong src/admin/sections/descriptors.js.
 *
 * Admin còn tự tạo họa tiết trong thư viện `motifs` (ảnh PNG tải lên + hình có sẵn, trộn
 * theo tỉ lệ). Mọi nơi vẽ đi qua `resolveMotif`, nên bộ có sẵn và bộ tự tạo cùng một dạng.
 *
 * Màu của từng bộ cố định trong mã (hoa mai thì vàng); chỉ pháo giấy lấy màu phụ của sự
 * kiện qua token `$accent`. Tuyết KHÔNG trắng tinh: tuyết trắng trên nền trắng của trang
 * là vô hình, nên dùng xanh xám nhạt có viền.
 */

export const MOTIFS = ['snow', 'mai', 'dao', 'lantern', 'confetti', 'halloween']

const circle = (cx, cy, r) =>
  `M${cx + r} ${cy}A${r} ${r} 0 1 1 ${cx - r} ${cy}A${r} ${r} 0 1 1 ${cx + r} ${cy}Z`

const ellipse = (cx, cy, rx, ry) =>
  `M${cx + rx} ${cy}A${rx} ${ry} 0 1 1 ${cx - rx} ${cy}A${rx} ${ry} 0 1 1 ${cx + rx} ${cy}Z`

/** `n` bản sao của một nét, xoay đều quanh tâm hộp (12, 12). */
const ring = (prim, n, offset = 0) =>
  Array.from({ length: n }, (_, i) => ({ ...prim, rotate: offset + (360 / n) * i }))

const PETAL = 'M12 12C8.3 10.9 7.6 4.7 12 3.3C16.4 4.7 15.7 10.9 12 12Z'
const LOOSE_PETAL = 'M12 21C5.8 17 6.4 7.2 12 3.5C17.6 7.2 18.2 17 12 21Z'

const blossom = ({ petal, edge, heart, stamen }) => [
  ...ring({ d: PETAL, fill: petal, stroke: edge, width: 0.6 }, 5),
  ...ring({ d: circle(12, 7.9, 0.75), fill: stamen }, 5, 36),
  { d: circle(12, 12, 2.3), fill: heart },
]
const loosePetal = ({ petal, edge }) => [
  { d: LOOSE_PETAL, fill: petal, stroke: edge, width: 0.8 },
  { d: 'M12 19.5C11.4 15 11.4 9.5 12 6', stroke: edge, width: 0.7, opacity: 0.7 },
]

const MAI = { petal: '#ffcc2e', edge: '#e09c00', heart: '#f08c00', stamen: '#a85300' }
const DAO = { petal: '#ffb8ca', edge: '#e77799', heart: '#d63f6f', stamen: '#9d174d' }

/**
 * Hình đơn trong hộp 24×24: danh sách nét `{ d, fill?, stroke?, width?, rotate?, opacity? }`.
 * `canvasOnly`: chỉ vẽ cho hạt rơi (quầng sáng đèn lồng) — trên nút trông như cái đĩa.
 */
export const GLYPHS = {
  snowflake: [
    ...ring({ d: 'M12 12V2.6M12 6.2 9.5 3.9M12 6.2 14.5 3.9M12 9.2 10.1 7.5M12 9.2 13.9 7.5', stroke: '#86a9d1', width: 1.4 }, 6),
    { d: circle(12, 12, 1.6), fill: '#ffffff', stroke: '#86a9d1', width: 1 },
  ],
  snowdot: [{ d: circle(12, 12, 6), fill: '#e3edf8', stroke: '#9fbadb', width: 1.4 }],
  mai: blossom(MAI),
  maiPetal: loosePetal(MAI),
  dao: blossom(DAO),
  daoPetal: loosePetal(DAO),
  lantern: [
    { d: circle(12, 12.2, 10.5), fill: '#ffb347', opacity: 0.22, canvasOnly: true },
    { d: 'M12 0.6V3.2', stroke: '#8a5a2b', width: 0.9 },
    { d: 'M9 3H15V5.2H9Z', fill: '#e8a317' },
    { d: 'M12 5C4.2 5 4.2 19 12 19C19.8 19 19.8 5 12 5Z', fill: '#e2432a' },
    { d: 'M12 5C8.8 8 8.8 16 12 19M12 5C15.2 8 15.2 16 12 19', stroke: '#a92e18', width: 0.8 },
    { d: 'M7.9 9.2C7.4 11 7.4 13 7.9 14.8', stroke: '#ff9b7d', width: 1 },
    { d: 'M9.4 18.8H14.6V20.6H9.4Z', fill: '#e8a317' },
    { d: 'M12 20.6V23.6', stroke: '#e8a317', width: 1.3 },
  ],
  confettiRect: [{ d: 'M8.5 4.5H15.5V19.5H8.5Z', fill: '$color' }],
  confettiDot: [{ d: circle(12, 12, 4.5), fill: '$color' }],
  confettiCurl: [{ d: 'M5 15C7 9 10 9 12 12S17 15 19 9', stroke: '$color', width: 2.6 }],
  // Halloween: bóng dơi tím than (không đen tuyền — trên khối tối vẫn còn viền tím) và bí ngô.
  bat: [
    {
      d: 'M12 8.7L13.1 7.4L13.5 9.5C15.6 8.4 18.8 7.6 22 8.4C20.4 9.2 19.8 10.8 20 12.6C19 11.8 17.6 11.8 16.8 12.8C16.4 11.8 15.2 11.5 14.4 12.2C14 13.6 13.2 14.8 12 15.6C10.8 14.8 10 13.6 9.6 12.2C8.8 11.5 7.6 11.8 7.2 12.8C6.4 11.8 5 11.8 4 12.6C4.2 10.8 3.6 9.2 2 8.4C5.2 7.6 8.4 8.4 10.5 9.5L10.9 7.4Z',
      fill: '#2b1a3d',
      stroke: '#6b4a8a',
      width: 0.5,
    },
    { d: circle(11.3, 10.3, 0.55), fill: '#ff8a1f' },
    { d: circle(12.7, 10.3, 0.55), fill: '#ff8a1f' },
  ],
  pumpkin: [
    { d: ellipse(8.3, 14.4, 4.6, 5.6), fill: '#e8590c', stroke: '#b4410a', width: 0.6 },
    { d: ellipse(15.7, 14.4, 4.6, 5.6), fill: '#e8590c', stroke: '#b4410a', width: 0.6 },
    { d: ellipse(12, 14.2, 4.6, 6.1), fill: '#f76707', stroke: '#b4410a', width: 0.6 },
    { d: 'M11.3 8.4C11.2 6.6 11.8 5.2 13.4 4.4L14.2 5.4C13 6.1 12.7 7.2 12.9 8.4Z', fill: '#3f6b2a' },
    { d: 'M13.6 5.5C15.1 4.5 16.9 4.8 17.6 6.1', stroke: '#3f6b2a', width: 0.9 },
    { d: 'M8.9 12.7H10.7L9.8 11Z', fill: '#3b1600' },
    { d: 'M13.3 12.7H15.1L14.2 11Z', fill: '#3b1600' },
    { d: 'M8.6 15.1C10 17 14 17 15.4 15.1L14.3 15.6L13.4 15.1L12.5 15.7L11.5 15.1L10.6 15.7L9.7 15.1Z', fill: '#3b1600' },
  ],
}

/** Màu pháo giấy: màu phụ của sự kiện + vài màu tươi cố định. */
export const confettiColors = (accent) => [accent || '#ff613d', '#f5c518', '#22b07d', '#ff6fa8', '#4c8dff']

export const resolve = (value, color) => (value === '$color' ? color : value)

// --- Vật trang trí trên nút ---------------------------------------------------

/** Hình đặt vào ô `x, y` cỡ `size` bên trong một mảnh trang trí. */
const place = (glyph, x, y, size, color) => ({ glyph, x, y, size, color })

const SNOW_CAP =
  'M0 10C0 6.5 4 4.5 9 5.4C12 1.4 20 1 24 4.2C29 0.4 37.5 1 41 4C46 0.8 54.5 0.8 58 4C63 0.4 71.5 1 75 4.2C80 1 88.5 1.6 92 5.2C97 4.4 100 7 100 10V11C100 13.2 97.4 13.4 95.6 12.4C93.6 12.2 92.6 15.6 90.2 15.6C87.8 15.6 88.2 12.2 85.4 12.2H62C60 12.2 60.4 16 57.2 16C54 16 55 12.2 52 12.2H30.4C28.4 12.2 28.4 14.8 26.2 14.8C24 14.8 24.2 12.2 22 12.2H5C2.2 12.2 0 12.2 0 10Z'

const BRANCH = { mai: '#7a4a24', dao: '#5b3a29' }

/**
 * Mảnh trang trí của từng bộ: `{ style, viewBox, sway?, stretch?, paths?, glyphs? }`.
 * `style` là vị trí tính theo cạnh nút (px). Nhô ra ngoài nút tối đa ~15px — khung có
 * `overflow-hidden` (popup) có đủ đệm. `sway` = rung nhẹ khi rê chuột lên nút.
 */
export function ornamentPieces(motif, accent) {
  switch (motif) {
    case 'snow':
      return [
        // Lớp tuyết phủ đỉnh nút: kéo giãn theo bề ngang (`stretch`), viền không giãn.
        // Bắt đầu cách mép 18px — chỗ đó cạnh trên của pill đã gần phẳng, tuyết không lơ
        // lửng trên góc bo. `width` phải ghi rõ: SVG là phần tử thay thế, đặt cả left lẫn
        // right thì nó vẫn giữ bề rộng tự nhiên theo viewBox.
        { style: { left: 18, width: 'calc(100% - 36px)', top: -6, height: 15 }, viewBox: '0 0 100 16', stretch: true, paths: [{ d: SNOW_CAP, fill: '#ffffff', stroke: '#c3d4e6', width: 1 }] },
        { style: { right: -5, top: -10, width: 15, height: 15 }, viewBox: '0 0 24 24', sway: true, glyphs: [place('snowflake', 0, 0, 24)] },
      ]
    case 'mai':
    case 'dao':
      return [
        {
          style: { right: -12, top: -15, width: 44, height: 32, transformOrigin: '10% 95%' },
          viewBox: '0 0 38 28',
          sway: true,
          paths: [
            { d: 'M2 27C10 22.5 16 18.5 24 13.5C28 11 31 8 34.5 3.5', stroke: BRANCH[motif], width: 1.7 },
            { d: 'M18 17C18.5 14.5 20.5 13 22.5 13', stroke: BRANCH[motif], width: 1.1 },
          ],
          glyphs: [place(motif, 17, 0, 17), place(motif, 3, 11, 12), place(motif, 30, -1, 7)],
        },
      ]
    case 'lantern':
      return [
        { style: { right: -3, top: -13, width: 20, height: 29, transformOrigin: '50% 0%' }, viewBox: '5 0 14 24', sway: true, glyphs: [place('lantern', 0, 0, 24)] },
      ]
    case 'halloween':
      return [
        { style: { left: -9, top: -13, width: 24, height: 24, transformOrigin: '50% 50%' }, viewBox: '0 0 24 24', sway: true, glyphs: [place('bat', 0, 0, 24)] },
        { style: { right: -10, top: -14, width: 26, height: 26, transformOrigin: '50% 90%' }, viewBox: '0 0 24 24', sway: true, glyphs: [place('pumpkin', 0, 0, 24)] },
      ]
    case 'confetti': {
      const [c1, c2, c3, c4, c5] = confettiColors(accent)
      return [
        {
          style: { left: -9, top: -13, width: 30, height: 21 },
          viewBox: '0 0 26 18',
          sway: true,
          glyphs: [place('confettiRect', 0, 0, 9, c1), place('confettiDot', 9, 5, 7, c2), place('confettiCurl', 14, -1, 11, c3)],
        },
        {
          style: { right: -9, top: -14, width: 30, height: 21, transformOrigin: '30% 100%' },
          viewBox: '0 0 26 18',
          sway: true,
          glyphs: [place('confettiCurl', 0, 3, 11, c4), place('confettiRect', 11, -1, 9, c5), place('confettiDot', 18, 7, 7, c1)],
        },
      ]
    }
    default:
      return []
  }
}

// --- Canvas -------------------------------------------------------------------

/**
 * Cách rơi của từng bộ. `kinds`: loại hạt + tỉ lệ + cỡ (px CSS). `speed` px/giây,
 * `direction` 1 = rơi xuống, -1 = bay lên (đèn lồng). `sway` biên độ lắc ngang (px),
 * `spin` rad/giây, `tilt` lắc nghiêng thay cho xoay tròn, `flip` lật như mảnh giấy;
 * `flap` trên MỘT loại hạt = vỗ cánh (co giãn chiều dọc, dơi Halloween).
 * `toggle` trên một loại hạt = hình của nút bật/tắt (vắng thì lấy loại đầu tiên).
 * `density` nhân với số hạt chuẩn.
 */
export const PARTICLES = {
  snow: {
    kinds: [
      { glyph: 'snowflake', weight: 0.45, size: [11, 18] },
      { glyph: 'snowdot', weight: 0.55, size: [5, 9] },
    ],
    speed: [18, 40],
    direction: 1,
    sway: [10, 26],
    spin: [-0.5, 0.5],
    density: 1,
  },
  mai: {
    kinds: [
      { glyph: 'mai', weight: 0.45, size: [14, 21] },
      { glyph: 'maiPetal', weight: 0.55, size: [8, 12] },
    ],
    speed: [24, 46],
    direction: 1,
    sway: [14, 34],
    spin: [-1.4, 1.4],
    density: 0.85,
  },
  dao: {
    kinds: [
      { glyph: 'dao', weight: 0.45, size: [14, 21] },
      { glyph: 'daoPetal', weight: 0.55, size: [8, 12] },
    ],
    speed: [24, 46],
    direction: 1,
    sway: [14, 34],
    spin: [-1.4, 1.4],
    density: 0.85,
  },
  lantern: {
    kinds: [{ glyph: 'lantern', weight: 1, size: [20, 32] }],
    speed: [10, 20],
    direction: -1,
    sway: [4, 10],
    tilt: 0.14,
    density: 0.4,
  },
  halloween: {
    // Dơi bay lượn thưa, vỗ cánh (`flap`), lắc nghiêng chứ không xoay tròn; vài quả bí ngô rơi.
    kinds: [
      { glyph: 'bat', weight: 0.72, size: [22, 32], flap: true },
      { glyph: 'pumpkin', weight: 0.28, size: [12, 18], toggle: true },
    ],
    speed: [14, 30],
    direction: 1,
    sway: [22, 46],
    tilt: 0.28,
    density: 0.7,
  },
  confetti: {
    kinds: [
      { glyph: 'confettiRect', weight: 0.5, size: [9, 13] },
      { glyph: 'confettiDot', weight: 0.25, size: [6, 9] },
      { glyph: 'confettiCurl', weight: 0.25, size: [11, 15] },
    ],
    speed: [40, 72],
    direction: 1,
    sway: [8, 18],
    spin: [-3, 3],
    flip: true,
    density: 1,
    coloured: true,
  },
}

// --- Thư viện họa tiết tự tạo (section `motifs`, từ API 17) ------------------------

/** Tham chiếu tới ảnh tải lên: `img:<id trong motifs.shapes>`. Chép ở server/content/motifs.js. */
export const IMAGE_PREFIX = 'img:'

/**
 * Hình của một tham chiếu: `{ glyph }` (hình có sẵn) hoặc `{ image: { url, width, height } }`
 * (ảnh tải lên). `null` khi tra hụt hoặc ảnh chưa gắn file — nơi gọi bỏ qua hình đó.
 */
export function lookupShape(ref, shapes) {
  if (!ref) return null
  if (ref.startsWith(IMAGE_PREFIX)) {
    const id = ref.slice(IMAGE_PREFIX.length)
    const image = (shapes ?? []).find((shape) => shape.id === id)?.image
    return image?.url ? { image } : null
  }
  return Object.hasOwn(GLYPHS, ref) ? { glyph: ref } : null
}

const usesColor = (glyph) => GLYPHS[glyph].some((prim) => prim.fill === '$color' || prim.stroke === '$color')

/** Kiểu chuyển động của họa tiết tự tạo → thông số canvas (cùng nghĩa với `PARTICLES`). */
const MOTION = {
  spin: { spin: [-1.4, 1.4] },
  tilt: { tilt: 0.28 },
  flip: { spin: [-3, 3], flip: true },
  // Chỉ trôi: hạt đứng thẳng, không xoay.
  drift: { upright: true },
}

/** Cấu hình hạt rơi (dạng `PARTICLES`) của một họa tiết tự tạo; `null` khi không còn loại hạt nào vẽ được. */
function customParticles(motif, shapes) {
  const kinds = (motif.particles ?? [])
    .map((particle) => {
      const shape = lookupShape(particle.shape, shapes)
      return shape && { ...shape, weight: particle.weight, size: [particle.sizeMin, Math.max(particle.sizeMin, particle.sizeMax)], flap: particle.flap }
    })
    .filter(Boolean)
  if (kinds.length === 0) return null
  const total = kinds.reduce((sum, kind) => sum + kind.weight, 0) || 1
  return {
    kinds: kinds.map((kind) => ({ ...kind, weight: kind.weight / total })),
    speed: [motif.speedMin, Math.max(motif.speedMin, motif.speedMax)],
    direction: motif.direction === 'up' ? -1 : 1,
    sway: [motif.sway / 2, motif.sway],
    ...MOTION[motif.motion],
    density: motif.density / 100,
    coloured: kinds.some((kind) => kind.glyph && usesColor(kind.glyph)),
  }
}

/**
 * Vật trang trí của họa tiết tự tạo: một hình (có sẵn hoặc ảnh) ở góc trên-trái, trên-phải
 * hoặc cả hai, cỡ `ornamentSize`. Nhô ra ngoài nút tối đa ~15px như các bộ có sẵn.
 */
function customOrnament(motif, shapes, accent) {
  const shape = lookupShape(motif.ornamentShape, shapes)
  if (!shape) return []
  const size = motif.ornamentSize
  const out = Math.min(Math.round(size * 0.4), 12)
  const top = -Math.min(Math.round(size * 0.55), 15)
  const piece = (side) => ({
    style: { [side]: -out, top, width: size, height: size, transformOrigin: '50% 90%' },
    sway: true,
    ...(shape.image
      ? { image: shape.image.url }
      : { viewBox: '0 0 24 24', glyphs: [place(shape.glyph, 0, 0, 24, confettiColors(accent)[0])] }),
  })
  return motif.ornamentCorner === 'both' ? [piece('left'), piece('right')] : [piece(motif.ornamentCorner === 'left' ? 'left' : 'right')]
}

/**
 * MỘT bộ giải cho mọi nơi vẽ họa tiết (nút, hạt rơi, dashboard): `id` là bộ có sẵn hoặc
 * id trong thư viện `library` (= `t.motifs`). Trả `{ id, particles, ornament }`:
 *   - `particles`: cấu hình dạng `PARTICLES` (loại hạt mang `glyph` HOẶC `image`), hoặc `null`
 *   - `ornament`: mảnh trang trí dạng `ornamentPieces` (mảnh ảnh mang `image`)
 * `null` khi id không có — trang chỉ mất trang trí, không sập.
 */
export function resolveMotif(id, library, accent) {
  if (!id) return null
  if (Object.hasOwn(PARTICLES, id)) return { id, particles: PARTICLES[id], ornament: ornamentPieces(id, accent) }
  const motif = (library?.items ?? []).find((item) => item.id === id)
  if (!motif) return null
  return { id, particles: customParticles(motif, library.shapes), ornament: customOrnament(motif, library.shapes, accent) }
}

/** Loại hạt làm hình cho nút bật/tắt hạt rơi. */
export const toggleKind = (particles) => particles.kinds.find((kind) => kind.toggle) ?? particles.kinds[0]

/** Vẽ một hình 24×24 lên canvas, đã `scale` sẵn theo cỡ đích. */
export function drawGlyph(ctx, glyph, color) {
  for (const prim of GLYPHS[glyph]) {
    ctx.save()
    if (prim.rotate) {
      ctx.translate(12, 12)
      ctx.rotate((prim.rotate * Math.PI) / 180)
      ctx.translate(-12, -12)
    }
    ctx.globalAlpha = prim.opacity ?? 1
    const path = new Path2D(prim.d)
    if (prim.fill) {
      ctx.fillStyle = resolve(prim.fill, color)
      ctx.fill(path)
    }
    if (prim.stroke) {
      ctx.strokeStyle = resolve(prim.stroke, color)
      ctx.lineWidth = prim.width ?? 1
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke(path)
    }
    ctx.restore()
  }
}
