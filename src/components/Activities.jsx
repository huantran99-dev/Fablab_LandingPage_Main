import { ArrowLeftIcon, ArrowRightIcon } from '../assets/icons/Icons'
import { ACTIVITY_IMAGES } from '../assets/images'
import { useCarousel } from '../hooks/useCarousel'
import { useT } from '../i18n/context'
import { Pill } from './ui/Pill'
import { Reveal } from './ui/Reveal'
import { RoundButton } from './ui/RoundButton'
import { Section, SectionHeading } from './ui/Section'

/** Mỗi loại hoạt động một sắc nhãn, để lướt qua là phân biệt được ngay. */
const KIND_TONES = {
  competition: 'signal',
  seminar: 'wash',
  workshop: 'outline',
  partnership: 'ink',
}

export function Activities() {
  const t = useT()
  const items = t.activities.items
  const { current, go, goTo } = useCarousel(items.length)
  const active = items[current]

  return (
    <Section id="activities">
      <SectionHeading
        eyebrow={t.activities.eyebrow}
        title={t.activities.title}
        description={t.activities.description}
        align="center"
        from="left"
      />

      <Reveal from="right" className="mt-14 flex items-center gap-5">
        <div className="hidden md:block">
          <RoundButton label={t.activities.previous} onClick={() => go(-1)}>
            <ArrowLeftIcon />
          </RoundButton>
        </div>

        <article
          className="flex-1 overflow-hidden rounded-card-sm md:rounded-card border border-ash/60 bg-white"
          aria-live="polite"
        >
          <div className="grid md:grid-cols-2">
            {/* `object-contain` trên nền pastel chứ không `object-cover`: nguồn
                trộn poster dọc với ảnh chụp ngang, cover sẽ cắt mất tiêu đề
                poster hoặc mặt người. */}
            <div className="flex items-center justify-center bg-wash p-6 md:p-8">
              <img
                key={active.id}
                src={ACTIVITY_IMAGES[active.id]}
                alt={t.activities.imageAlt.replace('{title}', active.title)}
                loading="lazy"
                decoding="async"
                className="max-h-[280px] w-auto rounded-image-sm object-contain md:max-h-[340px]"
              />
            </div>

            <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-2">
                <Pill tone={KIND_TONES[active.kind]}>{t.activities.kinds[active.kind]}</Pill>
                {active.date && <Pill tone="outline">{active.date}</Pill>}
              </div>

              <h3 className="text-heading-sm md:text-heading-lg text-ink">{active.title}</h3>
              <p className="text-body-sm text-graphite">{active.description}</p>
            </div>
          </div>
        </article>

        <div className="hidden md:block">
          <RoundButton label={t.activities.next} onClick={() => go(1)}>
            <ArrowRightIcon />
          </RoundButton>
        </div>
      </Reveal>

      <Reveal className="mt-8 flex items-center justify-center gap-5">
        <div className="md:hidden">
          <RoundButton label={t.activities.previous} onClick={() => go(-1)}>
            <ArrowLeftIcon />
          </RoundButton>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`${t.activities.goTo} ${index + 1}`}
              aria-current={index === current ? 'true' : undefined}
              className={[
                'h-2 cursor-pointer rounded-pill transition-all duration-300 ease-[var(--ease-out-soft)]',
                index === current ? 'w-7 bg-signal' : 'w-2 bg-ash hover:bg-steel',
              ].join(' ')}
            />
          ))}
        </div>

        <div className="md:hidden">
          <RoundButton label={t.activities.next} onClick={() => go(1)}>
            <ArrowRightIcon />
          </RoundButton>
        </div>
      </Reveal>
    </Section>
  )
}
