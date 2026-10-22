import { useEffect, useRef } from 'react'
import { ArrowRightIcon, CloseIcon } from '../assets/icons/Icons'
import { useScrollLock } from '../hooks/useScrollLock'
import { useT } from '../i18n/context'
import { Pill } from './ui/Pill'

const TITLE_ID = 'equipment-modal-title'

/**
 * Popup thông số kỹ thuật của một máy trong section Thiết bị.
 *
 * Cùng khung với CourseModal và cùng lý do: `<dialog>` gốc lo sẵn bẫy focus, phím
 * Esc, trả focus về nút vừa bấm và `inert` cho nền. Khoá cuộn đặt trên `<html>` qua
 * `useScrollLock` — đặt trên `<body>` là chết navbar sticky.
 *
 * `device` là `null` khi đóng; component luôn mount để `<dialog>` giữ trạng thái.
 */
export function EquipmentModal({ device, onClose }) {
  const ref = useRef(null)
  const open = Boolean(device)
  const t = useT()
  const labels = t.equipment

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useScrollLock(open)

  // Bấm ra vùng nền: click trên ::backdrop có target chính là <dialog>.
  const handleClick = (event) => {
    if (event.target === ref.current) onClose()
  }

  const specs = device?.specs ?? []

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={handleClick}
      aria-labelledby={TITLE_ID}
      // Bề rộng cố định: dialog co theo nội dung, mà máy ít thông số (SRM-20 có hai
      // dòng) sẽ ra một popup hẹp lệch hẳn so với máy nhiều thông số.
      className="w-full max-w-[min(600px,calc(100vw-32px))]"
    >
      {device && (
        <div className="flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-card-sm bg-white shadow-ambient-lift">
          <div className="relative shrink-0">
            {/* Ảnh SẢN PHẨM nền trắng, tỉ lệ từ dọc 0.8 tới ngang 1.8 — nên
                `object-contain` trong khung cố định, không cắt máy nào. */}
            {device.image ? (
              <div className="flex h-48 items-center justify-center border-b border-ash/60 bg-white px-6 py-4 md:h-56">
                <img
                  src={device.image.url}
                  width={device.image.width}
                  height={device.image.height}
                  alt={labels.imageAlt.replace('{name}', device.name)}
                  className="max-h-full w-auto object-contain"
                />
              </div>
            ) : (
              <div className="h-16" aria-hidden="true" />
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label={labels.close}
              className="absolute top-4 right-4 inline-flex size-10 cursor-pointer items-center justify-center rounded-pill bg-wash text-ink transition-colors duration-200 ease-[var(--ease-out-soft)] hover:bg-ash/50"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex flex-col gap-6 overflow-y-auto px-6 py-6 md:px-8">
            <header className="flex flex-col items-start gap-3">
              <Pill tone="wash">{device.type}</Pill>
              <h2 id={TITLE_ID} className="text-heading-lg text-ink">
                {device.name}
              </h2>
            </header>

            {specs.length > 0 ? (
              <section className="flex flex-col gap-3">
                <h3 className="text-heading-sm text-ink">{labels.specsTitle}</h3>
                {/* Hai cột từ `sm`: nhãn trái, giá trị phải. Màn hẹp thì xếp chồng
                    để giá trị dài (công nghệ in của Form 3) không bị bóp. */}
                <dl className="divide-y divide-ash/60 overflow-hidden rounded-image-sm border border-ash/60">
                  {specs.map((spec) => (
                    <div
                      key={spec.id}
                      className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4"
                    >
                      <dt className="text-caption font-medium text-steel">{spec.label}</dt>
                      <dd className="text-body-sm text-ink">{spec.detail}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : (
              // Trang gốc không công bố thông số cho máy này: nói thẳng, không bịa.
              <p className="rounded-image-sm bg-butter px-5 py-4 text-body-sm text-graphite">
                {labels.noSpecs}
              </p>
            )}

            <a
              href={labels.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 self-start text-body-sm font-medium text-signal transition-[gap] duration-200 ease-[var(--ease-out-soft)] hover:gap-3"
            >
              {labels.source}
              <ArrowRightIcon size={16} />
            </a>
          </div>
        </div>
      )}
    </dialog>
  )
}
