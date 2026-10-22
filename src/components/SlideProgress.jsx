/**
 * Vạch tiến trình của banner tự chạy: mỗi slide một đoạn, đồng thời là nút chuyển tới
 * slide đó (vùng bấm cao 24px, phần nhìn thấy chỉ 3px).
 *
 * Đoạn đang chạy là BỘ ĐẾM GIỜ của banner: hết animation (`animationend`) là `onDone`.
 * Tạm dừng = `animation-play-state: paused`, không có timer nào phải dọn. `key={cycle}`
 * để mỗi lần chuyển (kể cả bấm tay) thanh chạy lại từ đầu. Không tự chạy (`autoplay`
 * false, gồm cả khi giảm chuyển động) thì đoạn đang chọn chỉ tô đầy, không animation.
 */
export function SlideProgress({ items, current, cycle, autoplay, playState, durationMs, onDone, goTo, label, className = '' }) {
  return (
    <div className={`flex gap-1.5 ${className}`}>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => goTo(index)}
          aria-label={`${label} ${index + 1}`}
          aria-current={index === current ? 'true' : undefined}
          className="group flex h-6 flex-1 cursor-pointer items-center"
        >
          <span className="relative h-[3px] w-full overflow-hidden rounded-pill bg-white/25 transition-colors duration-200 group-hover:bg-white/45">
            {index === current ? (
              <span
                key={cycle}
                className={`absolute inset-0 rounded-pill bg-white ${autoplay ? 'animate-banner-progress' : ''}`}
                style={{ '--progress-duration': `${durationMs}ms`, animationPlayState: playState }}
                onAnimationEnd={
                  autoplay
                    ? (event) => {
                        if (event.animationName === 'banner-progress') onDone()
                      }
                    : undefined
                }
              />
            ) : (
              index < current && <span className="absolute inset-0 rounded-pill bg-white/60" />
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
