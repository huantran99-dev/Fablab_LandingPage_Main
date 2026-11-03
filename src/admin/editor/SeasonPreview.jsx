import { INK, WHITE, contrast, readableOn } from '../../lib/color'
import { MotifOrnament, MotifShape } from '../../lib/MotifArt'
import { confettiColors, resolveMotif } from '../../lib/motifs'
import { DEFAULT_SEASON_COLORS } from '../sections/descriptors'
import { Icon } from '../ui/Icon'

const HEX = /^#[0-9a-fA-F]{6}$/
const pick = (working, key) => {
  const value = working.shared[key]
  return HEX.test(value ?? '') ? value.toLowerCase() : DEFAULT_SEASON_COLORS[key]
}

/**
 * Mẫu màu của sự kiện mùa ngay trong form — nút chính, nhãn trên nền nhạt, khối tối —
 * vẽ bằng ĐÚNG luật trang dùng (`readableOn` cho chữ trên nút, chữ trắng trên khối tối),
 * kèm cảnh báo khi một cặp màu dưới 4.5:1 (WCAG AA cho chữ thường). Máy chủ cảnh báo
 * cùng các cặp đó khi lưu (invariants.js).
 *
 * Màu là dữ liệu nên đi qua `style`, không qua tên class. Họa tiết (vật trang trí trên nút
 * + vài hạt tĩnh) giải bằng CÙNG `resolveMotif` với trang công khai — bộ có sẵn lẫn họa
 * tiết tự tạo (thư viện `motifs` đến qua `/meta`).
 */
export function SeasonPreview({ working, ctx }) {
  const primary = pick(working, 'colorPrimary')
  const surface = pick(working, 'colorSurface')
  const dark = pick(working, 'colorDark')
  const onPrimary = readableOn(primary)
  const accent = pick(working, 'colorAccent')
  const motif = resolveMotif(working.shared.motif, ctx?.meta?.motifs, accent)
  const config = motif?.particles
  const particles = config
    ? config.kinds.flatMap((kind, k) =>
        config.coloured && kind.glyph
          ? confettiColors(accent)
              .slice(0, 3)
              .map((color, c) => ({ shape: kind, color, size: kind.size[1], key: `${k}-${c}` }))
          : kind.size.map((size, c) => ({ shape: kind, size, key: `${k}-${c}` })),
      )
    : []

  const checks = [
    ['Chữ trên nút chính', contrast(onPrimary, primary)],
    ['Màu chủ đạo trên nền nhạt (nhãn nhỏ)', contrast(primary, surface)],
    ['Chữ trắng trên khối tối', contrast(WHITE, dark)],
  ]
  const weak = checks.filter(([, ratio]) => ratio !== null && ratio < 4.5)

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-400">Xem trước màu và họa tiết</p>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 pt-6">
          <span
            className="relative inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium"
            style={{ background: primary, color: onPrimary }}
          >
            Đăng ký ngay
            {motif && <MotifOrnament pieces={motif.ornament} />}
          </span>
          <span className="inline-flex items-center rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: surface, color: primary }}>
            Nhãn
          </span>
          <span className="text-sm font-medium" style={{ color: primary }}>
            Liên kết →
          </span>
        </div>
        <div className="p-4 text-sm font-medium" style={{ background: dark, color: WHITE }}>
          Khối kêu gọi cuối trang
        </div>
        {config && (
          <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800">
            <span className="text-theme-xs text-gray-500">
              {working.shared.fall ? (config.direction < 0 ? 'Bay lên trên trang:' : 'Rơi trên trang:') : 'Hạt rơi đang tắt — chỉ trang trí nút:'}
            </span>
            {particles.map((p, i) => (
              <MotifShape
                key={p.key}
                shape={p.shape}
                color={p.color}
                size={p.size}
                style={{
                  transform: config.tilt || config.upright ? undefined : `rotate(${(i * 47) % 360}deg)`,
                  opacity: working.shared.fall ? 1 : 0.35,
                }}
              />
            ))}
          </div>
        )}
        {working.shared.motif && !motif && (
          <p className="flex items-center gap-1.5 border-t border-gray-200 bg-white px-4 py-3 text-theme-xs text-warning-600 dark:border-gray-800">
            <Icon name="alert" size={14} />
            Họa tiết "{working.shared.motif}" không còn trong mục Họa tiết — chọn họa tiết khác.
          </p>
        )}
      </div>
      {weak.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {weak.map(([label, ratio]) => (
            <li key={label} className="flex items-center gap-1.5 text-theme-xs text-warning-600 dark:text-warning-500">
              <Icon name="alert" size={14} />
              {label}: {ratio.toFixed(1)}:1 — nên từ 4.5:1 trở lên, chữ khó đọc.
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 flex items-center gap-1.5 text-theme-xs text-success-600 dark:text-success-500">
          <Icon name="check" size={14} />
          Các cặp màu đều đủ tương phản. Chữ trên nút: {onPrimary === INK ? 'đen' : 'trắng'}.
        </p>
      )}
    </div>
  )
}
