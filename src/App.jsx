import { useEffect } from 'react'
import { Activities } from './components/Activities'
import { Courses } from './components/Courses'
import { Facilities } from './components/Facilities'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { Partners } from './components/Partners'
import { Pillars } from './components/Pillars'
import { RegisterDialog } from './components/register/RegisterDialog'
import { RegisterProvider } from './components/register/RegisterProvider'
import { StatsBar } from './components/StatsBar'
import { Team } from './components/Team'
import { Testimonials } from './components/Testimonials'
import { LanguageProvider } from './i18n/LanguageProvider'
import { trackPageview } from './lib/track'

export default function App() {
  useEffect(() => {
    trackPageview()
  }, [])

  return (
    <LanguageProvider>
      <RegisterProvider>
        <Navbar />
        <main>
          <Hero />
          <StatsBar />
          <Pillars />
          <Courses />
          <Facilities />
          <Partners />
          <Activities />
          <Team />
          <Testimonials />
          <FinalCTA />
        </main>
        <Footer />
        {/* PHẢI đứng sau mọi thứ có thể mở nó — xem ghi chú đầu RegisterDialog.jsx. */}
        <RegisterDialog />
      </RegisterProvider>
    </LanguageProvider>
  )
}
