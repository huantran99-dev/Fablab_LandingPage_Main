/**
 * Nhãn dạng viên thuốc — dùng cho eyebrow đầu section, tag cấp độ khóa học và
 * các badge nổi trên ảnh hero.
 *
 * Cỡ đi qua prop `size`, ĐỪNG truyền utility cỡ chữ / padding vào `className`: hai
 * utility cùng thuộc tính có mặt một lúc thì lớp nào thắng là do thứ tự trong CSS đã
 * build, không phải thứ tự trong chuỗi class (cùng bẫy `hidden` vs `inline-flex`).
 */
const TONES = {
  wash: 'bg-wash text-signal',
  white: 'bg-white text-ink',
  ink: 'bg-ink text-white',
  signal: 'bg-signal text-white',
  outline: 'bg-white text-graphite border border-ash',
}

const SIZES = {
  // Chip, số đếm, nhãn trên thẻ / banner.
  md: 'px-4 py-1.5 text-caption',
  // Nhãn đầu section và hero — to hơn một bậc (15px, 16px từ md).
  lg: 'px-5 py-2 text-body-sm md:text-body',
}

export function Pill({ tone = 'wash', size = 'md', className = '', children, ...props }) {
  const classes = [
    'inline-flex items-center gap-2 rounded-pill font-medium whitespace-nowrap',
    SIZES[size] ?? SIZES.md,
    TONES[tone],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  )
}
