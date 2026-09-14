import { Activities } from './components/Activities'
import { Courses } from './components/Courses'
import { Facilities } from './components/Facilities'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Navbar } from './components/Navbar'
import { Partners } from './components/Partners'
import { Pillars } from './components/Pillars'
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
        <Partners />
        <Activities />
        <Team />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </LanguageProvider>
  )
}
