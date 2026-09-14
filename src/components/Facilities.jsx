import { FACILITY_ICON_IDS, FacilityIcon } from '../assets/icons/Icons'
import { useT } from '../i18n/context'
import { RevealGroup } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

/**
 * Lưới bento không đều: hai ô rộng và hai ô hẹp đặt so le nhau, để khối thiết
 * bị không rơi vào nhịp lưới đều đặn nhàm chán.
 *
 * Nhịp: rộng – hẹp – hẹp, lặp lại. Bảng theo `id` bên dưới giữ nguyên bố cục đã
 * chọn tay cho bốn thiết bị hiện có; vòng lặp lo cho thiết bị thêm sau này. Cùng
 * lý do với Pillars: tra bảng hụt rồi đọc thuộc tính là **trắng nguyên trang**.
 */
const LAYOUT_CYCLE = [
  { span: 'md:col-span-4', bg: 'bg-wash', icon: 'text-signal', feature: true },
  { span: 'md:col-span-2', bg: 'bg-butter', icon: 'text-ember', feature: false },
  { span: 'md:col-span-2', bg: 'bg-mint', icon: 'text-leaf', feature: false },
]

const LAYOUT = {
  'printer-3d': LAYOUT_CYCLE[0],
  cnc: LAYOUT_CYCLE[1],
  laser: LAYOUT_CYCLE[2],
  'electronics-lab': LAYOUT_CYCLE[0],
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
        {t.facilities.items.map((item, index) => {
          const layout = LAYOUT[item.id] ?? LAYOUT_CYCLE[index % LAYOUT_CYCLE.length]
          const image = item.image
          return (
            <article
              key={item.id}
              className={`flex flex-col gap-5 rounded-card-sm md:rounded-card p-6 md:p-8 ${layout.span} ${layout.bg}`}
            >
              {/* Ảnh thật của xưởng. Huy hiệu icon nổi ở góc dưới trái giống card
                  khóa học, để hai lưới ảnh trên trang cùng một ngôn ngữ hình.

                  Thiếu ảnh thì bỏ hẳn khối này: không có ảnh mặc định, mà `img`
                  với `src` là `undefined` sẽ hiện biểu tượng ảnh vỡ. */}
              {image && (
                <div className="relative overflow-hidden rounded-image-sm bg-ash/30">
                  <img
                    src={image.url}
                    width={image.width}
                    height={image.height}
                    alt={t.facilities.imageAlt.replace('{title}', item.title)}
                    loading="lazy"
                    decoding="async"
                    className={`block w-full object-cover ${layout.feature ? 'h-52 md:h-60' : 'h-52'}`}
                  />
                  {FACILITY_ICON_IDS.has(item.id) && (
                    <span
                      className={`absolute bottom-3 left-3 inline-flex size-12 items-center justify-center rounded-pill bg-white shadow-ambient ${layout.icon}`}
                    >
                      <FacilityIcon id={item.id} size={layout.feature ? 26 : 24} />
                    </span>
                  )}
                </div>
              )}

              <h3 className="text-heading-sm text-ink">{item.title}</h3>
              <p className="text-body-sm text-graphite max-w-[420px]">{item.description}</p>
            </article>
          )
        })}
      </RevealGroup>
    </Section>
  )
}
