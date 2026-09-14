import { PILLAR_ICON_IDS, PillarIcon } from '../assets/icons/Icons'
import { useT } from '../i18n/context'
import { RevealGroup } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

/**
 * Mỗi trụ cột một sắc pastel — cách style reference phân biệt khối nội dung.
 *
 * **Vòng lặp là đường lui bắt buộc, không phải trang trí.** Bản trước chỉ có bảng
 * tra theo `id`; gặp id lạ thì tra ra `undefined` rồi đọc thuộc tính trên đó →
 * TypeError → **trắng nguyên trang**. Chừng nào dữ liệu còn nằm trong mã nguồn thì
 * không lộ, nhưng thêm được trụ cột từ dashboard là chuyện chắc chắn xảy ra.
 *
 * Thứ tự vòng lặp khớp đúng ba id hiện tại ở vị trí 0/1/2, nên hôm nay không đổi
 * một pixel nào. Cùng một mẫu đang dùng tốt ở CourseCard và Team.
 */
const TONE_CYCLE = [
  { card: 'bg-wash', icon: 'bg-white text-signal' },
  { card: 'bg-butter', icon: 'bg-white text-ember' },
  { card: 'bg-mint', icon: 'bg-white text-leaf' },
]

const TONES = {
  education: TONE_CYCLE[0],
  research: TONE_CYCLE[1],
  entrepreneurship: TONE_CYCLE[2],
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
        {t.pillars.items.map((pillar, index) => {
          const tone = TONES[pillar.id] ?? TONE_CYCLE[index % TONE_CYCLE.length]
          return (
            <article
              key={pillar.id}
              className={`flex flex-col gap-5 rounded-card-sm md:rounded-card p-8 md:p-10 ${tone.card}`}
            >
              {/* Không có hình thì bỏ hẳn huy hiệu — vòng tròn trắng trống trơn
                  nhìn như lỗi tải ảnh, tệ hơn là không có gì. */}
              {PILLAR_ICON_IDS.has(pillar.id) && (
                <span
                  className={`inline-flex size-16 items-center justify-center rounded-pill ${tone.icon}`}
                >
                  <PillarIcon id={pillar.id} />
                </span>
              )}
              <h3 className="text-heading-sm text-ink">{pillar.title}</h3>
              <p className="text-body-sm text-graphite">{pillar.description}</p>
            </article>
          )
        })}
      </RevealGroup>
    </Section>
  )
}
