import { useMemo } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon } from '../assets/icons/Icons'
import { useSlideshow } from '../hooks/useSlideshow'
import { useT } from '../i18n/context'
import { ActivityVideoBanner } from './ActivityVideoBanner'
import { SlideProgress } from './SlideProgress'
import { Pill } from './ui/Pill'
import { Reveal } from './ui/Reveal'
import { RoundButton } from './ui/RoundButton'
import { Section, SectionHeading } from './ui/Section'

/** Mỗi loại hoạt động một sắc nhãn, để lướt qua là phân biệt được ngay. */
const KIND_TONES = {
  competition: 'signal',
  seminar: 'wash',
  workshop: 'outline',
  // Không dùng `ink`: viên thuốc đen chìm mất trên nền navy của banner.
  partnership: 'white',
}

/** Thời gian mỗi slide đứng (ms) — cũng là thời lượng vạch tiến trình chạy. */
const SLIDE_MS = 6500
/** Thời gian hai slide hoà vào nhau (ms) — khớp `duration-700` của slide. */
const FADE_MS = 700

/**
 * Khối nào chứa hoạt động nào — vẫn suy từ `kind`, KHÔNG có trường `group` trên
 * từng hoạt động.
 *
 * Section Khóa học buộc phải có `courses.items[].group` vì chuyên mục của trường
 * không suy ra được từ trường nào khác. Ở đây thì `kind` ĐÃ LÀ thứ quyết định:
 * "cuộc thi" đúng bằng `kind: 'competition'`. Thêm một trường `group` song song
 * trên từng mục chỉ là chép lại thông tin đã có, và sớm muộn hai chỗ sẽ lệch nhau.
 *
 * Chỗ đã đổi: danh sách `kind` của mỗi khối chuyển từ bảng viết cứng ở đây sang
 * `activities.groups[].kinds` trong i18n. Đó vẫn là **một danh sách cho mỗi khối**
 * chứ không phải một trường cho mỗi mục, nên lập luận trên còn nguyên — nhưng giờ
 * thêm một `kind` mới là sửa đúng chỗ dữ liệu, không phải sửa component.
 *
 * Trước đây `kind` lạ tra ra `undefined` và hoạt động **biến mất khỏi trang không
 * một lời cảnh báo** — kiểu lỗi tệ nhất, vì không có gì hỏng để lần theo. Giờ nó
 * rơi vào khối cuối: đặt sai chỗ thì nhìn thấy được và sửa được.
 */
function groupActivities(groups, items) {
  const buckets = new Map(groups.map((group) => [group.id, []]))
  const groupOfKind = new Map()
  for (const group of groups) {
    for (const kind of group.kinds ?? []) groupOfKind.set(kind, group.id)
  }

  const fallback = groups.at(-1)?.id
  for (const item of items) {
    const target = groupOfKind.get(item.kind) ?? fallback
    buckets.get(target)?.push(item)
  }
  return buckets
}

/** Biến CSS cho một lớp Ken Burns: phóng từ `from` tới `to` suốt slide + lúc mờ đi. */
const kenBurns = (from, to, playState) => ({
  '--kb-from': from,
  '--kb-to': to,
  '--kb-duration': `${SLIDE_MS + FADE_MS}ms`,
  animationPlayState: playState,
})

/**
 * Một khối hoạt động dạng banner ảnh tự chạy (khối không bật `videoBanner`).
 *
 * Mỗi slide ba lớp: nền là CHÍNH ảnh đó phóng to + làm mờ (`object-cover` được phép cắt
 * vì chỉ là nền, cùng URL nên không tải thêm), lớp phủ navy giữ chữ trắng đủ tương phản
 * trên mọi ảnh, và nội dung — poster vẫn `object-contain` (poster dọc 0.7 mà cover là
 * mất tiêu đề). Các slide chồng cùng một ô grid nên banner cao bằng slide cao nhất,
 * không phải cắt mô tả.
 *
 * Tự chạy / tạm dừng / vuốt / giảm chuyển động: xem `useSlideshow`. Bộ đếm giờ là vạch
 * tiến trình (`SlideProgress`).
 */
