import { FacilityIcon } from '../assets/icons/Icons'
import { FACILITY_IMAGES } from '../assets/images'
import { useT } from '../i18n/context'
import { RevealGroup } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

/**
 * Lưới bento không đều: hai ô rộng và hai ô hẹp đặt so le nhau, để khối thiết
 * bị không rơi vào nhịp lưới đều đặn nhàm chán.
 */
const LAYOUT = {
  'printer-3d': { span: 'md:col-span-4', bg: 'bg-wash', icon: 'text-signal', feature: true },
  cnc: { span: 'md:col-span-2', bg: 'bg-butter', icon: 'text-ember', feature: false },
  laser: { span: 'md:col-span-2', bg: 'bg-mint', icon: 'text-leaf', feature: false },
  'electronics-lab': { span: 'md:col-span-4', bg: 'bg-wash', icon: 'text-signal', feature: true },
}

export function Facilities() {
  const t = useT()

  return (
    <Section id="facilities">
      <SectionHeading
        eyebrow={t.facilities.eyebrow}
        title={t.facilities.title}
        description={t.facilities.description}
        align="center"
        from="left"
      />

      <RevealGroup from="right" className="mt-14 grid gap-6 md:grid-cols-6">
        {t.facilities.items.map((item) => {
          const layout = LAYOUT[item.id]
          const image = FACILITY_IMAGES[item.id]
          return (
            <article
              key={item.id}
              className={`flex flex-col gap-5 rounded-card-sm md:rounded-card p-6 md:p-8 ${layout.span} ${layout.bg}`}
            >
              {/* Ảnh thật của xưởng. Huy hiệu icon nổi ở góc dưới trái giống card
                  khóa học, để hai lưới ảnh trên trang cùng một ngôn ngữ hình. */}
              <div className="relative overflow-hidden rounded-image-sm bg-ash/30">
                <img
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={t.facilities.imageAlt.replace('{title}', item.title)}
                  loading="lazy"
                  decoding="async"
                  className={`block w-full object-cover ${layout.feature ? 'h-52 md:h-60' : 'h-52'}`}
                />
                <span
                  className={`absolute bottom-3 left-3 inline-flex size-12 items-center justify-center rounded-pill bg-white shadow-ambient ${layout.icon}`}
                >
                  <FacilityIcon id={item.id} size={layout.feature ? 26 : 24} />
                </span>
              </div>

              <h3 className="text-heading-sm text-ink">{item.title}</h3>
              <p className="text-body-sm text-graphite max-w-[420px]">{item.description}</p>
            </article>
          )
        })}
      </RevealGroup>
    </Section>
  )
}
