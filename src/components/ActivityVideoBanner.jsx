import { useEffect, useRef, useState } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon } from '../assets/icons/Icons'
import { useSlideshow } from '../hooks/useSlideshow'
import { useT } from '../i18n/context'
import { SlideProgress } from './SlideProgress'
import { Pill } from './ui/Pill'
import { Reveal } from './ui/Reveal'
import { RoundButton } from './ui/RoundButton'

/** Slide không có video (hoặc video ngắn) đứng tối thiểu chừng này (ms). */
const MIN_SLIDE_MS = 8000
/** Video dài hơn thì vẫn chuyển sau chừng này (ms) — banner, không phải trình phát phim. */
const MAX_SLIDE_MS = 20000
const FADE_MS = 700

/**
 * Người xem bật tiết kiệm dữ liệu → không TỰ tải video (vẫn bấm phát được). Đọc một lần:
 * thiết lập này hiếm khi đổi giữa phiên, và đổi thì tải lại trang là đủ.
 */
const SAVE_DATA = typeof navigator !== 'undefined' && navigator.connection?.saveData === true

/** Slide đứng bao lâu: theo độ dài video, kẹp trong [MIN, MAX]. */
function slideDuration(item) {
  const seconds = item?.video?.duration
  if (!seconds) return MIN_SLIDE_MS
  return Math.min(MAX_SLIDE_MS, Math.max(MIN_SLIDE_MS, Math.round(seconds * 1000)))
}

/**
 * Video nền của một slide. Tắt tiếng, lặp, `playsInline` (iPhone mới tự phát), không bao
 * giờ có điều khiển — là hình nền, `aria-hidden`.
 *
 * `preload="none"`: chưa tới lượt / chưa cuộn tới thì không tải byte nào. Phát/dừng điều
 * khiển bằng effect theo `play`; trình duyệt từ chối tự phát (iPhone chế độ tiết kiệm pin)
 * thì `play()` bị từ chối — nuốt lỗi, ảnh nền phía dưới vẫn còn đó.
 *
 * Hiện dần khi khung hình đầu đã chạy (`playing`), để không chớp một ô đen trên ảnh nền.
 */
function BannerVideo({ video, play }) {
  const ref = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (play) {
      // Gán thuộc tính (không chỉ attribute): Safari iOS chỉ tự phát khi `muted` là thật.
      element.muted = true
      element.play()?.catch(() => {})
    } else {
      element.pause()
    }
  }, [play])

  return (
    <video
      ref={ref}
      src={video.url}
      width={video.width}
      height={video.height}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      tabIndex={-1}
      aria-hidden="true"
      onPlaying={() => setReady(true)}
      className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}

/**
 * Banner video tràn màn hình cho khối có `videoBanner: true` (Cuộc thi).
 *
 * Mỗi cuộc thi một video nền (gắn ở dashboard, mục "Video nền"); chưa có video thì nền là
 * poster phóng to + làm mờ + Ken Burns như banner ảnh. Lớp phủ tối giữ chữ trắng đọc được
 * trên mọi khung hình — trên điện thoại phủ đều (chữ chiếm cả bề ngang), từ `md` trở lên
 * là dải chuyển từ trái (chỗ có chữ) sang phải (chỗ để video thở).
 *
 * Tràn màn hình: render NGOÀI `container-page` (Section `contained={false}`), nội dung bên
 * trong tự đặt lại container để thẳng hàng với phần còn lại của trang.
 *
 * Chỉ có chữ trên lớp phủ: không poster bên phải, không tiêu đề khối nhìn thấy được (h3
 * `sr-only`) — người dùng yêu cầu bỏ cả hai (2026-10-23).
 *
 * Nút dừng là bắt buộc (WCAG 2.2.2) và dừng CẢ việc chuyển slide lẫn video. Giảm chuyển
 * động / tiết kiệm dữ liệu: video không tự phát, bấm "Phát" mới chạy. KHÔNG dừng khi rê
 * chuột (`pauseOnHover` mặc định tắt): banner gần trọn màn hình nên chuột hầu như luôn ở
 * trên nó, và bản đầu trông như không tự chạy.
 */
