import { useId, useState } from 'react'
import { CheckIcon, PILLAR_ICON_IDS, PillarIcon, PlusIcon } from '../assets/icons/Icons'
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

/**
 * Tiêu đề của BA khối ngang cấp — Sứ mệnh, Tầm nhìn, Giá trị cốt lõi. Một hằng duy nhất
 * để ba khối không thể lệch cỡ nhau (người dùng đã chỉ ra đúng lỗi đó: Sứ mệnh từng là h2
 * cỡ display của section, hai khối kia chỉ là nhãn caption).
 */
const BLOCK_TITLE = 'text-heading-sm md:text-heading-lg text-ink'

/**
 * Giá trị cốt lõi dạng accordion (mẫu WAI-ARIA Accordion): nút nằm trong h4, panel là
 * `region` gắn nhãn bằng nút. Mở một mục mỗi lần; mục đầu mở sẵn để thấy ngay là bấm
 * được. Giữ `id` của mục đang mở (không giữ chỉ số) để đổi ngôn ngữ vẫn đúng mục.
 *
 * Mở/đóng bằng lưới `grid-template-rows` 0fr → 1fr trên div BÊN TRONG `<li>`: `<li>` là
 * con của RevealGroup, mà transition shorthand của reveal ghi đè mọi `transition-property`
 * đặt trên chính nó. Panel đóng có `inert` để Tab không lọt vào chữ đang ẩn.
 *
 * Mục thiếu mô tả (bản lịch sử cũ khôi phục bỏ qua schema) vẽ thành dòng chữ thường,
 * không nút, không dấu cộng.
 */
function ValuesAccordion({ values }) {
  const baseId = useId()
  const [openId, setOpenId] = useState(() => values.find((value) => value.description)?.id ?? null)

  return (
    <RevealGroup as="ol" from="right" className="divide-y divide-ash/60 border-y border-ash/60">
      {values.map((value, index) => {
        const number = (
          <span
            className="w-8 shrink-0 font-display text-body-sm font-bold tabular-nums text-signal"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
        )
        const name = 'font-display text-subheading font-bold text-ink md:text-heading-sm'

        if (!value.description) {
          return (
            <li key={value.id} className="flex items-baseline gap-5 py-4 md:py-5">
              {number}
              <h4 className={name}>{value.title}</h4>
            </li>
          )
        }

        const open = openId === value.id
        const buttonId = `${baseId}-${value.id}-button`
        const panelId = `${baseId}-${value.id}-panel`
        return (
          <li key={value.id}>
            <h4>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : value.id)}
                className="group flex w-full cursor-pointer items-center gap-5 py-4 text-left md:py-5"
              >
                {number}
                <span className={`flex-1 transition-colors duration-200 group-hover:text-signal ${name}`}>
                  {value.title}
                </span>
                <span
                  className={[
                    'inline-flex size-9 shrink-0 items-center justify-center rounded-pill border transition-all duration-300 ease-[var(--ease-out-soft)]',
                    open ? 'rotate-45 border-signal bg-signal text-white' : 'border-ash text-ink group-hover:border-signal',
                  ].join(' ')}
                  aria-hidden="true"
                >
                  <PlusIcon size={16} />
                </span>
              </button>
            </h4>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!open}
              className={[
                'grid transition-[grid-template-rows] duration-300 ease-[var(--ease-out-soft)]',
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              ].join(' ')}
            >
              <div className="overflow-hidden">
                {/* Lùi trái bằng cột số (w-8 + gap-5) để chữ thẳng hàng tên giá trị. */}
                <p className="pb-5 pl-13 text-body-sm text-graphite md:pr-14 md:pb-6">{value.description}</p>
              </div>
            </div>
          </li>
        )
      })}
    </RevealGroup>
  )
}

export function Pillars() {
  const t = useT()
  const { missionTitle, vision, valuesTitle } = t.pillars
  const values = t.pillars.values ?? []
  const highlights = t.pillars.visionHighlights ?? []
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

      {/* Bậc heading: h2 (section) → h3 (Sứ mệnh / Tầm nhìn / Giá trị cốt lõi, cùng
          BLOCK_TITLE) → h4 (tên trụ cột, tên giá trị). Các khoá tiêu đề khối có thể VẮNG
          (bản lịch sử cũ, database chưa áp migration 013): thiếu thì bỏ h3, không sập. */}
      <div className="mt-14 flex flex-col gap-8">
        {missionTitle && (
          <Reveal as="h3" className={BLOCK_TITLE}>
            {missionTitle}
          </Reveal>
        )}
        <RevealGroup from="right" className="grid gap-6 md:grid-cols-3">
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
                <h4 className="text-heading-sm text-ink">{pillar.title}</h4>
                <p className="text-body-sm text-graphite">{pillar.description}</p>
              </article>
            )
          })}
        </RevealGroup>
      </div>

      {/* Tầm nhìn | Giá trị cốt lõi — khối chia đôi, ngăn với khối Sứ mệnh bằng một đường
          kẻ chứ không bằng một bề mặt màu: khối kêu gọi cuối trang đã giữ nền navy.

          Cả hai nửa đều có thể VẮNG trong dữ liệu. Thiếu nửa nào thì bỏ nửa đó, nửa còn
          lại chiếm hết bề ngang; thiếu cả hai thì không vẽ đường kẻ. */}
      {(hasVision || hasValues) && (
        <div
          className={[
            'mt-16 md:mt-20 grid gap-12 border-t border-ash/60 pt-12 md:pt-16 lg:gap-16',
            hasVision && hasValues ? 'lg:grid-cols-[5fr_7fr]' : '',
          ].join(' ')}
        >
          {hasVision && (
            <Reveal from="left" className="flex flex-col gap-6">
              {vision.title && <h3 className={BLOCK_TITLE}>{vision.title}</h3>}
              {/* Thẻ pastel, câu tầm nhìn cỡ chữ đọc thường — bản trước dùng cỡ tiêu đề
                  kèm dấu ngoặc kép lớn, quá to và thô cho một câu dài. Điểm nhấn tách từ
                  chính câu đó (`visionHighlights`), vắng thì chỉ còn câu. */}
              <div className="flex flex-col gap-6 rounded-card-sm bg-wash p-8 md:rounded-card md:p-10">
                <p className="text-subheading text-ink">{vision.body}</p>
                {highlights.length > 0 && (
                  <ul className="flex flex-col gap-3 border-t border-signal/15 pt-6">
                    {highlights.map((highlight) => (
                      <li key={highlight.id} className="flex items-center gap-3">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill bg-white text-signal">
                          <CheckIcon size={16} />
                        </span>
                        <span className="text-body-sm font-medium text-ink">{highlight.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>
          )}

          {hasValues && (
            <div className="flex flex-col gap-6">
              {valuesTitle && (
                <Reveal as="h3" from="right" className={BLOCK_TITLE}>
                  {valuesTitle}
                </Reveal>
              )}
              <ValuesAccordion values={values} />
            </div>
          )}
        </div>
      )}
    </Section>
  )
}
