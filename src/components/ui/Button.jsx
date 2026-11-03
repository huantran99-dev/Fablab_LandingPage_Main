import { useSeasonMotif } from '../../lib/season'
import { MotifOrnament } from '../../lib/MotifArt'

/**
 * Mọi button và CTA của trang đều đi qua đây.
 *
 * Đó là chốt chặn để style reference không bị lệch: bo tròn hoàn toàn (pill)
 * là bắt buộc, và button KHÔNG BAO GIỜ có shadow — trong hệ "Loom" shadow chỉ
 * thuộc về card và khung ảnh.
 */
const VARIANTS = {
  // Nút chính: nền xanh signal, chữ trắng weight 500.
  // Hover / active suy từ màu signal (index.css) nên đổi theo sự kiện mùa.
  filled: 'bg-signal text-on-signal hover:bg-signal-hover active:bg-signal-active',
  // Nút phụ: nền trắng, viền đen 1px.
  outlined: 'bg-white text-ink border border-ink hover:bg-ink hover:text-white',
  // Nút mờ: viền xám nhạt, dùng cho hành động thứ yếu.
  ghost: 'bg-white text-ink border border-ash hover:border-ink',
  // Dùng trên bề mặt đảo màu (khối navy ở CTA cuối).
  inverted: 'bg-white text-navy hover:bg-wash',
  // Viền trắng trên nền tối.
  invertedOutline: 'border border-white/40 text-white hover:bg-white/10',
}

/**
 * Nút được đeo vật trang trí của sự kiện mùa (tuyết phủ đỉnh, cành mai, đèn lồng…): chỉ
 * nút CHÍNH — nền signal và nút trắng trên khối tối — và không ở cỡ `sm` (chip lọc, nút
 * trong thẻ: đeo vào thì cả hàng rối mắt). Vẫn pill, vẫn không shadow.
 */
const ORNAMENT_VARIANTS = new Set(['filled', 'inverted'])

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
  ornament = true,
  // `wrap`: chữ được xuống dòng (căn giữa) thay vì nằm một dòng. Cho nút chữ dài trong ô
  // hẹp (thẻ Sự kiện ở màn 320px). Là prop chứ không truyền qua `className`: utility đặt
  // ngược từ ngoài vào thua hay thắng là do thứ tự trong CSS đã build, không do ý mình.
  wrap = false,
  children,
  ...props
}) {
  const Tag = as ?? (props.href ? 'a' : 'button')
  const motif = useSeasonMotif()
  const pieces = ornament && size !== 'sm' && ORNAMENT_VARIANTS.has(variant) ? motif?.ornament : null
  const decorated = pieces?.length > 0

  const classes = [
    'inline-flex items-center justify-center gap-2',
    'rounded-pill font-medium',
    wrap ? 'text-center' : 'whitespace-nowrap',
    'transition-colors duration-200 ease-[var(--ease-out-soft)]',
    'cursor-pointer select-none',
    SIZES[size],
    VARIANTS[variant],
    // `relative` để vật trang trí bám theo cạnh nút; nhóm có tên để không dính hover
    // của nhóm cha (thẻ khóa học…).
    decorated && 'relative group/btn',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes} {...props}>
      {children}
      {decorated && <MotifOrnament pieces={pieces} swayClass="group-hover/btn:animate-ornament-sway" />}
    </Tag>
  )
}
