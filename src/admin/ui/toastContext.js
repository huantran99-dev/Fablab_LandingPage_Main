import { createContext, useContext } from 'react'

/**
 * Tách khỏi Toast.jsx vì luật `react/only-export-components`: một file vừa xuất
 * component vừa xuất hook làm Fast Refresh nạp lại cả trang thay vì chỉ component.
 */
export const ToastContext = createContext(() => {})

/** `toast({ tone: 'success' | 'error' | 'warning' | 'info', title, message })` */
export function useToast() {
  return useContext(ToastContext)
}
