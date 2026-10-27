import { useRef, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '../assets/icons/Icons'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useT } from '../i18n/context'
import { REDUCED_MOTION } from '../lib/motion'
import { Pill } from './ui/Pill'
import { Reveal } from './ui/Reveal'
import { RoundButton } from './ui/RoundButton'
import { Section, SectionHeading } from './ui/Section'

/** Sắc nhãn theo trạng thái. Trạng thái mới thêm từ dashboard rơi về `outline`. */
const STATUS_TONES = {
  ongoing: 'signal',
  done: 'outline',
}

/** Bề rộng thẻ trong vòng (px). Bán kính vòng tính từ số này và số dự án. */
const CARD_WIDTH = 280
/** Khe giữa hai thẻ kề nhau trên vòng (px). */
const CARD_GAP = 32
/** Kéo/vuốt quá ngưỡng này (px) mới tính là xoay — dưới ngưỡng là một cú bấm. */
const DRAG_THRESHOLD = 40
/** Độ mờ theo khoảng cách tới thẻ phía trước: 0, 1, 2, từ 3 trở đi. */
const DEPTH_OPACITY = [1, 0.7, 0.4, 0.15]

const mod = (value, total) => ((value % total) + total) % total

/**
 * Con trỏ của vòng 3D.
 *
 * `turn` là số nguyên KHÔNG quấn vòng: góc xoay của vòng là `-turn·θ`, nên từ dự án
 * cuối sang dự án đầu là xoay tiếp MỘT nấc. Dùng chỉ số đã quấn vòng (như
 * `useCarousel`) thì góc nhảy từ 315° về 0° và cả vòng quay ngược gần một vòng.
 */
function useRing(total) {
  const [turn, setTurn] = useState(0)
  const current = total > 0 ? mod(turn, total) : 0

  return {
    turn,
    current,
    go: (step) => setTurn((value) => value + step),
    // Đi đường ngắn nhất quanh vòng tới thẻ `index`.
    goTo: (index) =>
      setTurn((value) => {
        let delta = index - mod(value, total)
        if (delta > total / 2) delta -= total
        if (delta < -total / 2) delta += total
        return value + delta
      }),
  }
}

/** Một thẻ dự án — dùng chung cho vòng 3D và hàng trượt ngang. */
function ProjectCard({ project, projects, className = '', style, front = true, ...props }) {
  // Vắng `status` là có chủ đích (trang gốc không ghi). Có mà tra hụt thì cũng bỏ
  // nhãn — một viên thuốc rỗng trông như lỗi.
  const statusLabel = project.status ? projects.statuses?.[project.status] : null
  const image = project.image

  return (
    <article
      className={`flex flex-col gap-4 rounded-card-sm bg-white p-5 ${front ? 'shadow-ambient' : ''} ${className}`}
      style={style}
      {...props}
    >
      {/* Ảnh tách nền, tỉ lệ từ dọc 0.4 tới ngang 2.3 — `object-contain` trong khung
          trắng cố định, không cắt mất mô hình nào. */}
      {image && (
        <div className="flex h-44 shrink-0 items-center justify-center rounded-image-sm border border-ash/60 bg-white p-4">
          <img
            src={image.url}
            width={image.width}
            height={image.height}
            alt={projects.imageAlt.replace('{title}', project.title)}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="max-h-full w-auto object-contain"
          />
        </div>
      )}

      {statusLabel && (
        <Pill tone={STATUS_TONES[project.status] ?? 'outline'} className="self-start">
          {statusLabel}
        </Pill>
      )}

      <h3 className="text-heading-sm text-ink">{project.title}</h3>
      <p className="line-clamp-3 text-body-sm text-graphite">{project.description}</p>
    </article>
  )
}

/**
 * Vòng trụ 3D bằng CSS thuần: thẻ `i` quay `i·θ` quanh trục dọc rồi đẩy ra bán kính R;
 * cả vòng lùi `-R` và quay `-turn·θ` để thẻ đang chọn đứng thẳng phía trước.
 *
 * R tính từ số dự án — thêm/bớt dự án từ dashboard là vòng tự giãn, không chồng thẻ.
 *
 * Phần tử bọc ngoài là `Reveal` (đặt `transform` lên CHÍNH nó); `perspective` và
 * `preserve-3d` nằm ở các lớp bên trong nên không bị làm phẳng. KHÔNG dùng
 * RevealGroup ở đây: rule `[data-reveal-group] > *` sẽ ghi đè transform của thẻ.
 */
