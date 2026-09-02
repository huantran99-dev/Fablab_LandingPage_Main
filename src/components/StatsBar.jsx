import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { useLanguage } from '../i18n/context'
import { REDUCED_MOTION } from '../lib/motion'

const DURATION_MS = 1400

/** Giảm tốc dần về cuối để con số "hạ cánh" mềm thay vì dừng đột ngột. */
function easeOutCubic(progress) {
  return 1 - (1 - progress) ** 3
}

function CountUp({ value, active, locale }) {
  const [counted, setCounted] = useState(0)

  useEffect(() => {
    if (!active || REDUCED_MOTION) return

    let frame
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / DURATION_MS, 1)
      setCounted(Math.round(easeOutCubic(progress) * value))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, value])

  // Derive lúc render thay vì setState trong effect: khi tắt hiệu ứng thì hiện
  // thẳng số cuối, còn lại để vòng lặp rAF ở trên đẩy dần lên.
  const display = REDUCED_MOTION ? value : counted

  return <>{display.toLocaleString(locale)}</>
}

export function StatsBar() {
  const { t, lang } = useLanguage()
  const ref = useRef(null)
  // `once: false` để khối trượt ra rồi trượt vào lại, và cũng chính nhờ vậy mà
  // `active` của CountUp lật false→true khiến bốn con số đếm lại từ 0 mỗi lần.
  const inView = useInView(ref, { once: false, enabled: !REDUCED_MOTION })

  return (
    <div ref={ref} className="container-page">
      {/* Dùng lại chính `inView` đang điều khiển việc đếm số, nên bốn ô hiện lên
          khớp đúng nhịp với lúc con số bắt đầu chạy — và không tốn thêm một
          IntersectionObserver nào. */}
      <dl
        data-reveal-group={REDUCED_MOTION || inView ? 'shown' : 'hidden'}
        data-reveal-from="up"
        className="grid grid-cols-2 gap-x-6 gap-y-10 rounded-card-sm md:rounded-card border border-ash/60 px-6 py-10 md:px-12 md:py-12 lg:grid-cols-4"
      >
        {t.stats.items.map((stat) => (
          <div key={stat.id} className="flex flex-col items-center gap-2 text-center">
            <dd className="font-display text-display font-bold tracking-[-0.03em] text-ink">
              <CountUp value={stat.value} active={inView} locale={lang === 'vi' ? 'vi-VN' : 'en-US'} />
              <span className="text-signal">{stat.suffix}</span>
            </dd>
            <dt className="text-caption text-steel max-w-[160px]">{stat.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  )
}
