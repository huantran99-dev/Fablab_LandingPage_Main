import { PillarIcon } from '../assets/icons/Icons'
import { useT } from '../i18n/context'
import { RevealGroup } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

/** Mỗi trụ cột một sắc pastel — cách style reference phân biệt khối nội dung. */
const TONES = {
  education: { card: 'bg-wash', icon: 'bg-white text-signal' },
  research: { card: 'bg-butter', icon: 'bg-white text-ember' },
  entrepreneurship: { card: 'bg-mint', icon: 'bg-white text-leaf' },
}

export function Pillars() {
  const t = useT()

  return (
    <Section id="about">
      <SectionHeading
        eyebrow={t.pillars.eyebrow}
        title={t.pillars.title}
        description={t.pillars.description}
        align="center"
        from="left"
      />

      <RevealGroup from="right" className="mt-14 grid gap-6 md:grid-cols-3">
        {t.pillars.items.map((pillar) => {
          const tone = TONES[pillar.id]
          return (
            <article
              key={pillar.id}
              className={`flex flex-col gap-5 rounded-card-sm md:rounded-card p-8 md:p-10 ${tone.card}`}
            >
              <span
                className={`inline-flex size-16 items-center justify-center rounded-pill ${tone.icon}`}
              >
                <PillarIcon id={pillar.id} />
              </span>
              <h3 className="text-heading-sm text-ink">{pillar.title}</h3>
              <p className="text-body-sm text-graphite">{pillar.description}</p>
            </article>
          )
        })}
      </RevealGroup>
    </Section>
  )
}
