import { ArrowRightIcon } from '../assets/icons/Icons'
import { useT } from '../i18n/context'
import { Button } from './ui/Button'
import { Reveal } from './ui/Reveal'

export function FinalCTA() {
  const t = useT()

  return (
    <section id="register" className="pb-16 md:pb-24 lg:pb-30">
      <div className="container-page">
        {/* Bề mặt đảo màu — điểm nhấn tối duy nhất của trang, đặt ngay trước
            footer để đóng lại mạch đọc. */}
        <Reveal className="relative overflow-hidden rounded-card-sm md:rounded-card bg-navy px-6 py-16 text-center md:px-16 md:py-20">
          {/* Vệt sáng trang trí */}
          <span
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-pill bg-signal/25 blur-3xl"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-pill bg-orchid/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto flex max-w-[640px] flex-col items-center gap-6">
            <h2 className="text-heading-lg md:text-display text-white">{t.finalCta.title}</h2>
            <p className="text-subheading text-white/70">{t.finalCta.description}</p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button href="#courses" variant="inverted" size="lg">
                {t.finalCta.primaryCta}
                <ArrowRightIcon />
              </Button>
              <Button href="#contact" variant="invertedOutline" size="lg">
                {t.finalCta.secondaryCta}
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
