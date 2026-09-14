/**
 * Nút tròn viền mảnh — dùng cho điều hướng trái/phải của các carousel.
 *
 * Không đi qua `Button.jsx` vì đây là nút biểu tượng cỡ cố định, không nhận
 * variant hay size; nhưng vẫn giữ đúng quy ước của hệ: bo tròn hoàn toàn và
 * KHÔNG có shadow.
 */
export function RoundButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-pill border border-ash bg-white text-ink transition-colors duration-200 ease-[var(--ease-out-soft)] hover:border-ink"
    >
      {children}
    </button>
  )
}
