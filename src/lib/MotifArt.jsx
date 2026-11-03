/**
 * Phần vẽ SVG / ảnh của họa tiết — dữ liệu hình ở motifs.js (tách riêng để file này chỉ
 * export component). Dùng ở ui/Button.jsx, SeasonFall.jsx và dashboard (SeasonPreview,
 * MotifPreview).
 */
import { GLYPHS, resolve } from './motifs'

function GlyphPaths({ glyph, color }) {
  return GLYPHS[glyph].map((prim, i) =>
    prim.canvasOnly ? null : (
    <path
      key={i}
      d={prim.d}
      fill={prim.fill ? resolve(prim.fill, color) : 'none'}
      stroke={prim.stroke ? resolve(prim.stroke, color) : undefined}
      strokeWidth={prim.width}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={prim.opacity}
      transform={prim.rotate ? `rotate(${prim.rotate} 12 12)` : undefined}
    />
    ),
  )
}

/** Một hạt đơn dạng SVG (hình có sẵn). */
export function MotifGlyph({ glyph, size = 24, color, style }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" style={style}>
      <GlyphPaths glyph={glyph} color={color} />
    </svg>
  )
}

/**
 * Một hình bất kỳ của bộ giải (`{ glyph }` hoặc `{ image }`, xem `lookupShape`) — hình có
 * sẵn vẽ SVG, ảnh tải lên vẽ `<img>` vừa khít ô vuông.
 */
export function MotifShape({ shape, size = 24, color, style }) {
  if (shape.image) {
    return (
      <img
        src={shape.image.url}
        alt=""
        aria-hidden="true"
        draggable={false}
        width={size}
        height={size}
        style={{ objectFit: 'contain', width: size, height: size, ...style }}
      />
    )
  }
  return <MotifGlyph glyph={shape.glyph} size={size} color={color} style={style} />
}

/**
 * Vật trang trí đậu trên nút. Đặt bên trong một phần tử `position: relative`. `pieces` là
 * `ornament` của `resolveMotif` (bộ có sẵn hay tự tạo đều cùng dạng).
 * `swayClass` (do Button truyền) gắn hiệu ứng rung khi rê chuột — để class nằm trong
 * mã của trang công khai, không nằm ở đây.
 */
export function MotifOrnament({ pieces, swayClass = '' }) {
  if (!pieces || pieces.length === 0) return null
  return pieces.map((piece, i) => {
    const className = piece.sway ? swayClass : undefined
    const style = { position: 'absolute', pointerEvents: 'none', ...piece.style }
    if (piece.image) {
      return (
        <img
          key={i}
          src={piece.image}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={className}
          style={{ objectFit: 'contain', maxWidth: 'none', ...style }}
        />
      )
    }
    return (
      <svg
        key={i}
        viewBox={piece.viewBox}
        preserveAspectRatio={piece.stretch ? 'none' : undefined}
        aria-hidden="true"
        focusable="false"
        className={className}
        style={{ overflow: 'visible', ...style }}
      >
        {piece.paths?.map((prim, j) => (
          <path
            key={j}
            d={prim.d}
            fill={prim.fill ?? 'none'}
            stroke={prim.stroke}
            strokeWidth={prim.width}
            strokeLinecap="round"
            vectorEffect={piece.stretch ? 'non-scaling-stroke' : undefined}
          />
        ))}
        {piece.glyphs?.map((item, j) => (
          <g key={`g${j}`} transform={`translate(${item.x} ${item.y}) scale(${item.size / 24})`}>
            <GlyphPaths glyph={item.glyph} color={item.color} />
          </g>
        ))}
      </svg>
    )
  })
}
