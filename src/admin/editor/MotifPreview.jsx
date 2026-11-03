import { useEffect, useRef, useState } from 'react'

import { useMediaQuery } from '../../hooks/useMediaQuery'
import { startFall } from '../../lib/fallEngine'
import { MotifOrnament, MotifShape } from '../../lib/MotifArt'
import { IMAGE_PREFIX, lookupShape, resolveMotif } from '../../lib/motifs'
import { DEFAULT_SEASON_COLORS, GLYPH_LABELS } from '../sections/descriptors'
import { Icon } from '../ui/Icon'
import { fromWorking } from './model'

/** Id nội bộ của bản đang soạn — không thể trùng id thật (`_` không hợp lệ trong id). */
const PREVIEW_ID = '__preview__'
const ACCENT = DEFAULT_SEASON_COLORS.colorAccent

/** `configKey` = JSON của cấu hình: canvas chỉ dựng lại khi thông số thật sự đổi. */
function LiveFall({ configKey, dark }) {
  const boxRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const box = boxRef.current
    const canvas = canvasRef.current
    if (!box || !canvas) return undefined
    const fall = startFall(canvas, JSON.parse(configKey), { accent: ACCENT, measure: () => ({ width: box.clientWidth, height: box.clientHeight }) })
    const observer = new ResizeObserver(() => fall.resize())
    observer.observe(box)
    return () => {
      fall.stop()
      observer.disconnect()
    }
  }, [configKey])

  return (
    <div
      ref={boxRef}
      className="relative h-56 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
      style={{ background: dark ? DEFAULT_SEASON_COLORS.colorDark : '#ffffff' }}
    >
      <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  )
}

/**
 * Xem trước SỐNG họa tiết đang soạn: nút mẫu có vật trang trí + khung hạt rơi chạy đúng bộ
 * máy của trang (src/lib/fallEngine.js) và đúng bộ giải (`resolveMotif`). Ảnh lấy từ map
 * `images` của section — cả ảnh vừa thêm chưa Lưu — nên chỉnh tốc độ, mật độ là thấy ngay.
 */
export function MotifPreview({ fields, working, ctx, images }) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [dark, setDark] = useState(false)

  const item = fromWorking(fields, working, 'vi')
  const shapes = (ctx.vi?.shapes ?? []).map((shape) => ({ ...shape, image: images?.[shape.id] ?? null }))
  const resolved = resolveMotif(PREVIEW_ID, { shapes, items: [{ ...item, id: PREVIEW_ID }] }, ACCENT)

  const shapeName = (ref) =>
    ref?.startsWith(IMAGE_PREFIX)
      ? (shapes.find((shape) => `${IMAGE_PREFIX}${shape.id}` === ref)?.name ?? ref)
      : (GLYPH_LABELS[ref] ?? ref)
  const missing = [...new Set([...(item.particles ?? []).map((particle) => particle.shape), item.ornamentShape])].filter(
    (ref) => ref?.startsWith(IMAGE_PREFIX) && !lookupShape(ref, shapes),
  )
  const totalWeight = (item.particles ?? []).reduce((sum, particle) => sum + (Number(particle.weight) || 0), 0) || 1

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-400">Xem trước</p>
        <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-theme-xs dark:bg-gray-800" role="group" aria-label="Nền xem trước">
          {[
            [false, 'Nền sáng'],
            [true, 'Nền tối'],
          ].map(([value, label]) => (
            <button
              key={label}
              type="button"
              aria-pressed={dark === value}
              onClick={() => setDark(value)}
              className={`rounded-md px-3 py-1 font-medium ${dark === value ? 'bg-white text-gray-900 shadow-theme-xs dark:bg-gray-700 dark:text-white' : 'text-gray-500'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 pt-6 dark:border-gray-800">
        <span
          className="relative inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium"
          style={{ background: DEFAULT_SEASON_COLORS.colorPrimary, color: '#ffffff' }}
        >
          Đăng ký ngay
          <MotifOrnament pieces={resolved?.ornament} />
        </span>
        <span className="text-theme-xs text-gray-500">{resolved?.ornament?.length ? 'Vật trang trí trên nút chính.' : 'Chưa chọn vật trang trí trên nút.'}</span>
      </div>

      {resolved?.particles ? (
        reduceMotion ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800">
            <span className="text-theme-xs text-gray-500">Máy đang bật giảm chuyển động — chỉ xem hình tĩnh:</span>
            {resolved.particles.kinds.map((kind, i) => (
              <MotifShape key={i} shape={kind} size={kind.size[1]} color={ACCENT} />
            ))}
          </div>
        ) : (
          <LiveFall configKey={JSON.stringify(resolved.particles)} dark={dark} />
        )
      ) : (
        <p className="rounded-xl border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-700">
          Thêm ít nhất một loại hạt (có hình hợp lệ) để xem hạt rơi.
        </p>
      )}

      {(item.particles ?? []).length > 0 && (
        <p className="mt-2 text-theme-xs text-gray-500 dark:text-gray-400">
          Trộn:{' '}
          {(item.particles ?? [])
            .map((particle) => `${shapeName(particle.shape)} ${Math.round(((Number(particle.weight) || 0) / totalWeight) * 100)}%`)
            .join(' · ')}
          . Khung xem trước nhỏ nên ít hạt hơn trên trang thật.
        </p>
      )}
      {missing.length > 0 && (
        <p className="mt-1 flex items-center gap-1.5 text-theme-xs text-warning-600 dark:text-warning-500">
          <Icon name="alert" size={14} />
          Ảnh chưa gắn file: {missing.map(shapeName).join(', ')} — gắn ảnh ở danh sách "Ảnh họa tiết", nếu không hình đó không hiện.
        </p>
      )}
    </div>
  )
}
