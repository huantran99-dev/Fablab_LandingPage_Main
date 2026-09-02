import { useT } from '../i18n/context'
import { RevealGroup } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

export function Process() {
  const t = useT()

  return (
    <Section id="process">
      <SectionHeading
        eyebrow={t.process.eyebrow}
        title={t.process.title}
        description={t.process.description}
        align="center"
        from="right"
      />

      <RevealGroup
        as="ol"
        from="left"
        className="relative mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8"
      >
        {/* Đường nối nét đứt chạy sau các số thứ tự, chỉ hiện ở desktop nơi bốn
            bước nằm trên cùng một hàng. Nó là con đầu tiên nên hiện trước, rồi
            bốn bước nối nhau chạy theo. */}
        <span
          className="pointer-events-none absolute top-7 right-[12.5%] left-[12.5%] hidden border-t-2 border-dashed border-ash lg:block"
          aria-hidden="true"
        />

        {t.process.steps.map((step, index) => (
          <li key={step.id} className="relative flex flex-col items-center gap-4 text-center">
            <span className="inline-flex size-14 items-center justify-center rounded-pill bg-signal font-display text-[19px] font-bold text-white">
              {index + 1}
            </span>
            <h3 className="text-heading-sm text-ink">{step.title}</h3>
            <p className="max-w-[260px] text-body-sm text-graphite">{step.description}</p>
          </li>
        ))}
      </RevealGroup>
    </Section>
  )
}
