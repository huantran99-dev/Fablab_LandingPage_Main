import { useEffect, useRef } from 'react'
import { CloseIcon } from '../assets/icons/Icons'
import { useScrollLock } from '../hooks/useScrollLock'
import { useT } from '../i18n/context'
import { tieLastWords } from '../lib/typography'
import { useActions } from './actions/ActionContext'
import { ActionButton } from './ui/ActionButton'

const TITLE_ID = 'custom-popup-title'

/**
 * Popup tự tạo (API 23, dashboard "Popup"). Chỉ mở khi người xem bấm một nút có hành động
 * "Mở popup" — không tự hiện (đó là việc của popup sự kiện mùa).
 *
 * `<dialog>` gốc + `showModal()` cùng mẫu CourseModal / SeasonalPopup: trình duyệt lo bẫy
 * focus, Esc, trả focus về nút đã bấm và `inert` cho nền; khoá cuộn qua `useScrollLock`.
 * Bấm ra nền thì đóng.
 *
 * Phải mount TRƯỚC `<FormDialog />` và `<RegisterDialog />` trong App: nút trong popup đóng
 * popup rồi mở form trong cùng một lượt, effect chạy theo thứ tự cây. Nút trỏ sang popup
 * KHÁC thì dialog giữ nguyên trạng thái mở, chỉ đổi nội dung (đóng rồi mở trong cùng lượt
 * được gộp lại).
 *
 * Giữ `id` chứ không giữ object: đổi ngôn ngữ lúc popup đang mở thì nội dung dịch theo.
 */
export function CustomPopup() {
  const t = useT()
  const { popup: state, closePopup } = useActions()
  const ref = useRef(null)
  const popup = state.open ? (t.popups?.items ?? []).find((item) => item.id === state.id) : null
  const open = Boolean(popup)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useScrollLock(open)

  // Bấm ra vùng nền: click trên ::backdrop có target chính là <dialog>.
  const handleClick = (event) => {
    if (event.target === ref.current) closePopup()
  }

  // contentStore chỉ nối hai chữ cuối của CẢ chuỗi; tách đoạn thì nối lại cho từng đoạn.
  const paragraphs = (popup?.body ?? '')
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => tieLastWords(part))

  return (
    <dialog
      ref={ref}
      onClose={closePopup}
      onClick={handleClick}
      aria-labelledby={TITLE_ID}
      className="w-full max-w-[min(560px,calc(100vw-32px))]"
    >
      {popup && (
        <div className="relative flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-card-sm bg-white shadow-ambient-lift">
          <button
            type="button"
            onClick={closePopup}
            aria-label={t.popups?.close}
            className="absolute top-4 right-4 z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-pill bg-white text-ink shadow-ambient transition-colors duration-200 ease-[var(--ease-out-soft)] hover:bg-wash"
          >
            <CloseIcon />
          </button>

          {/* Ảnh do admin tải lên — có thể là poster, nên `object-contain`: cắt mất chữ trên
              poster còn tệ hơn để lề. */}
          {popup.image && (
            <div className="flex shrink-0 items-center justify-center bg-wash px-6 pt-6">
              <img
                src={popup.image.url}
                width={popup.image.width}
                height={popup.image.height}
                alt=""
                decoding="async"
                className="max-h-[min(320px,38dvh)] w-auto rounded-image-sm object-contain"
              />
            </div>
          )}

          <div className="flex flex-col items-start gap-4 overflow-y-auto px-6 py-6 pr-16 md:px-8 md:py-7">
            <h2 id={TITLE_ID} className="text-heading-lg text-ink">
              {popup.title}
            </h2>
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-subheading text-graphite">
                {paragraph}
              </p>
            ))}
          </div>

          {popup.buttons?.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-ash/60 px-6 py-4 md:px-8">
              {popup.buttons.map((button) => (
                <ActionButton
                  key={button.id}
                  button={button}
                  slot={`popup-${popup.id}`}
                  source="popup"
                  size="md"
                  wrap
                  onBefore={closePopup}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}
