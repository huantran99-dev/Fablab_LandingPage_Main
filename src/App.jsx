import { Suspense, lazy, useEffect } from 'react'
import { Activities } from './components/Activities'
import { ContentSyncBar } from './components/ContentSyncBar'
import { Courses } from './components/Courses'
import { Facilities } from './components/Facilities'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { Partners } from './components/Partners'
import { Pillars } from './components/Pillars'
import { Projects } from './components/Projects'
import { RegisterDialog } from './components/register/RegisterDialog'
import { RegisterProvider } from './components/register/RegisterProvider'
import { SeasonalPopup } from './components/SeasonalPopup'
import { SeasonTheme } from './components/SeasonTheme'
import { StatsBar } from './components/StatsBar'
import { Team } from './components/Team'
import { Testimonials } from './components/Testimonials'
import { useT } from './i18n/context'
import { LanguageProvider } from './i18n/LanguageProvider'
import { PAGE_SECTIONS, RHYTHM, isHidden } from './lib/pageSections'
import { useActiveSeason } from './lib/season'
import { trackPageview } from './lib/track'

// Hạt rơi chỉ nạp khi sự kiện đang chạy bật nó — ngày thường không tải byte nào.
const SeasonFall = lazy(() => import('./components/SeasonFall'))

function SeasonEffects() {
  const season = useActiveSeason()
  if (!season?.motif || !season.fall) return null
  return (
    <Suspense fallback={null}>
      <SeasonFall season={season} />
    </Suspense>
  )
}

/** Khoá section → component. Thứ tự trên trang là thứ tự của `PAGE_SECTIONS`. */
const COMPONENTS = {
  hero: Hero,
  stats: StatsBar,
  facilities: Facilities,
  projects: Projects,
  pillars: Pillars,
  courses: Courses,
  activities: Activities,
  team: Team,
  partners: Partners,
  testimonials: Testimonials,
  finalCta: FinalCTA,
}

/**
 * Các khối của trang, bỏ khối admin đã tắt (`hidden: true`).
 *
 * Khối đi nhịp (`RHYTHM`) nhận `side` theo thứ tự trong số khối ĐANG HIỆN: khối nhịp thứ 0
 * trượt tiêu đề từ trái, thứ 1 từ phải… Nhờ vậy tắt một khối ở giữa không làm hai khối liền
 * nhau trượt cùng chiều, và không ai phải lật tay chiều của các khối phía sau. Không tắt khối
 * nào thì ra đúng chiều cũ: Thiết bị trái, Dự án phải, Về chúng tôi trái… Cảm nhận phải.
 */
function PageSections() {
  const t = useT()
  let beat = 0
  return PAGE_SECTIONS.filter((key) => !isHidden(t, key)).map((key) => {
    const Component = COMPONENTS[key]
    if (!RHYTHM.has(key)) return <Component key={key} />
    const side = beat++ % 2 === 0 ? 'left' : 'right'
    return <Component key={key} side={side} />
  })
}

export default function App() {
  useEffect(() => {
    trackPageview()
  }, [])

  return (
    <LanguageProvider>
      <RegisterProvider>
        {/* Bảng màu của sự kiện mùa đang chạy — ghi biến CSS lên <html>, không vẽ gì. */}
        <SeasonTheme />
        <ContentSyncBar />
        <Navbar />
        <main>
          <PageSections />
        </main>
        <Footer />
        {/* Hạt rơi + nút tắt của sự kiện mùa. Sau Footer: nút tắt là điểm dừng Tab CUỐI,
            không chen lên trước menu. */}
        <SeasonEffects />
        {/* Popup sự kiện mùa: đứng TRƯỚC RegisterDialog vì nút "Đăng ký" của nó mở form. */}
        <SeasonalPopup />
        {/* PHẢI đứng sau mọi thứ có thể mở nó — xem ghi chú đầu RegisterDialog.jsx. */}
        <RegisterDialog />
      </RegisterProvider>
    </LanguageProvider>
  )
}
