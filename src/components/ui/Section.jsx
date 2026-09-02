import { Pill } from './Pill'
import { Reveal } from './Reveal'

/**
 * Khung chuẩn cho mọi section: container 1200px và khoảng cách dọc đồng đều.
 * Đi qua đây thì nhịp dọc của trang không thể bị lệch giữa các section.
 */
export function Section({ id, className = '', containerClassName = '', children }) {
  return (
    <section id={id} className={`py-16 md:py-24 lg:py-30 ${className}`}>
      <div className={`container-page ${containerClassName}`}>{children}</div>
    </section>
  )
}

/**
 * Cụm tiêu đề đầu section: eyebrow pill → tiêu đề → mô tả.
 * `align="center"` cho các section trình bày dạng lưới, mặc định căn trái.
 *
 * Bọc trong `<Reveal>` nên mọi section đi qua `<Section>` đều tự có hiệu ứng
 * hiện lên khi cuộn tới, không phải khai báo lại ở từng file.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  from = 'up',
  tone = 'wash',
  className = '',
}) {
  const centered = align === 'center'

  return (
    <Reveal
      from={from}
      className={[
        'flex flex-col gap-5',
        centered ? 'items-center text-center mx-auto max-w-[680px]' : 'items-start max-w-[720px]',
        className,
      ].join(' ')}
    >
      {eyebrow && <Pill tone={tone}>{eyebrow}</Pill>}
      <h2 className="text-heading-lg md:text-display text-ink">{title}</h2>
      {description && (
        <p className="text-subheading text-graphite max-w-[600px]">{description}</p>
      )}
    </Reveal>
  )
}
