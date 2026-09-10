import { useMemo } from 'react'
import { ArrowLeftIcon, ArrowRightIcon } from '../assets/icons/Icons'
import { ACTIVITY_IMAGES } from '../assets/images'
import { useCarousel } from '../hooks/useCarousel'
import { useT } from '../i18n/context'
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
 * Một khối hoạt động: tiêu đề phụ + carousel của riêng nó.
 *
 * Mỗi khối gọi `useCarousel` riêng nên hai carousel chạy độc lập — lật khối này
 * không kéo theo khối kia.
 */
function ActivityCarousel({ group, items, from }) {
  const t = useT()
  const { current, go, goTo } = useCarousel(items.length)
  const active = items[current]

  // Khối rỗng thì không dựng carousel, kẻo `active` là undefined.
  if (!active) return null

  return (
    // Neo suy từ `group.id`: menu ở navbar trỏ thẳng vào `#competitions` và
    // `#events`.
    <div id={group.id} className="flex flex-col">
      {/* h3: nằm dưới h2 của section, và trên h4 là tên từng hoạt động. */}
      <Reveal className="flex flex-col items-center gap-3 text-center">
        <span className="flex flex-wrap items-center justify-center gap-3">
          <h3 className="text-heading-sm md:text-heading-lg text-ink">{group.title}</h3>
          <Pill tone="outline">{items.length}</Pill>
        </span>
        <p className="max-w-[620px] text-body-sm text-graphite">{group.description}</p>
      </Reveal>

      <Reveal from={from} className="mt-8 flex items-center gap-5">
        <div className="hidden md:block">
          <RoundButton label={t.activities.previous} onClick={() => go(-1)}>
            <ArrowLeftIcon />
          </RoundButton>
        </div>

        <article
          className="flex-1 overflow-hidden rounded-card-sm md:rounded-card border border-ash/60 bg-white"
          aria-live="polite"
        >
          <div className="grid md:grid-cols-2">
            {/* `object-contain` trên nền pastel chứ không `object-cover`: nguồn
                trộn poster dọc với ảnh chụp ngang, cover sẽ cắt mất tiêu đề
                poster hoặc mặt người. */}
            <div className="flex items-center justify-center bg-wash p-6 md:p-8">
              <img
                key={active.id}
                src={ACTIVITY_IMAGES[active.id]}
                alt={t.activities.imageAlt.replace('{title}', active.title)}
                loading="lazy"
                decoding="async"
                className="max-h-[280px] w-auto rounded-image-sm object-contain md:max-h-[340px]"
              />
            </div>

            <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-2">
                {/* `kind` lạ vẫn hiện được nhãn: rơi về sắc mặc định và lấy chính
                    `kind` làm chữ, thay vì một nhãn trống không đọc được. */}
                <Pill tone={KIND_TONES[active.kind] ?? 'outline'}>
                  {t.activities.kinds[active.kind] ?? active.kind}
                </Pill>
                {active.date && <Pill tone="outline">{active.date}</Pill>}
              </div>

              <h4 className="text-heading-sm md:text-heading-lg text-ink">{active.title}</h4>
              <p className="text-body-sm text-graphite">{active.description}</p>
            </div>
          </div>
        </article>

        <div className="hidden md:block">
          <RoundButton label={t.activities.next} onClick={() => go(1)}>
            <ArrowRightIcon />
          </RoundButton>
        </div>
      </Reveal>

      <Reveal className="mt-8 flex items-center justify-center gap-5">
        <div className="md:hidden">
          <RoundButton label={t.activities.previous} onClick={() => go(-1)}>
            <ArrowLeftIcon />
          </RoundButton>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`${t.activities.goTo} ${index + 1}`}
              aria-current={index === current ? 'true' : undefined}
              className={[
                'h-2 cursor-pointer rounded-pill transition-all duration-300 ease-[var(--ease-out-soft)]',
                index === current ? 'w-7 bg-signal' : 'w-2 bg-ash hover:bg-steel',
              ].join(' ')}
            />
          ))}
        </div>

        <div className="md:hidden">
          <RoundButton label={t.activities.next} onClick={() => go(1)}>
            <ArrowRightIcon />
          </RoundButton>
        </div>
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
    <Section id="activities">
      <SectionHeading
        eyebrow={t.activities.eyebrow}
        title={t.activities.title}
        description={t.activities.description}
        align="center"
        from="left"
      />

      {/* Hai khối trượt vào ngược chiều nhau, và ngược chiều tiêu đề section. */}
      <div className="mt-14 flex flex-col gap-16 md:gap-20">
        {t.activities.groups.map((group, index) => (
          <ActivityCarousel
            key={group.id}
            group={group}
            items={byGroup.get(group.id) ?? []}
            from={index % 2 === 0 ? 'right' : 'left'}
          />
        ))}
      </div>
    </Section>
  )
}
