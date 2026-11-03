import { useLayoutEffect } from 'react'
import { readableOn } from '../lib/color'
import { useActiveSeason } from '../lib/season'

/**
 * Đổi bảng màu cả trang theo sự kiện mùa đang chạy. Không vẽ gì.
 *
 * Mọi màu của trang là biến CSS (`.bg-signal{background-color:var(--color-signal)}` trong
 * CSS đã build), nên ghi đè vài biến lên `<html>` là mọi nút, nhãn, link, chấm tròn đổi
 * theo — không component nào phải biết sự kiện là gì, và dữ liệu chỉ chứa MÃ MÀU chứ
 * không chứa tên class (Tailwind không sinh CSS từ chuỗi trong database).
 *
 * `useLayoutEffect` chứ không phải `useEffect`: chạy trước lần vẽ đầu, nên người xem không
 * thấy một nhịp màu xanh mặc định rồi mới đổi sang màu Tết. Ô màu nào admin để trống thì
 * giữ màu mặc định.
 */
const VARIABLES = [
  ['colorPrimary', '--color-signal'],
  ['colorSurface', '--color-wash'],
  ['colorDark', '--color-navy'],
  ['colorAccent', '--color-ember'],
]

export function SeasonTheme() {
  const season = useActiveSeason()

  useLayoutEffect(() => {
    if (!season) return
    const root = document.documentElement
    const written = []
    const write = (name, value) => {
      root.style.setProperty(name, value)
      written.push(name)
    }

    for (const [field, variable] of VARIABLES) {
      if (season[field]) write(variable, season[field])
    }
    // Chữ trên nền màu chủ đạo: trắng, hoặc màu mực khi màu chủ đạo quá sáng (vàng, cam
    // nhạt) — nút luôn đọc được mà admin không phải tự chọn màu chữ.
    if (season.colorPrimary) write('--color-on-signal', readableOn(season.colorPrimary))
    root.dataset.season = season.id
    if (season.motif) root.dataset.motif = season.motif

    return () => {
      for (const name of written) root.style.removeProperty(name)
      delete root.dataset.season
      delete root.dataset.motif
    }
  }, [season])

  return null
}
