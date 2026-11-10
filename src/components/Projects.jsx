import { useEffect, useRef } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '../assets/icons/Icons'
import { useSlideshow } from '../hooks/useSlideshow'
import { useT } from '../i18n/context'
import { opposite } from '../lib/pageSections'
import { Pill } from './ui/Pill'
import { Reveal } from './ui/Reveal'
import { RoundButton } from './ui/RoundButton'
import { Section, SectionHeading } from './ui/Section'

/** Sắc nhãn theo trạng thái. Trạng thái mới thêm từ dashboard rơi về `outline`. */
const STATUS_TONES = {
  ongoing: 'signal',
  done: 'outline',
}
/** Góc nghiêng tối đa (độ) của ảnh khi rê chuột trên khung hình. */
const TILT = 6

const pad = (value) => String(value).padStart(2, '0')

/**
 * Nghiêng ảnh theo chuột — chỉ chuột (chạm thì không), tắt khi giảm chuyển động. Ghi biến CSS
 * thẳng lên phần tử, không qua state: rê chuột không làm cả section vẽ lại mỗi khung hình.
 */
function tiltHandlers() {
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return {
    onPointerMove: (event) => {
      if (event.pointerType !== 'mouse' || reduced()) return
      const box = event.currentTarget.getBoundingClientRect()
      const x = (event.clientX - box.left) / box.width - 0.5
      const y = (event.clientY - box.top) / box.height - 0.5
      event.currentTarget.style.setProperty('--tilt-x', `${(-y * TILT * 2).toFixed(2)}deg`)
      event.currentTarget.style.setProperty('--tilt-y', `${(x * TILT * 2).toFixed(2)}deg`)
    },
    onPointerLeave: (event) => {
      event.currentTarget.style.setProperty('--tilt-x', '0deg')
      event.currentTarget.style.setProperty('--tilt-y', '0deg')
    },
  }
}

