import { useEffect, useRef } from 'react'

import { IconButton } from './Button'

/**
 * Hộp thoại dùng `<dialog>` gốc + `showModal()` — cùng lựa chọn với CourseModal của
 * trang công khai: trình duyệt lo sẵn bẫy focus, `Esc`, trả focus và `inert` cho nền.
 * Modal lồng nhau (chọn ảnh từ trong form mục) chồng đúng thứ tự nhờ top layer.
 *
 * `Esc` KHÔNG tự đóng: sự kiện `cancel` bị chặn và chuyển thành `onClose`, để form
 * đang soạn tự quyết định có hỏi "bỏ thay đổi?" hay không.
 *
 * Nội dung chỉ được dựng khi mở, nên state bên trong luôn bắt đầu lại từ đầu.
 */
const WIDTHS = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
}

export function Modal({ open, onClose, title, description, children, footer, size = 'lg' }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        onClose?.()
      }}
      className={`m-auto w-[calc(100%-2rem)] ${WIDTHS[size]} max-h-[calc(100dvh-2rem)] overflow-hidden rounded-3xl border-0 bg-white p-0 text-gray-800 shadow-theme-xl dark:bg-gray-900 dark:text-white/90`}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">{title}</h2>
              {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
            </div>
            <IconButton
              icon="close"
              label="Đóng"
              onClick={onClose}
              className="rounded-full! bg-gray-100 dark:bg-gray-800"
            />
          </header>
          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
          {footer && (
            <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-800">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  )
}
