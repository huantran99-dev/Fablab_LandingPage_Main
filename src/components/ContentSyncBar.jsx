import { useSyncExternalStore } from 'react'
import { getSyncing, subscribeSyncing } from '../lib/contentStore'

/**
 * Vạch mảnh ở mép trên trang trong lúc trang hỏi máy chủ bản nội dung mới nhất —
 * lúc mở trang, và mỗi lần người xem quay lại tab (vd. vừa lưu ở dashboard).
 *
 * Hiện TRỄ 300ms: máy chủ thường trả 304 trong vài chục ms, mà vạch loé lên rồi tắt
 * ngay sau mỗi lần đổi tab chỉ làm rối mắt. Chỉ lượt đồng bộ chậm mới thấy vạch.
 * Tắt thì không trễ.
 *
 * Trang KHÔNG chờ vạch này: nội dung đã vẽ sẵn bằng bản đóng gói, vạch chỉ báo rằng
 * đang kiểm tra có bản mới hơn hay không. Trang trí, nên `aria-hidden`.
 */
export function ContentSyncBar() {
  const syncing = useSyncExternalStore(subscribeSyncing, getSyncing, getSyncing)

  return (
    <div
      aria-hidden="true"
      data-active={syncing}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden opacity-0 transition-opacity duration-200 data-[active=true]:opacity-100 data-[active=true]:delay-300"
    >
      <span className="animate-sync block h-full w-1/3 rounded-pill bg-signal" />
    </div>
  )
}