/** Một slide của sân khấu: khung hình (trái / trên) + chữ (phải / dưới). */
function ProjectSlide({ project, projects, index, total, active }) {
  // Vắng `status` là có chủ đích (trang gốc không ghi). Có mà tra hụt thì bỏ nhãn — một
  // viên thuốc rỗng trông như lỗi.
  const statusLabel = project.status ? projects.statuses?.[project.status] : null
  const image = project.image
  // Chuyển cảnh: slide đang chọn ở vị trí 0; slide khác lệch đi và mờ hẳn. Giá trị tuỳ ý phải
  // nêu `translate` / `scale` — Tailwind v4 tách chúng khỏi `transform` (bẫy 2 trong CLAUDE.md).
  const motion = 'transition-[opacity,translate,scale] duration-700 ease-[var(--ease-out-soft)] motion-reduce:transition-none'
  const textIn = active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} / ${total}`}
      aria-hidden={!active}
      inert={!active}
      className={`col-start-1 row-start-1 grid transition-opacity duration-500 motion-reduce:transition-none lg:grid-cols-[1.15fr_1fr] ${
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {/* Khung hình: nền pastel + vệt sáng + số thứ tự khổng lồ phía sau ảnh. */}
      <div
        className="relative isolate flex min-h-64 items-center justify-center overflow-hidden bg-wash px-6 py-10 sm:min-h-80 lg:min-h-[440px] lg:px-10"
        style={{ '--tilt-x': '0deg', '--tilt-y': '0deg' }}
        {...tiltHandlers()}
      >
        <span
          className="pointer-events-none absolute -top-16 -left-10 -z-10 size-72 rounded-pill bg-signal/20 blur-3xl"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -right-12 -bottom-20 -z-10 size-64 rounded-pill bg-orchid/20 blur-3xl"
          aria-hidden="true"
        />
        <span
          className={`pointer-events-none absolute right-5 bottom-3 -z-10 text-[clamp(110px,22vw,240px)] leading-none font-semibold text-ink/5 tabular-nums select-none ${motion} ${
            active ? 'translate-x-0' : '-translate-x-12'
          }`}
          aria-hidden="true"
        >
          {pad(index + 1)}
        </span>

        {image && (
          <div className={`${motion} ${active ? 'translate-x-0 scale-100' : 'translate-x-12 scale-95'}`}>
            <img
              src={image.url}
              width={image.width}
              height={image.height}
              alt={projects.imageAlt.replace('{title}', project.title)}
              loading="lazy"
              decoding="async"
              draggable={false}
              // `max-h` + `w-auto`: ảnh không bao giờ phóng quá cỡ thật (ảnh gốc từ ~230px).
              // Nghiêng theo chuột đi qua `transform` (biến CSS), độc lập với `translate` /
              // `scale` của chuyển cảnh ở lớp bọc.
              className="max-h-56 w-auto max-w-full rounded-image-sm object-contain drop-shadow-[0_24px_32px_rgba(18,50,99,0.22)] transition-transform duration-300 ease-out motion-reduce:transition-none sm:max-h-72 lg:max-h-[360px]"
              style={{ transform: 'perspective(900px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))' }}
            />
          </div>
        )}
      </div>

      {/* Chữ: đếm, nhãn, tên, mô tả ĐẦY ĐỦ — không cắt dòng. */}
      {/* `pb-24` / `lg:pb-28`: chừa chỗ cho hàng nút ← → đặt tuyệt đối ở đáy thẻ. */}
      <div className="flex flex-col justify-center gap-5 px-6 pt-7 pb-24 sm:px-8 lg:px-12 lg:pt-12 lg:pb-28">
        <p
          className={`text-caption font-medium tracking-[0.2em] text-steel tabular-nums ${motion} ${textIn}`}
          aria-hidden="true"
        >
          <span className="text-ink">{pad(index + 1)}</span> / {pad(total)}
        </p>
        {statusLabel && (
          <div className={`${motion} ${textIn} delay-75`}>
            <Pill tone={STATUS_TONES[project.status] ?? 'outline'}>{statusLabel}</Pill>
          </div>
        )}
        <h3 className={`text-heading-lg text-ink lg:text-display ${motion} ${textIn} delay-100`}>{project.title}</h3>
        <p className={`text-subheading text-graphite ${motion} ${textIn} delay-150`}>{project.description}</p>
      </div>
    </div>
  )
}

/**
 * Dự án của FabLab — "sân khấu trưng bày" (từ 2026-11-10, thay vòng xoay 3D): một dự án mỗi
 * lúc trên một thẻ lớn, ảnh nổi trên nền phát sáng, mô tả đầy đủ, dải ảnh nhỏ bên dưới.
 *
 * Bộ não là `useSlideshow` của section Hoạt động (phím ← →, vuốt / kéo, nuốt click sau khi
 * kéo); vùng nhận cử chỉ mang `touch-pan-y` để trình duyệt giữ cuộn dọc và trả cử chỉ ngang
 * cho mình. KHÔNG tự chạy (không vẽ vạch tiến trình nên hook không tự chuyển) — vì vậy không
 * cần nút dừng.
 *
 * Các slide chồng cùng một ô grid: thẻ cao bằng slide cao nhất, đổi dự án không nhảy chiều
 * cao. Slide không chọn là `inert` + `aria-hidden`.
 *
 * `side`: chiều trượt của tiêu đề, App tính theo các khối đang hiện (pageSections.js).
 */
