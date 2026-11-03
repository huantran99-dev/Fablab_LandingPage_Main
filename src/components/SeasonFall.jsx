import { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useT } from '../i18n/context'
import { startFall } from '../lib/fallEngine'
import { MotifShape } from '../lib/MotifArt'
import { confettiColors, toggleKind } from '../lib/motifs'
import { useSeasonMotif } from '../lib/season'

/**
 * Hạt rơi của sự kiện mùa (tuyết, hoa mai, pháo giấy… hoặc họa tiết admin tự tạo từ ảnh
 * PNG) trên CẢ trang, thưa, kèm nút bật/tắt ở góc dưới-trái.
 *
 * Nạp bằng `lazy()` (App.jsx) và chỉ khi sự kiện đang chạy có `motif` + `fall`: ngày
 * thường người xem không tải byte nào của file này.
 *
 * - Một `<canvas>` cố định, `pointer-events: none` — bấm xuyên qua được, không che nút.
 *   Nằm dưới navbar (z-50); popup / form ở top layer nên luôn đứng trên hạt.
 * - Hình và cách rơi đến từ `resolveMotif` (src/lib/motifs.js), bộ máy vẽ ở
 *   src/lib/fallEngine.js — dùng chung với khung xem trước của dashboard.
 * - KHÔNG chạy khi giảm chuyển động (đọc SỐNG, bật giữa chừng cũng tắt — như carousel) hay
 *   khi bật tiết kiệm dữ liệu; lúc đó nút tắt cũng ẩn.
 * - Người xem tắt thì nhớ trong localStorage (bọc try/catch — chế độ riêng tư ném lỗi).
 */

const STORAGE_KEY = 'fablab-season-fall'

function readEnabled() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

function writeEnabled(on) {
  try {
    if (on) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, 'off')
  } catch {
    /* không ghi được thì chỉ tắt trong lượt xem này */
  }
}

const measureWindow = () => ({ width: window.innerWidth, height: window.innerHeight })

function FallCanvas({ config, accent }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return undefined
    const fall = startFall(ref.current, config, { accent, measure: measureWindow })
    window.addEventListener('resize', fall.resize)
    return () => {
      fall.stop()
      window.removeEventListener('resize', fall.resize)
    }
  }, [config, accent])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 h-full w-full" />
}

export default function SeasonFall({ season }) {
  const t = useT()
  const motif = useSeasonMotif()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [on, setOn] = useState(readEnabled)
  const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData === true

  const config = motif?.particles
  if (reduceMotion || saveData || !config) return null

  const labels = t.seasonal ?? {}
  const label = on ? (labels.effectOff ?? labels.close) : (labels.effectOn ?? labels.close)

  return (
    <>
      {on && <FallCanvas config={config} accent={season.colorAccent} />}
      <button
        type="button"
        onClick={() => {
          writeEnabled(!on)
          setOn(!on)
        }}
        aria-label={label}
        title={label}
        className="fixed bottom-4 left-4 z-40 inline-flex size-11 cursor-pointer items-center justify-center rounded-pill border border-ash bg-white/90 backdrop-blur-sm transition-colors duration-200 ease-[var(--ease-out-soft)] hover:border-ink"
      >
        <span className="relative inline-flex">
          <MotifShape
            shape={toggleKind(config)}
            size={22}
            color={confettiColors(season.colorAccent)[0]}
            style={on ? undefined : { opacity: 0.4 }}
          />
          {/* Gạch chéo khi đang tắt — trạng thái nhìn thấy được, không chỉ nằm trong nhãn. */}
          {!on && <span aria-hidden="true" className="absolute top-1/2 left-1/2 h-0.5 w-7 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-pill bg-ink" />}
        </span>
      </button>
    </>
  )
}
