import snapshot from '../content/snapshot.json'
import { tieLastWords } from './typography'

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

// Mọi nội dung vào trang đều đi qua đúng hai chỗ gán `state` dưới đây — cả hai đều qua
// `tieLastWords` để dòng cuối đoạn văn không còn một chữ (xem lib/typography.js).
let state = {
  rev: snapshot.rev ?? 0,
  updatedAt: snapshot.updatedAt ?? null,
  vi: tieLastWords(snapshot.vi),
  en: tieLastWords(snapshot.en),
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

/*
 * Trạng thái "đang đồng bộ" là một store RIÊNG, chỉ thanh loading đăng ký. Gộp vào
 * `state` ở trên thì mỗi lượt đồng bộ đổi tham chiếu nội dung hai lần (bật rồi tắt
 * cờ), và cả trang vẽ lại hai lần dù nội dung không đổi.
 */
const syncListeners = new Set()
let syncing = false

function setSyncing(value) {
  if (syncing === value) return
  syncing = value
  for (const listener of syncListeners) listener()
}

export function subscribeSyncing(listener) {
  syncListeners.add(listener)
  return () => syncListeners.delete(listener)
}

export function getSyncing() {
  return syncing
}

let inFlight = null
let lastSyncAt = 0

/** Quay lại tab sớm hơn chừng này sau lượt trước thì không hỏi lại — tránh dội request. */
const REFRESH_GAP_MS = 3000

/**
 * Hỏi máy chủ bản nội dung mới nhất; khác `rev` thì thay nóng.
 *
 * `cache: 'no-cache'` là BẮT BUỘC dù máy chủ đã trả `Cache-Control: no-cache`: trình
 * duyệt nào còn giữ phản hồi từ thời header cũ (`max-age=60, stale-while-revalidate`)
 * vẫn sẽ dùng bản đó mà không hỏi — đúng cái lỗi "sửa xong phải tải lại vài lần".
 * Với `no-cache`, trình duyệt luôn hỏi lại kèm ETag; không đổi thì chỉ là một 304 rỗng.
 */
export function refreshContent() {
  if (typeof fetch !== 'function') return Promise.resolve()
  if (inFlight) return inFlight

  lastSyncAt = Date.now()
  setSyncing(true)
  inFlight = fetch('/api/content', { headers: { accept: 'application/json' }, cache: 'no-cache' })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (!data?.vi || !data?.en) return
      // Cùng `rev` thì nội dung y hệt — đừng thay, kẻo vẽ lại cả trang không để
      // làm gì. Đây cũng là thứ giữ cho lần tải thường không hề nháy.
      if (data.rev === state.rev) return

      state = {
        rev: data.rev,
        updatedAt: data.updatedAt ?? null,
        vi: tieLastWords(data.vi),
        en: tieLastWords(data.en),
        source: 'api',
      }
      for (const listener of listeners) listener()
    })
    .catch(() => {
      // Không có máy chủ là chuyện bình thường ở đây: bản đóng gói đã đủ để trang
      // chạy đúng. Nuốt lỗi có chủ đích, không phải bỏ sót.
    })
    .finally(() => {
      inFlight = null
      setSyncing(false)
    })
  return inFlight
}

let started = false

export function startContentSync() {
  if (started || typeof fetch !== 'function') return
  started = true
  refreshContent()

  // Người xem quay lại tab trang (vd. vừa sửa ở tab dashboard) thì hỏi lại ngay, khỏi
  // phải tải lại trang. Chỉ một 304 rỗng khi không có gì mới.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - lastSyncAt > REFRESH_GAP_MS) {
      refreshContent()
    }
  })
}