export function Projects({ side = 'right' }) {
  const t = useT()
  const projects = t.projects
  const items = projects?.items ?? []
  const total = items.length
  const { current, go, goTo, reduced, regionProps } = useSlideshow(total)
  const stripRef = useRef(null)

  // Dải ảnh nhỏ: đưa nút đang chọn vào giữa dải. `scrollTo` của CHÍNH dải — `scrollIntoView`
  // sẽ kéo cả trang tới section này mỗi lần đổi dự án.
  useEffect(() => {
    const strip = stripRef.current
    const button = strip?.querySelector('[aria-current="true"]')
    if (!strip || !button || strip.scrollWidth <= strip.clientWidth) return
    strip.scrollTo({
      left: button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }, [current, reduced])

  // Section mới hơn snapshot / database cũ: không có dữ liệu thì không dựng gì.
  if (total === 0) return null

  // Thiếu nhãn (bản lịch sử cũ, database chưa áp migration 009) thì rơi về tiêu đề section —
  // vẫn đọc được, trang không sập.
  const label = (key) => projects[key] ?? projects.title
  const multiple = total > 1
  const active = items[current]

  return (
    <Section id="projects">
      <SectionHeading
        eyebrow={projects.eyebrow}
        title={projects.title}
        description={projects.description}
        align="center"
        from={side}
      />

      <Reveal from={opposite(side)} className="mt-14">
        <div
          {...regionProps}
          role="region"
          aria-roledescription="carousel"
          aria-label={projects.title}
          className="relative grid touch-pan-y overflow-hidden rounded-card-sm bg-white shadow-ambient outline-none select-none focus-visible:ring-2 focus-visible:ring-signal md:rounded-card"
        >
          {items.map((project, index) => (
            <ProjectSlide
              key={project.id}
              project={project}
              projects={projects}
              index={index}
              total={total}
              active={index === current}
            />
          ))}

          {/* Nút ← → và vạch tiến độ: đứng ngoài các slide (không mờ theo), góc dưới cột chữ. */}
          {multiple && (
            <div className="absolute right-6 bottom-6 left-6 flex items-center gap-4 sm:right-8 sm:left-8 lg:left-[calc(53.5%+3rem)] lg:right-12">
              <RoundButton label={label('previous')} onClick={() => go(-1)}>
                <ArrowLeftIcon />
              </RoundButton>
              <RoundButton label={label('next')} onClick={() => go(1)}>
                <ArrowRightIcon />
              </RoundButton>
              <span className="relative h-1 flex-1 overflow-hidden rounded-pill bg-ash/70" aria-hidden="true">
                <span
                  className="absolute inset-y-0 left-0 rounded-pill bg-signal transition-[width] duration-500 ease-[var(--ease-out-soft)] motion-reduce:transition-none"
                  style={{ width: `${((current + 1) / total) * 100}%` }}
                />
              </span>
            </div>
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {current + 1} / {total} — {active.title}
        </p>

        {/* Dải ảnh nhỏ: chọn thẳng một dự án. Cuộn ngang được khi không đủ chỗ. */}
        {multiple && (
          <div ref={stripRef} className="-mx-4 mt-6 overflow-x-auto px-4 md:mx-0 md:px-0">
            <div className="mx-auto flex w-max gap-3 py-2">
              {items.map((project, index) => {
                const selected = index === current
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`${label('goTo')} ${index + 1}: ${project.title}`}
                    aria-current={selected ? 'true' : undefined}
                    className={`flex w-28 shrink-0 cursor-pointer flex-col gap-2 rounded-image-sm border bg-white p-2 text-left transition-[translate,border-color,opacity] duration-300 ease-[var(--ease-out-soft)] motion-reduce:transition-none sm:w-36 ${
                      selected ? '-translate-y-1 border-signal' : 'border-ash/70 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className="flex h-16 items-center justify-center overflow-hidden rounded-[10px] bg-wash sm:h-20">
                      {project.image && (
                        <img
                          src={project.image.url}
                          width={project.image.width}
                          height={project.image.height}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          className="max-h-full w-auto object-contain"
                        />
                      )}
                    </span>
                    <span className={`line-clamp-2 min-h-[2lh] text-caption ${selected ? 'font-medium text-ink' : 'text-graphite'}`}>
                      {project.title}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </Reveal>
    </Section>
  )
}