export function ActivityVideoBanner({ group, items, from }) {
  const t = useT()
  const labels = t.activities
  const total = items.length
  const show = useSlideshow(total, { playByDefault: !SAVE_DATA })
  const { current, cycle, stamps, go, goTo, autoplay, playing, running, playState, inView, regionProps } = show

  if (total === 0) return null

  const label = (key) => labels[key] ?? labels.title
  const hasVideo = items.some((item) => item.video?.url)
  const active = items[current]
  const durationMs = slideDuration(active)

  return (
    // Neo suy từ `group.id`: menu ở navbar trỏ thẳng vào `#competitions`.
    <div id={group.id}>
      <Reveal from={from}>
        <div
          {...regionProps}
          role="region"
          aria-roledescription="carousel"
          aria-label={group.title}
          className="relative isolate grid min-h-[min(100svh,760px)] touch-pan-y select-none overflow-hidden bg-ink text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal"
        >
          {/* Nền: mỗi slide một lớp, hoà vào nhau khi chuyển. */}
          {items.map((item, index) => {
            const isActive = index === current
            const stamp = stamps[index] ?? 0
            const kenBurns = autoplay && playing && !item.video?.url
            return (
              <div
                key={item.id}
                aria-hidden="true"
                className={`absolute inset-0 transition-opacity duration-700 ease-[var(--ease-out-soft)] ${isActive ? 'opacity-100' : 'opacity-0'}`}
              >
                {item.image && (
                  <div
                    key={`bg-${stamp}`}
                    className={`absolute inset-0 ${kenBurns ? 'animate-ken-burns' : ''}`}
                    style={{
                      '--kb-from': 1.1,
                      '--kb-to': 1.22,
                      '--kb-duration': `${slideDuration(item) + FADE_MS}ms`,
                      animationPlayState: playState,
                    }}
                  >
                    <img
                      src={item.image.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className={`size-full object-cover ${item.video?.url ? 'blur-sm' : 'blur-xl'}`}
                    />
                  </div>
                )}
                {item.video?.url && <BannerVideo video={item.video} play={isActive && playing && inView} />}
              </div>
            )
          })}

          {/* Lớp phủ: điện thoại dải dọc (chữ dồn xuống đáy, nửa trên để video lộ ra), từ
              md dải ngang (chữ bên trái). Chỗ có chữ luôn ≥ ~60% tối. Không bắt sự kiện. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-linear-to-b from-ink/20 via-ink/65 to-ink/90 md:bg-linear-to-r md:from-ink/90 md:via-ink/65 md:to-ink/15"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-ink/80 to-transparent" />

          <div className="container-page relative flex flex-col justify-end gap-10 py-14 md:justify-center md:py-20">
            {/* h3 ẨN theo yêu cầu người dùng (banner tự nói lên nó là cuộc thi), nhưng VẪN
                trong DOM: giữ thứ bậc h2 → h3 → h4 cho trình đọc màn hình. */}
            <h3 className="sr-only">{group.title}</h3>

            <div className="grid">
              {items.map((item, index) => {
                const isActive = index === current
                return (
                  <div
                    key={item.id}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} / ${total}`}
                    aria-hidden={isActive ? undefined : true}
                    inert={!isActive}
                    className={[
                      'col-start-1 row-start-1 flex items-center transition-opacity duration-700 ease-[var(--ease-out-soft)]',
                      isActive ? 'opacity-100' : 'opacity-0',
                    ].join(' ')}
                  >
                    <div className="flex max-w-[620px] flex-col gap-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone="signal">{labels.kinds[item.kind] ?? item.kind}</Pill>
                        {item.date && <Pill tone="white">{item.date}</Pill>}
                      </div>
                      <h4 className="text-heading-lg md:text-display text-white">{item.title}</h4>
                      <p className="text-body-sm md:text-subheading text-white/85">{item.description}</p>
                    </div>
                    {/* Không còn poster bên phải (người dùng yêu cầu ẩn, 2026-10-23). Poster
                        chỉ còn làm nền mờ khi cuộc thi chưa có video. */}
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
              {(total > 1 || hasVideo) && (
                <div className="flex items-center gap-3">
                  {total > 1 && (
                    <RoundButton label={label('previous')} onClick={() => go(-1)}>
                      <ArrowLeftIcon />
                    </RoundButton>
                  )}
                  {/* Nút dừng bắt buộc (WCAG 2.2.2): dừng cả chuyển slide lẫn video. */}
                  {(autoplay || hasVideo) && (
                    <RoundButton label={label(playing ? 'pause' : 'play')} onClick={show.togglePlaying}>
                      {playing ? <PauseIcon /> : <PlayIcon />}
                    </RoundButton>
                  )}
                  {total > 1 && (
                    <RoundButton label={label('next')} onClick={() => go(1)}>
                      <ArrowRightIcon />
                    </RoundButton>
                  )}
                </div>
              )}
              {total > 1 && (
                <SlideProgress
                  className="md:max-w-[420px] md:flex-1"
                  items={items}
                  current={current}
                  cycle={cycle}
                  autoplay={autoplay}
                  playState={playState}
                  durationMs={durationMs}
                  onDone={() => go(1)}
                  goTo={goTo}
                  label={label('goTo')}
                />
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Đọc slide mới khi người dùng tự chuyển; đang tự chạy thì im (mẫu carousel
          WAI-ARIA) — đọc mỗi lần tự chuyển là quấy rầy. */}
      <p className="sr-only" aria-live={running ? 'off' : 'polite'}>
        {current + 1} / {total} — {active.title}
      </p>
    </div>
  )
}
