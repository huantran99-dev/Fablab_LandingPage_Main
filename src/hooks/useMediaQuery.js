import { useCallback, useSyncExternalStore } from 'react'

/**
 * `true` khi media query đang khớp, tự cập nhật khi đổi kích thước cửa sổ.
 *
 * Dùng `useSyncExternalStore` thay vì `useState` + effect: không `setState` trong
 * effect (luật lint `set-state-in-effect`), và lần vẽ đầu đã có giá trị đúng — không
 * vẽ một bố cục rồi nháy sang bố cục kia.
 */
export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  const read = () => window.matchMedia(query).matches
  return useSyncExternalStore(subscribe, read, () => false)
}
