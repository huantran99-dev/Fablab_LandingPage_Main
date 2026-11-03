import { useMemo } from 'react'
import { useT } from '../i18n/context'
import { resolveMotif } from './motifs'

/**
 * Sự kiện mùa đang chạy (Tết, Trung Thu, Noel…) — dùng chung cho SeasonTheme (màu),
 * SeasonalPopup (popup) và Hero (ảnh trang trí).
 *
 * Chọn ở TRÌNH DUYỆT theo ngày chứ không ở máy chủ: trang vẽ bằng snapshot đóng gói và
 * phải đổi đúng ngày cả khi API không trả lời. Luật: mục ĐẦU TIÊN trong danh sách có
 * `enabled` và `start ≤ hôm nay ≤ end` (hai đầu đều tính) — hoặc có `now` ("Hiện ngay,
 * không chờ ngày bắt đầu"): khi đó chỉ cần chưa qua `end`. Trùng ngày thì thứ tự danh sách
 * trên dashboard quyết định — invariants.js cảnh báo khi hai mục đang bật trùng ngày.
 */

/** Ngày hôm nay theo giờ Việt Nam (UTC+7), `YYYY-MM-DD` — cùng cách tính `dayKey` ở máy chủ. */
export function vnToday(now = new Date()) {
  return new Date(now.getTime() + 7 * 3600_000).toISOString().slice(0, 10)
}

/**
 * `?season=<id>` ép một sự kiện bất kể ngày và công tắc — để admin XEM THỬ trước khi bật
 * (nút "Xem thử trên trang" của dashboard). Đọc một lần lúc nạp: đổi URL là tải lại trang.
 */
const FORCED_ID = (() => {
  try {
    return new URLSearchParams(window.location.search).get('season') || null
  } catch {
    return null
  }
})()

export function forcedSeasonId() {
  return FORCED_ID
}

/** Thuần — không đọc ngày hay URL, để thử được bằng tay. */
export function pickSeason(seasonal, today, forcedId = null) {
  const items = seasonal?.items ?? []
  if (forcedId) return items.find((item) => item.id === forcedId) ?? null
  return (
    items.find(
      (item) => item.enabled && item.end && today <= item.end && (item.now || (item.start && item.start <= today)),
    ) ?? null
  )
}

/**
 * Sự kiện đang chạy, hoặc `null`. `t.seasonal` vắng (snapshot hay database cũ hơn tính
 * năng này) thì luôn `null` — trang y như trước.
 */
export function useActiveSeason() {
  const t = useT()
  const today = vnToday()
  return useMemo(() => pickSeason(t.seasonal, today, FORCED_ID), [t.seasonal, today])
}

/**
 * Họa tiết của sự kiện đang chạy, đã giải (bộ có sẵn hoặc mục của thư viện `t.motifs`):
 * `{ id, particles, ornament }` hoặc `null`. Memo theo sự kiện + thư viện, nên canvas hạt
 * rơi không dựng lại mỗi lần render.
 */
export function useSeasonMotif() {
  const t = useT()
  const season = useActiveSeason()
  return useMemo(
    () => (season?.motif ? resolveMotif(season.motif, t.motifs, season.colorAccent) : null),
    [season, t.motifs],
  )
}
