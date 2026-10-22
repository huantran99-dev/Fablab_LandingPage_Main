import { Pill } from './Pill'
import { Reveal } from './Reveal'

/**
 * Khung chuẩn cho mọi section: container 1440px (`container-page`) và khoảng cách dọc đồng đều.
 * Đi qua đây thì nhịp dọc của trang không thể bị lệch giữa các section.
 */
/*
 * Cắt tràn NGANG ngay tại section (clip, không phải hidden — clip không tạo vùng cuộn,
 * chiều dọc vẫn để tràn bình thường).
 *
 * Lý do: lúc chờ trượt vào, khối reveal dịch ngang ±56px. Trên máy tính `body` đã cắt
 * phần đó, nhưng trình duyệt ĐIỆN THOẠI vẫn tính phần tràn vào bề ngang trang: trang
 * 390px dàn thành ~426px, bị thu nhỏ hoặc kéo ngang được, và vuốt hàng thẻ thì cả trang
 * trôi theo. Đã đo bằng Chrome giả lập iPhone: có dòng này thì innerWidth đúng 390.
 */
/*
 * `contained={false}`: không bọc `container-page` — cho khối tràn hết bề ngang màn hình
 * (banner video Cuộc thi). Phần còn lại của section khi đó tự đặt `container-page`.
 * Tràn bằng cách thoát container chứ không bằng `100vw`: `100vw` tính cả thanh cuộn dọc
 * nên rộng hơn trang vài px trên máy tính.
 */
export function Section({ id, className = '', containerClassName = '', contained = true, children }) {
  return (
    <section id={id} className={`overflow-x-clip py-16 md:py-24 lg:py-30 ${className}`}>
      {contained ? <div className={`container-page ${containerClassName}`}>{children}</div> : children}
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
