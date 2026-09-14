import snapshot from '../content/snapshot.json'

/**
 * Nguồn nội dung của trang: bản đóng gói sẵn, rồi thay nóng bằng bản từ API.
 *
 * ## Vì sao vẽ trước rồi mới gọi API
 *
 * Trang vẽ NGAY bằng `snapshot.json` đã nằm sẵn trong bundle, sau đó mới gọi
 * `/api/content` và thay vào nếu khác. Đổi lại:
 *
 * - không bao giờ trắng trang hay hiện khung xương chờ;
 * - API chết, máy chủ chưa dựng, hay mất mạng thì trang vẫn đủ nội dung — chỉ là
 *   bản của lần build gần nhất;
 * - `dist/` mang đi đâu cũng chạy, đúng như trước khi có backend.
 *
 * Giá phải trả: giữa hai lần deploy, bản đóng gói cũ dần so với database. Đó là
 * điểm yếu cố hữu của mô hình này, không phải thiếu sót cài đặt.
 *
 * ## Vì sao là store ngoài React chứ không phải `useEffect` + `setState`
 *
 * `useSyncExternalStore` đúng hình dạng bài toán: dữ liệu sống ngoài React, mọi
 * component phải thấy cùng một bản, và React lo việc vẽ lại. Dùng effect + state
 * sẽ đụng luật lint `react(set-state-in-effect)` và phải nhân bản state ra mỗi
 * chỗ dùng.
 */

const listeners = new Set()

let state = {
  rev: snapshot.rev ?? 0,
  updatedAt: snapshot.updatedAt ?? null,
  vi: snapshot.vi,
  en: snapshot.en,
  /** 'snapshot' = bản đóng gói; 'api' = đã lấy được bản mới từ máy chủ. */
  source: 'snapshot',
}

export function subscribeContent(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Tham chiếu phải ỔN ĐỊNH khi nội dung không đổi, kẻo `useSyncExternalStore` coi
 * là đã thay đổi và vẽ lại vô tận.
 */
export function getContentState() {
  return state
}

let started = false

export function startContentSync() {
  if (started || typeof fetch !== 'function') return
  started = true

  fetch('/api/content', { headers: { accept: 'application/json' } })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data?.vi || !data?.en) return
      // Cùng `rev` thì nội dung y hệt — đừng thay, kẻo vẽ lại cả trang không để
      // làm gì. Đây cũng là thứ giữ cho lần tải thường không hề nháy.
      if (data.rev === state.rev) return

      state = { rev: data.rev, updatedAt: data.updatedAt ?? null, vi: data.vi, en: data.en, source: 'api' }
      for (const listener of listeners) listener()
    })
    .catch(() => {
      // Không có máy chủ là chuyện bình thường ở đây: bản đóng gói đã đủ để trang
      // chạy đúng. Nuốt lỗi có chủ đích, không phải bỏ sót.
    })
}
