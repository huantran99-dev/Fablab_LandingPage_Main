import { PILLAR_ICON_IDS, PillarIcon, QuoteIcon } from '../assets/icons/Icons'
import { useT } from '../i18n/context'
import { Reveal, RevealGroup } from './ui/Reveal'
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

/** Nhãn nhỏ đầu hai cột Tầm nhìn | Giá trị — cùng một kiểu để hai cột đọc thành một cặp. */
const LABEL = 'text-caption font-medium uppercase tracking-[0.12em] text-signal'

export function Pillars() {
  const t = useT()
  const vision = t.pillars.vision
  const values = t.pillars.values ?? []
  const hasVision = Boolean(vision?.body)
  const hasValues = values.length > 0

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

      {/* Tầm nhìn | Giá trị cốt lõi — khối chia đôi kiểu tạp chí, nền trắng, ngăn với
          lưới trụ cột bằng một đường kẻ chứ không bằng một bề mặt màu: khối kêu gọi
          cuối trang đã giữ nền navy, hai bề mặt tối na ná nhau làm trang lặp nhịp.

          Cả hai nửa đều có thể VẮNG trong dữ liệu (bản lịch sử cũ khôi phục bỏ qua
          schema, database seed trước ngày có các khoá này). Thiếu nửa nào thì bỏ nửa
          đó, nửa còn lại chiếm hết bề ngang; thiếu cả hai thì không vẽ đường kẻ. */}
      {(hasVision || hasValues) && (
        <div
          className={[
            'mt-16 md:mt-20 grid gap-12 border-t border-ash/60 pt-12 md:pt-16 lg:gap-16',
            hasVision && hasValues ? 'lg:grid-cols-[5fr_7fr]' : '',
          ].join(' ')}
        >
          {hasVision && (
            <Reveal from="left" className="flex flex-col gap-5">
              {vision.title && <h3 className={LABEL}>{vision.title}</h3>}
              <QuoteIcon className="text-signal/30" size={44} />
              <p className="text-heading-lg text-ink">{vision.body}</p>
            </Reveal>
          )}

          {hasValues && (
            <div className="flex flex-col gap-2">
              {t.pillars.valuesTitle && (
                <Reveal from="right">
                  <h3 className={LABEL}>{t.pillars.valuesTitle}</h3>
                </Reveal>
              )}
              {/* <ol> tự đọc thứ tự cho screen reader, nên số 01–06 hiển thị chỉ
                  để nhìn (aria-hidden). Stagger của RevealGroup áp lên từng dòng. */}
              <RevealGroup as="ol" from="right" className="divide-y divide-ash/60">
                {values.map((value, index) => (
                  <li key={value.id} className="flex items-baseline gap-5 py-4 md:py-5">
                    <span
                      className="w-8 shrink-0 font-display text-body-sm font-bold tabular-nums text-signal"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-subheading font-bold text-ink md:text-heading-sm">
                      {value.title}
                    </span>
                  </li>
                ))}
              </RevealGroup>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}
