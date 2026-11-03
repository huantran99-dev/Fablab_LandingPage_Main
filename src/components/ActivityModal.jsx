import { useEffect, useRef } from 'react'
import { ArrowRightIcon, CloseIcon } from '../assets/icons/Icons'
import { useScrollLock } from '../hooks/useScrollLock'
import { useT } from '../i18n/context'
import { tieLastWords } from '../lib/typography'
import { Button } from './ui/Button'
import { Pill } from './ui/Pill'

const TITLE_ID = 'activity-modal-title'

/**
 * Popup "Xem chi tiết" của banner Cuộc thi.
 *
 * Cùng khung với CourseModal và cùng lý do: `<dialog>` gốc lo sẵn bẫy focus, Esc, trả focus
 * về nút vừa bấm và `inert` cho nền. `item` là `null` khi đóng; ruột chỉ dựng khi mở.
 *
 * Poster `object-contain` trên nền `wash` — poster dọc, `object-cover` sẽ cắt mất tiêu đề.
 *
 * `details` là chữ admin viết, đoạn cách nhau bằng dòng trống. contentStore chỉ nối hai chữ
 * cuối của CẢ chuỗi bằng U+00A0, nên mỗi đoạn được nối lại ở đây. Chưa có `details` thì
 * popup chỉ có poster + mô tả ngắn — không bịa thêm.
 */
export function ActivityModal({ item, onClose, onRegister }) {
  const ref = useRef(null)
  const open = Boolean(item)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  // Khoá cuộn trên <html>, có bộ đếm: nút đăng ký đóng popup này và mở form trong cùng lượt.
  useScrollLock(open)

  const t = useT()
  const labels = t.activities

  // Bấm ra vùng nền: click trên ::backdrop có target chính là <dialog>.
  const handleClick = (event) => {
    if (event.target === ref.current) onClose()
  }

  const paragraphs = (item?.details ?? '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => tieLastWords(paragraph))

  return (
    <dialog ref={ref} onClose={onClose} onClick={handleClick} aria-labelledby={TITLE_ID}>
      {item && (
        <div className="flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-card-sm bg-white shadow-ambient-lift">
          <div className="relative flex shrink-0 items-center justify-center bg-wash px-6 pt-6 pb-4 md:px-8">
            {item.image && (
              <img
                src={item.image.url}
                width={item.image.width}
                height={item.image.height}
                alt={labels.imageAlt.replace('{title}', item.title)}
                className="max-h-[36vh] w-auto rounded-image-sm object-contain"
              />
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label={labels.closeDetails ?? t.courses.modal.close}
              className="absolute top-4 right-4 inline-flex size-10 cursor-pointer items-center justify-center rounded-pill bg-white text-ink shadow-ambient transition-colors duration-200 ease-[var(--ease-out-soft)] hover:bg-wash"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Vùng cuộn: chỉ phần ruột cuộn, poster và nút đăng ký luôn nhìn thấy. */}
          <div className="flex flex-col gap-5 overflow-y-auto px-6 py-6 md:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="signal">{labels.kinds[item.kind] ?? item.kind}</Pill>
              {item.date && <Pill tone="outline">{item.date}</Pill>}
            </div>

            <h2 id={TITLE_ID} className="text-heading-lg text-ink">
              {item.title}
            </h2>

            <p className="text-subheading text-graphite">{item.description}</p>

            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-body-sm text-graphite">
                {paragraph}
              </p>
            ))}

            {item.link && labels.detailLink && (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 self-start text-body-sm font-medium text-signal transition-[gap] duration-200 ease-[var(--ease-out-soft)] hover:gap-3"
              >
                {labels.detailLink}
                <ArrowRightIcon size={16} />
              </a>
            )}
          </div>

          {labels.joinMember && (
            <div className="shrink-0 border-t border-ash/60 px-6 py-4 md:px-8">
              <Button type="button" size="lg" wrap className="w-full" onClick={onRegister}>
                {labels.joinMember}
                <ArrowRightIcon />
              </Button>
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}