function ProjectRing({ projects }) {
  const items = projects.items
  const total = items.length
  const { turn, current, go, goTo } = useRing(total)

  const step = 360 / total
  const radius = Math.round((CARD_WIDTH / 2 + CARD_GAP / 2) / Math.tan(Math.PI / total))

  // Kéo / vuốt. Không dùng pointer capture: capture làm cú bấm rơi vào khung thay vì
  // thẻ, và bấm thẻ bên cạnh để xoay tới nó sẽ không còn chạy.
  const drag = useRef({ x: null, moved: false })
  const onPointerDown = (event) => {
    drag.current = { x: event.clientX, moved: false }
  }
  const onPointerUp = (event) => {
    if (drag.current.x === null) return
    const dx = event.clientX - drag.current.x
    drag.current.x = null
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      drag.current.moved = true
      go(dx < 0 ? 1 : -1)
    }
  }
  // Vừa kéo xong thì nuốt cú click đi kèm, kẻo vừa xoay vừa chọn thẻ.
  const onClickCapture = (event) => {
    if (drag.current.moved) {
      event.stopPropagation()
      drag.current.moved = false
    }
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      go(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      go(1)
    }
  }

  // Thiếu nhãn (bản lịch sử cũ, database chưa áp migration 009) thì rơi về tiêu đề
  // section — vẫn đọc được, trang không sập.
  const label = (key) => projects[key] ?? projects.title
  const active = items[current]

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-full items-center gap-5">
        <RoundButton label={label('previous')} onClick={() => go(-1)}>
          <ArrowLeftIcon />
        </RoundButton>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label={projects.title}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            drag.current.x = null
          }}
          onClickCapture={onClickCapture}
          className="relative h-[480px] flex-1 cursor-grab touch-pan-y select-none overflow-hidden rounded-card-sm outline-none focus-visible:ring-2 focus-visible:ring-signal active:cursor-grabbing"
          style={{ perspective: '1400px' }}
        >
          <div
            className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-soft)]"
            style={{
              transformStyle: 'preserve-3d',
              transform: `translateZ(${-radius}px) rotateY(${-turn * step}deg)`,
            }}
          >
            {items.map((project, index) => {
              const distance = Math.min(Math.abs(index - current), total - Math.abs(index - current))
              const front = distance === 0
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  projects={projects}
                  front={front}
                  className={`absolute top-[30px] h-[420px] transition-[opacity,box-shadow] duration-700 ease-[var(--ease-out-soft)] ${front ? '' : 'cursor-pointer'}`}
                  style={{
                    width: CARD_WIDTH,
                    left: `calc(50% - ${CARD_WIDTH / 2}px)`,
                    transform: `rotateY(${index * step}deg) translateZ(${radius}px)`,
                    backfaceVisibility: 'hidden',
                    opacity: DEPTH_OPACITY[Math.min(distance, DEPTH_OPACITY.length - 1)],
                  }}
                  // Thẻ không ở phía trước: chỉ để nhìn và bấm xoay tới. Trình đọc màn
                  // hình đọc thẻ phía trước qua vùng aria-live bên dưới.
                  {...(front ? {} : { 'aria-hidden': true, onClick: () => goTo(index) })}
                />
              )
            })}
          </div>
        </div>

        <RoundButton label={label('next')} onClick={() => go(1)}>
          <ArrowRightIcon />
        </RoundButton>
      </div>

      <p className="sr-only" aria-live="polite">
        {current + 1} / {total} — {active.title}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((project, index) => (
          <button
            key={project.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`${label('goTo')} ${index + 1}`}
            aria-current={index === current ? 'true' : undefined}
            className={[
              'h-2 cursor-pointer rounded-pill transition-all duration-300 ease-[var(--ease-out-soft)]',
              index === current ? 'w-7 bg-signal' : 'w-2 bg-ash hover:bg-steel',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Hàng trượt ngang phẳng — cho màn hẹp (vòng 3D cần chỗ) và cho người đã tắt chuyển
 * động (vòng xoay là chuyển động lớn). Cuộn/vuốt tự nhiên, dừng đúng từng thẻ.
 */
function ProjectStrip({ projects }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
      {projects.items.map((project) => (
        // Viền thay cho bóng đổ: khung cuộn ngang buộc cả chiều dọc thành vùng cắt,
        // nên bóng đổ bị xén thành một dải xám mép thẳng phía sau hàng thẻ.
        <ProjectCard
          key={project.id}
          project={project}
          projects={projects}
          front={false}
          className="w-[78%] max-w-[320px] shrink-0 snap-center border border-ash/60"
        />
      ))}
    </div>
  )
}

/** Dự án của FabLab — vòng xoay 3D trên màn rộng, hàng trượt ngang trên màn hẹp. */
export function Projects() {
  const t = useT()
  const projects = t.projects
  const wide = useMediaQuery('(min-width: 768px)')

  // Section mới hơn snapshot / database cũ: không có dữ liệu thì không dựng gì.
  if (!projects?.items?.length) return null

  // Vòng cần ít nhất 3 thẻ mới thành hình trụ (2 thẻ: tan(π/2) vô cực, 1 thẻ: chia 0).
  const ring = wide && !REDUCED_MOTION && projects.items.length >= 3

  return (
    <Section id="projects">
      <SectionHeading
        eyebrow={projects.eyebrow}
        title={projects.title}
        description={projects.description}
        align="center"
        from="right"
      />

      <Reveal from="left" className="mt-14">
        {ring ? <ProjectRing projects={projects} /> : <ProjectStrip projects={projects} />}
      </Reveal>
    </Section>
  )
}