function ActivityBanner({ group, items, from }) {
  const t = useT()
  const labels = t.activities
  const total = items.length
  const show = useSlideshow(total)
  const { current, cycle, stamps, go, goTo, autoplay, playing, running, playState, regionProps } = show

  // Khối rỗng thì không dựng banner.
  if (total === 0) return null

  // Thiếu nhãn (bản lịch sử cũ, database chưa áp migration 010) thì rơi về tiêu đề
  // section — vẫn đọc được, trang không sập.
  const label = (key) => labels[key] ?? labels.title
  const zoomClass = autoplay ? 'animate-ken-burns' : ''

  return (
    // Neo suy từ `group.id`: menu ở navbar trỏ thẳng vào `#events`.
    <div id={group.id} className="flex flex-col">
      {/* h3: nằm dưới h2 của section, và trên h4 là tên từng hoạt động. */}
      <Reveal className="flex flex-col items-center gap-3 text-center">
        <span className="flex flex-wrap items-center justify-center gap-3">
          <h3 className="text-heading-sm md:text-heading-lg text-ink">{group.title}</h3>
          <Pill tone="outline">{total}</Pill>
        </span>
        <p className="max-w-[620px] text-body-sm text-graphite">{group.description}</p>
      </Reveal>

      <Reveal from={from} className="mt-8">
        <div
          {...regionProps}
          role="region"
          aria-roledescription="carousel"
          aria-label={group.title}
          className="relative grid touch-pan-y select-none overflow-hidden rounded-card-sm bg-navy text-white outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 md:rounded-card"
        >
          {items.map((item, index) => {
            const active = index === current
            const stamp = stamps[index] ?? 0
            return (
              <div
                key={item.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${total}`}
                aria-hidden={active ? undefined : true}
                inert={!active}
                className={[
                  // `flex flex-col` + nội dung `flex-1`: slide ngắn vẫn kéo đủ chiều cao
                  // banner (= slide cao nhất) và căn giữa, không dồn lên mép trên.
                  'relative col-start-1 row-start-1 flex flex-col transition-opacity duration-700 ease-[var(--ease-out-soft)]',
                  active ? 'z-10 opacity-100' : 'opacity-0',
                ].join(' ')}
              >
                {item.image && (
                  <div
                    key={`bg-${stamp}`}
                    aria-hidden="true"
                    className={`absolute inset-0 ${zoomClass}`}
                    style={kenBurns(1.15, 1.3, playState)}
                  >
                    <img
                      src={item.image.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="size-full object-cover blur-2xl"
                    />
                  </div>
                )}
                <div aria-hidden="true" className="absolute inset-0 bg-navy/85" />

                <div className="relative grid flex-1 content-center items-center gap-6 px-6 pt-8 pb-14 md:grid-cols-2 md:gap-10 md:px-14 md:pt-12 md:pb-18">
                  <div className="flex items-center justify-center">
                    {item.image && (
                      <img
                        key={`fg-${stamp}`}
                        src={item.image.url}
                        width={item.image.width}
                        height={item.image.height}
                        alt={labels.imageAlt.replace('{title}', item.title)}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className={`max-h-[220px] w-auto rounded-image-sm object-contain md:max-h-[360px] ${zoomClass}`}
                        style={kenBurns(1, 1.05, playState)}
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* `kind` lạ vẫn hiện được nhãn: rơi về sắc mặc định và lấy chính
                          `kind` làm chữ, thay vì một nhãn trống không đọc được. */}
                      <Pill tone={KIND_TONES[item.kind] ?? 'outline'}>
                        {labels.kinds[item.kind] ?? item.kind}
                      </Pill>
                      {item.date && <Pill tone="white">{item.date}</Pill>}
                    </div>
                    <h4 className="text-heading-sm md:text-heading-lg text-white">{item.title}</h4>
                    <p className="text-body-sm text-white/80">{item.description}</p>
                  </div>
                </div>
              </div>
            )
          })}

          {total > 1 && (
            <SlideProgress
              className="absolute inset-x-0 bottom-0 z-20 px-8 pb-3 md:px-16 md:pb-5"
              items={items}
              current={current}
              cycle={cycle}
              autoplay={autoplay}
              playState={playState}
              durationMs={SLIDE_MS}
              onDone={() => go(1)}
              goTo={goTo}
              label={label('goTo')}
            />
          )}
        </div>

        {/* Đọc slide mới khi người dùng tự chuyển; đang tự chạy thì im (mẫu carousel
            của WAI-ARIA) — đọc mỗi 6,5 giây là quấy rầy. */}
        <p className="sr-only" aria-live={running ? 'off' : 'polite'}>
          {current + 1} / {total} — {items[current].title}
        </p>

        {total > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <RoundButton label={label('previous')} onClick={() => go(-1)}>
              <ArrowLeftIcon />
            </RoundButton>
            {/* Nút dừng bắt buộc (WCAG 2.2.2): nội dung tự chuyển động quá 5 giây. */}
            {autoplay && (
              <RoundButton label={label(playing ? 'pause' : 'play')} onClick={show.togglePlaying}>
                {playing ? <PauseIcon /> : <PlayIcon />}
              </RoundButton>
            )}
            <RoundButton label={label('next')} onClick={() => go(1)}>
              <ArrowRightIcon />
            </RoundButton>
          </div>
        )}
      </Reveal>
    </div>
  )
}

export function Activities() {
  const t = useT()

  // Gom hoạt động về đúng khối một lần, thay vì lọc lại ở mỗi lần render khối.
  const byGroup = useMemo(
    () => groupActivities(t.activities.groups, t.activities.items),
    [t.activities.groups, t.activities.items],
  )

  return (
    // `contained={false}`: banner video tràn hết bề ngang màn hình, nên phần còn lại tự
    // đặt `container-page` của mình.
    <Section id="activities" contained={false}>
      <div className="container-page">
        <SectionHeading
          eyebrow={t.activities.eyebrow}
          title={t.activities.title}
          description={t.activities.description}
          align="center"
          from="left"
        />
      </div>

      {/* Hai khối trượt vào ngược chiều nhau, và ngược chiều tiêu đề section. */}
      <div className="mt-14 flex flex-col gap-16 md:gap-20">
        {t.activities.groups.map((group, index) => {
          const props = {
            group,
            items: byGroup.get(group.id) ?? [],
            from: index % 2 === 0 ? 'right' : 'left',
          }
          return group.videoBanner ? (
            <ActivityVideoBanner key={group.id} {...props} />
          ) : (
            <div key={group.id} className="container-page">
              <ActivityBanner {...props} />
            </div>
          )
        })}
      </div>
    </Section>
  )
}
