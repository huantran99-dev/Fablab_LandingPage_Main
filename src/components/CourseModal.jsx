import { useEffect, useRef } from 'react'
import { CourseIcon } from '../assets/icons/CourseIcons'
import { ArrowRightIcon, CloseIcon } from '../assets/icons/Icons'
import { COURSE_IMAGE_SIZE, COURSE_IMAGES } from '../assets/images'
import { useT } from '../i18n/context'
import { Button } from './ui/Button'
import { Pill } from './ui/Pill'

const TITLE_ID = 'course-modal-title'

/** Một mục nội dung dạng danh sách — không render gì nếu khóa học không có mục đó. */
function DetailList({ title, items }) {
  if (!items?.length) return null

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-heading-sm text-ink">{title}</h3>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-body-sm text-graphite">
            <span className="mt-2 size-1.5 shrink-0 rounded-pill bg-signal" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Nội dung khóa học: đánh số thứ tự vì đây là trình tự các buổi học. */
function Curriculum({ title, items }) {
  if (!items?.length) return null

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-heading-sm text-ink">{title}</h3>
      <ol className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li
            key={item}
            className="flex gap-3 rounded-image-sm bg-wash px-4 py-3 text-body-sm text-graphite"
          >
            <span className="font-display font-bold text-signal">{index + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

/**
 * Popup chi tiết khóa học.
 *
 * Dùng `<dialog>` gốc thay vì tự dựng: trình duyệt lo sẵn bẫy focus, phím Esc,
 * trả focus về nút vừa bấm và làm phần nền phía sau bất hoạt (`inert`). Tự viết
 * lại những thứ đó vừa dài vừa dễ sai về trợ năng.
 *
 * `course` là `null` khi đóng. Component luôn được mount để `<dialog>` giữ được
 * trạng thái và animation đóng/mở của chính nó.
 */
export function CourseModal({ course, onClose }) {
  const ref = useRef(null)
  const open = Boolean(course)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  // Khóa cuộn nền khi popup mở. Đặt trên <html> chứ KHÔNG đặt trên <body>:
  // body đang có `overflow-x: clip` để chặn tràn ngang lúc section trượt, ghi đè
  // lên đó sẽ biến body thành scroll container và làm chết navbar sticky.
  useEffect(() => {
    if (!open) return

    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = previous
    }
  }, [open])

  const t = useT()
  const detail = course ? t.courses.details[course.id] : null
  const labels = t.courses.modal

  // Bấm ra vùng nền: sự kiện click trên ::backdrop có target chính là <dialog>,
  // còn click vào ruột popup thì target là phần tử con — nên so sánh là đủ.
  const handleClick = (event) => {
    if (event.target === ref.current) onClose()
  }

  const hasDetail =
    detail && !detail.viOnly &&
    Boolean(detail.overview?.length || detail.knowledge?.length || detail.skills?.length || detail.curriculum?.length)

  return (
    <dialog ref={ref} onClose={onClose} onClick={handleClick} aria-labelledby={TITLE_ID}>
      {/* Chỉ dựng ruột popup khi có khóa học: tránh giữ nội dung cũ lởn vởn trong
          DOM sau khi đóng, và cũng để ảnh của khóa vừa đóng không còn được tải. */}
      {course && (
        <div className="flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-card-sm bg-white shadow-ambient-lift">
          <div className="relative shrink-0">
            <img
              src={COURSE_IMAGES[course.id]}
              width={COURSE_IMAGE_SIZE.width}
              height={COURSE_IMAGE_SIZE.height}
              alt={t.courses.imageAlt.replace('{title}', course.title)}
              className="block h-36 w-full object-cover md:h-44"
            />

            <button
              type="button"
              onClick={onClose}
              aria-label={labels.close}
              className="absolute top-4 right-4 inline-flex size-10 cursor-pointer items-center justify-center rounded-pill bg-white text-ink shadow-ambient transition-colors duration-200 ease-[var(--ease-out-soft)] hover:bg-wash"
            >
              <CloseIcon />
            </button>

            <span className="absolute bottom-3 left-4 inline-flex size-11 items-center justify-center rounded-pill bg-white text-signal shadow-ambient">
              <CourseIcon id={course.id} size={24} />
            </span>
          </div>

          {/* Vùng cuộn: chỉ phần ruột cuộn, ảnh và nút đăng ký luôn nhìn thấy. */}
          <div className="flex flex-col gap-8 overflow-y-auto px-6 py-6 md:px-8">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone="wash">{t.courses.levels[course.level]}</Pill>
                <Pill tone="outline">{course.duration}</Pill>
                <Pill tone="outline">
                  {t.courses.ageLabel} {course.age}
                </Pill>
              </div>

              <h2 id={TITLE_ID} className="text-heading-lg text-ink">
                {course.title}
              </h2>

              <p className="text-subheading text-graphite">{course.description}</p>

              {detail?.audience && (
                <p className="text-body-sm text-steel">
                  <span className="font-medium text-graphite">{labels.audience}:</span>{' '}
                  {detail.audience}
                </p>
              )}
            </header>

            {hasDetail ? (
              <>
                <DetailList title={labels.overview} items={detail.overview} />
                <DetailList title={labels.knowledge} items={detail.knowledge} />
                <DetailList title={labels.skills} items={detail.skills} />
                <Curriculum title={labels.curriculum} items={detail.curriculum} />
              </>
            ) : (
              // Không bịa nội dung cho khóa chưa có dữ liệu — nói thẳng và đưa
              // đường dẫn tới trang gốc của trường.
              <p className="rounded-image-sm bg-butter px-5 py-4 text-body-sm text-graphite">
                {detail?.viOnly ? labels.viOnly : labels.empty}
              </p>
            )}

            {detail?.sourceUrl && (
              <a
                href={detail.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 self-start text-body-sm font-medium text-signal transition-[gap] duration-200 ease-[var(--ease-out-soft)] hover:gap-3"
              >
                {labels.source}
                <ArrowRightIcon size={16} />
              </a>
            )}
          </div>

          <div className="shrink-0 border-t border-ash/60 px-6 py-4 md:px-8">
            <Button href="#register" size="lg" className="w-full justify-center" onClick={onClose}>
              {labels.register}
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      )}
    </dialog>
  )
}
