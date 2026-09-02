import { Courses } from './components/Courses'
import { Facilities } from './components/Facilities'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { Pillars } from './components/Pillars'
import { Process } from './components/Process'
import { StatsBar } from './components/StatsBar'
import { Team } from './components/Team'
import { Testimonials } from './components/Testimonials'
import { LanguageProvider } from './i18n/LanguageProvider'

export default function App() {
  return (
    <LanguageProvider>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <Pillars />
        <Courses />
        <Facilities />
        <Process />
        <Team />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </LanguageProvider>
  )
}
