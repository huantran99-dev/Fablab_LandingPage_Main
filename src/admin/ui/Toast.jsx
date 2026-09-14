import { useCallback, useState } from 'react'

import { Icon } from './Icon'
import { ToastContext } from './toastContext'

const TONES = {
  success: { box: 'border-success-500 bg-success-50 dark:border-success-500/30 dark:bg-success-500/15', icon: 'check', color: 'text-success-600 dark:text-success-500' },
  error: { box: 'border-error-500 bg-error-50 dark:border-error-500/30 dark:bg-error-500/15', icon: 'alert', color: 'text-error-600 dark:text-error-500' },
  warning: { box: 'border-warning-500 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/15', icon: 'alert', color: 'text-warning-600 dark:text-warning-500' },
  info: { box: 'border-info-500 bg-info-50 dark:border-info-500/30 dark:bg-info-500/15', icon: 'info', color: 'text-info-500' },
}

let counter = 0

/**
 * Thông báo góc dưới phải, kiểu Alert của TailAdmin.
 *
 * Lỗi và cảnh báo ở lâu hơn thông báo thành công: người dùng cần đọc hết danh sách
 * lý do máy chủ từ chối, còn "Đã lưu" thì liếc là đủ.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (toast) => {
      counter += 1
      const id = counter
      const tone = toast.tone ?? 'success'
      setToasts((list) => [...list.slice(-3), { ...toast, tone, id }])
      window.setTimeout(() => dismiss(id), tone === 'success' || tone === 'info' ? 5000 : 12000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(26rem,calc(100%-2rem))] flex-col gap-3"
      >
        {toasts.map((toast) => {
          const tone = TONES[toast.tone]
          return (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex gap-3 rounded-xl border p-4 shadow-theme-lg ${tone.box}`}
            >
              <Icon name={tone.icon} size={22} className={tone.color} />
              <div className="min-w-0 flex-1 text-sm">
                {toast.title && <p className="font-semibold text-gray-800 dark:text-white/90">{toast.title}</p>}
                {toast.message && (
                  <div className="mt-1 max-h-48 overflow-y-auto text-gray-600 dark:text-gray-300">{toast.message}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Đóng thông báo"
                className="self-start text-gray-400 hover:text-gray-600 dark:hover:text-white/80"
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
