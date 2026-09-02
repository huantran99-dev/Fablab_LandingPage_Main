/**
 * Mọi button và CTA của trang đều đi qua đây.
 *
 * Đó là chốt chặn để style reference không bị lệch: bo tròn hoàn toàn (pill)
 * là bắt buộc, và button KHÔNG BAO GIỜ có shadow — trong hệ "Loom" shadow chỉ
 * thuộc về card và khung ảnh.
 */
const VARIANTS = {
  // Nút chính: nền xanh signal, chữ trắng weight 500.
  filled: 'bg-signal text-white hover:bg-[#1257bb] active:bg-[#0f4a9e]',
  // Nút phụ: nền trắng, viền đen 1px.
  outlined: 'bg-white text-ink border border-ink hover:bg-ink hover:text-white',
  // Nút mờ: viền xám nhạt, dùng cho hành động thứ yếu.
  ghost: 'bg-white text-ink border border-ash hover:border-ink',
  // Dùng trên bề mặt đảo màu (khối navy ở CTA cuối).
  inverted: 'bg-white text-navy hover:bg-wash',
  // Viền trắng trên nền tối.
  invertedOutline: 'border border-white/40 text-white hover:bg-white/10',
}

const SIZES = {
  sm: 'px-4 py-2 text-caption',
  md: 'px-[23px] py-[11px] text-body-sm',
  lg: 'px-8 py-4 text-[16px]',
}

export function Button({
  as,
  variant = 'filled',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const Tag = as ?? (props.href ? 'a' : 'button')

  const classes = [
    'inline-flex items-center justify-center gap-2',
    'rounded-pill font-medium whitespace-nowrap',
    'transition-colors duration-200 ease-[var(--ease-out-soft)]',
    'cursor-pointer select-none',
    SIZES[size],
    VARIANTS[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  )
}
