import logoMark from '../images/logo-mark.png'

/**
 * Logo FabLab EIU — mark là ảnh thật lấy từ `Logo-Fablab.png` của trường
 * (xem ghi chú trong assets/images/index.js), không còn là SVG tự vẽ.
 *
 * Không lazy-load: logo nằm trên navbar, tức luôn ở màn hình đầu.
 * Wordmark vẫn để dạng text nên luôn ăn theo font của trang.
 *
 * **Import THẲNG file, không qua `images/index.js`.** Module đó import cả 60 ảnh,
 * nên chỉ cần chạm vào nó là Rollup phải phát ra toàn bộ 4,1 MB vào `dist/assets/`
 * — kể cả khi nội dung đã chuyển sang lấy ảnh từ máy chủ. Đây là chỗ duy nhất còn
 * dùng ảnh đóng gói, và cố ý giữ vậy: logo nằm trên navbar ở mọi lượt truy cập,
 * không nên phụ thuộc một vòng gọi mạng.
 */
export function LogoMark({ className = '', size = 36 }) {
  return (
    <img
      src={logoMark}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={`block shrink-0 ${className}`}
    />
  )
}

export function Logo({ tagline, inverted = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[19px] font-bold tracking-[-0.02em] ${inverted ? 'text-white' : 'text-ink'
            }`}
        >
          {/* Trên nền tối, xanh signal không đủ tương phản — dùng sắc nhạt hơn. */}
          EIU <span className={inverted ? 'text-[#8ab8f7]' : 'text-signal'}>FabLab</span>
        </span>
        {tagline && (
          <span
            className={`text-[11px] mt-0.5 ${inverted ? 'text-white/60' : 'text-steel'}`}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  )
}
