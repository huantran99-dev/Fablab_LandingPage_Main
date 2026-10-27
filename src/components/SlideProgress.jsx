/**
 * Chỉ báo slide của carousel tự chạy, đồng thời là nút chuyển tới từng slide và là BỘ ĐẾM
 * GIỜ: phần tô của slide đang chọn chạy `animate-banner-progress`, hết animation
 * (`animationend`) là `onDone`. Tạm dừng = `animation-play-state: paused`, không có timer
 * nào phải dọn. `key={cycle}` để mỗi lần chuyển (kể cả bấm tay) chạy lại từ đầu. Không tự
 * chạy (`autoplay` false, gồm cả khi giảm chuyển động) thì phần tô đứng đầy, không animation.
 *
 * Hai kiểu:
 * - `bars` (mặc định): vạch ngang chia đều bề rộng, màu trắng — trên nền tối của banner.
 * - `dots`: chấm tròn kiểu carousel truyền thống, chấm đang chọn là viên dài tô dần màu
 *   `signal` — trên nền trắng.
 *
 * Vùng bấm luôn cao 24px dù phần nhìn thấy chỉ 3–8px.
 */
const STYLES = {
  bars: {
    root: 'flex gap-1.5',
    button: 'group flex h-6 flex-1 cursor-pointer items-center',
    track: () => 'relative h-[3px] w-full overflow-hidden rounded-pill bg-white/25 transition-colors duration-200 group-hover:bg-white/45',
    fill: 'bg-white',
    done: 'bg-white/60',
  },
  dots: {
    root: 'flex flex-wrap items-center justify-center gap-1',
    button: 'group flex h-6 cursor-pointer items-center px-1',
    track: (active) =>
      [
        'relative h-2 overflow-hidden rounded-pill transition-all duration-300 ease-[var(--ease-out-soft)]',
        active ? 'w-7 bg-ash' : 'w-2 bg-ash group-hover:bg-steel',
      ].join(' '),
    fill: 'bg-signal',
    done: null,
  },
}

export function SlideProgress({ items, current, cycle, autoplay, playState, durationMs, onDone, goTo, label, variant = 'bars', className = '' }) {
  const style = STYLES[variant] ?? STYLES.bars

  return (
    <div className={`${style.root} ${className}`}>
      {items.map((item, index) => {
        const active = index === current
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`${label} ${index + 1}`}
            aria-current={active ? 'true' : undefined}
            className={style.button}
          >
            <span className={style.track(active)}>
              {active ? (
                <span
                  key={cycle}
                  className={`absolute inset-0 rounded-pill ${style.fill} ${autoplay ? 'animate-banner-progress' : ''}`}
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
                style.done && index < current && <span className={`absolute inset-0 rounded-pill ${style.done}`} />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
