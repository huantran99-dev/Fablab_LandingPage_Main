/**
 * Nhãn dạng viên thuốc — dùng cho eyebrow đầu section, tag cấp độ khóa học và
 * các badge nổi trên ảnh hero.
 */
const TONES = {
  wash: 'bg-wash text-signal',
  white: 'bg-white text-ink',
  ink: 'bg-ink text-white',
  signal: 'bg-signal text-white',
  outline: 'bg-white text-graphite border border-ash',
}

export function Pill({ tone = 'wash', className = '', children, ...props }) {
  const classes = [
    'inline-flex items-center gap-2 rounded-pill',
    'px-4 py-1.5 text-caption font-medium whitespace-nowrap',
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
