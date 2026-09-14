import { ArrowLeftIcon, ArrowRightIcon, QuoteIcon } from '../assets/icons/Icons'
import { useCarousel } from '../hooks/useCarousel'
import { useT } from '../i18n/context'
import { initialsOf } from '../lib/initials'
import { Reveal } from './ui/Reveal'
import { RoundButton } from './ui/RoundButton'
import { Section, SectionHeading } from './ui/Section'

const AVATAR_TONES = ['bg-signal', 'bg-ember', 'bg-leaf']

export function Testimonials() {
  const t = useT()
  const items = t.testimonials.items
  const { current, go, goTo } = useCarousel(items.length)
  const active = items[current]

  return (
    <Section>
      <SectionHeading
        eyebrow={t.testimonials.eyebrow}
        title={t.testimonials.title}
        align="center"
        from="left"
      />

      <Reveal from="right" className="mt-14 flex items-center gap-5">
        <div className="hidden md:block">
          <RoundButton label={t.testimonials.previous} onClick={() => go(-1)}>
            <ArrowLeftIcon />
          </RoundButton>
        </div>

        <figure
          className="flex-1 rounded-card-sm md:rounded-card bg-wash px-6 py-10 text-center md:px-12 md:py-14"
          aria-live="polite"
        >
          <QuoteIcon className="mx-auto text-signal/30" size={36} />

          <blockquote className="mx-auto mt-6 max-w-[680px] text-subheading text-ink">
            “{active.quote}”
          </blockquote>

          <figcaption className="mt-9 flex items-center justify-center gap-3">
            <span
              className={`inline-flex size-12 items-center justify-center rounded-pill font-display text-body-sm font-bold text-white ${AVATAR_TONES[current % AVATAR_TONES.length]}`}
              aria-hidden="true"
            >
              {initialsOf(active.name)}
            </span>
            <span className="text-left">
              <span className="block text-body-sm font-medium text-ink">{active.name}</span>
              <span className="block text-caption text-steel">{active.role}</span>
            </span>
          </figcaption>
        </figure>

        <div className="hidden md:block">
          <RoundButton label={t.testimonials.next} onClick={() => go(1)}>
            <ArrowRightIcon />
          </RoundButton>
        </div>
      </Reveal>

      <Reveal className="mt-8 flex items-center justify-center gap-5">
        <div className="md:hidden">
          <RoundButton label={t.testimonials.previous} onClick={() => go(-1)}>
            <ArrowLeftIcon />
          </RoundButton>
        </div>

        <div className="flex items-center gap-2">
          {items.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(dotIndex)}
              aria-label={`${t.testimonials.goTo} ${dotIndex + 1}`}
              aria-current={dotIndex === current ? 'true' : undefined}
              className={[
                'h-2 cursor-pointer rounded-pill transition-all duration-300 ease-[var(--ease-out-soft)]',
                dotIndex === current ? 'w-7 bg-signal' : 'w-2 bg-ash hover:bg-steel',
              ].join(' ')}
            />
          ))}
        </div>

        <div className="md:hidden">
          <RoundButton label={t.testimonials.next} onClick={() => go(1)}>
            <ArrowRightIcon />
          </RoundButton>
        </div>
      </Reveal>
    </Section>
  )
}
