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
  partnership: 'ink',
}

/** Thời gian mỗi slide đứng (ms) — cũng là thời lượng chấm đang chọn tô đầy. */
const SLIDE_MS = 6500

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

/**
 * Một khối hoạt động dạng carousel truyền thống (khối không bật `videoBanner` — Sự kiện):
 * thẻ trắng ảnh trái / chữ phải, hai nút ← → hai bên (điện thoại: hai bên hàng chấm),
 * chấm tròn bên dưới, tự chạy.
 *
 * Chấm đang chọn là BỘ ĐẾM GIỜ (`SlideProgress variant="dots"`): viên dài tô dần, đầy là
 * sang slide. Dừng khi rê chuột vào thẻ (`pauseOnHover` — thẻ nhỏ, rê vào là chủ ý đọc),
 * khi focus bàn phím, khi ra khỏi khung nhìn, hoặc khi bấm nút ⏸. Giảm chuyển động: không
 * tự chạy, xem `useSlideshow`.
 *
 * Các slide chồng cùng một ô grid và hoà vào nhau bằng opacity: thẻ cao bằng slide cao
 * nhất nên không nhảy chiều cao khi chuyển. Poster `object-contain` trên nền pastel —
 * nguồn trộn poster dọc với ảnh chụp ngang, `object-cover` sẽ cắt mất tiêu đề poster
 * hoặc mặt người.
 */
function ActivityCarousel({ group, items, from }) {
  const t = useT()
  const labels = t.activities
  const total = items.length
  const show = useSlideshow(total, { pauseOnHover: true })
  const { current, cycle, go, goTo, autoplay, playing, running, playState, regionProps } = show

  // Khối rỗng thì không dựng carousel.
  if (total === 0) return null

  // Thiếu nhãn (bản lịch sử cũ, database chưa áp migration 010) thì rơi về tiêu đề
  // section — vẫn đọc được, trang không sập.
  const label = (key) => labels[key] ?? labels.title
  const multiple = total > 1

  const previous = (
    <RoundButton label={label('previous')} onClick={() => go(-1)}>
      <ArrowLeftIcon />
    </RoundButton>
  )
  const next = (
    <RoundButton label={label('next')} onClick={() => go(1)}>
      <ArrowRightIcon />
    </RoundButton>
  )

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

      <Reveal from={from} className="mt-8 flex items-center gap-5">
        {/* Mũi tên hai bên thẻ từ md. Ẩn/hiện đặt trên DIV bọc, không truyền vào nút. */}
        {multiple && <div className="hidden md:block">{previous}</div>}

        <div
          {...regionProps}
          role="region"
          aria-roledescription="carousel"
          aria-label={group.title}
          className="grid min-w-0 flex-1 touch-pan-y select-none overflow-hidden rounded-card-sm border border-ash/60 bg-white outline-none focus-visible:ring-2 focus-visible:ring-signal md:rounded-card"
        >
          {items.map((item, index) => {
            const active = index === current
            return (
              <article
                key={item.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} / ${total}`}
                aria-hidden={active ? undefined : true}
                inert={!active}
                className={[
                  'col-start-1 row-start-1 grid transition-opacity duration-700 ease-[var(--ease-out-soft)] md:grid-cols-2',
                  active ? 'z-10 opacity-100' : 'opacity-0',
                ].join(' ')}
              >
                <div className="flex items-center justify-center bg-wash p-6 md:p-8">
                  {item.image && (
                    <img
                      src={item.image.url}
                      width={item.image.width}
                      height={item.image.height}
                      alt={labels.imageAlt.replace('{title}', item.title)}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="max-h-[280px] w-auto rounded-image-sm object-contain md:max-h-[340px]"
                    />
                  )}
                </div>

                <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* `kind` lạ vẫn hiện được nhãn: rơi về sắc mặc định và lấy chính
                        `kind` làm chữ, thay vì một nhãn trống không đọc được. */}
                    <Pill tone={KIND_TONES[item.kind] ?? 'outline'}>{labels.kinds[item.kind] ?? item.kind}</Pill>
                    {item.date && <Pill tone="outline">{item.date}</Pill>}
                  </div>
                  <h4 className="text-heading-sm md:text-heading-lg text-ink">{item.title}</h4>
                  <p className="text-body-sm text-graphite">{item.description}</p>
                </div>
              </article>
            )
          })}
        </div>

        {multiple && <div className="hidden md:block">{next}</div>}
      </Reveal>

      {/* Đọc slide mới khi người dùng tự chuyển; đang tự chạy thì im (mẫu carousel
          của WAI-ARIA) — đọc mỗi 6,5 giây là quấy rầy. */}
      <p className="sr-only" aria-live={running ? 'off' : 'polite'}>
        {current + 1} / {total} — {items[current].title}
      </p>

      {/* Điện thoại: hàng chấm riêng một dòng, bên dưới là ← ⏸ → (chen chung một hàng thì
          11 chấm gãy thành 2–3 dòng ở 320–390px). Từ md: chấm + nút dừng chung một hàng,
          mũi tên đã đứng hai bên thẻ. */}
      {multiple && (
        <Reveal className="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <SlideProgress
            variant="dots"
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

          <div className="flex items-center gap-3">
            <div className="md:hidden">{previous}</div>
            {/* Nút dừng bắt buộc (WCAG 2.2.2): nội dung tự chuyển hơn 5 giây. */}
            {autoplay && (
              <RoundButton label={label(playing ? 'pause' : 'play')} onClick={show.togglePlaying}>
                {playing ? <PauseIcon /> : <PlayIcon />}
              </RoundButton>
            )}
            <div className="md:hidden">{next}</div>
          </div>
        </Reveal>
      )}
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
              <ActivityCarousel {...props} />
            </div>
          )
        })}
      </div>
    </Section>
  )
}
