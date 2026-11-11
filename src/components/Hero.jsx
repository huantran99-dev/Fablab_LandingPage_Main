import { useT } from '../i18n/context'
import { buttonsOf } from '../lib/actions'
import { useActiveSeason } from '../lib/season'
import { ActionButton } from './ui/ActionButton'
import { Pill } from './ui/Pill'

export function Hero() {
  const t = useT()
  // Ảnh trang trí của sự kiện mùa đang chạy (cành mai, đèn lồng…), do admin tải lên.
  const decor = useActiveSeason()?.decor

  return (
    <section id="top" className="pt-10 pb-16 md:pt-16 md:pb-24 lg:pb-28">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        <div className="flex flex-col items-start gap-6 animate-rise">
          <Pill size="lg">{t.hero.eyebrow}</Pill>

          <h1 className="text-display-lg text-ink">{t.hero.title}</h1>

          <p className="text-subheading text-graphite max-w-[540px]">
            {t.hero.description}
          </p>

          {/* Nút do admin tạo (dashboard → Hero → Nút): link / form / popup / form đăng ký.
              Nút không còn đích (khối đã tắt, form đóng nhận…) tự ẩn trong ActionButton. */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {buttonsOf(t.hero, 'hero').map((button) => (
              <ActionButton key={button.id} button={button} slot="hero" source="hero" />
            ))}
          </div>
        </div>

        {/* Khung ảnh chính: bo góc lớn + shadow ba lớp, đúng cách style reference
            xử lý khối hình ảnh chính của trang. */}
        <div className="relative animate-rise [animation-delay:120ms]">
          <div className="overflow-hidden rounded-image-sm md:rounded-image shadow-ambient">
            {/* Ảnh nằm trên màn hình đầu tiên nên tải sớm và ưu tiên cao — không
                lazy-load, kẻo đẩy chậm LCP của cả trang. `width`/`height` thật
                giữ chỗ trước khi ảnh về, tránh giật layout. */}
            {t.hero.image && (
              <img
                src={t.hero.image.url}
                width={t.hero.image.width}
                height={t.hero.image.height}
                alt={t.hero.imageAlt}
                fetchPriority="high"
                decoding="async"
                className="block aspect-[4/3] w-full object-cover"
              />
            )}
          </div>

          {/* Trang trí sự kiện mùa: đè lên góc trên-phải khung ảnh. Định vị bằng top/right
              (không dùng translate — đừng tranh thuộc tính biến hình với animation của khối).
              Lệch ra ngoài khung ít hơn lề trong của container-page (16px / 32px), nên
              không bao giờ đẩy trang tràn ngang trên điện thoại. Trang trí thuần nên
              `alt=""` + `aria-hidden`; nằm trên màn hình đầu nên không lazy-load. */}
          {decor && (
            <img
              src={decor.url}
              width={decor.width}
              height={decor.height}
              alt=""
              aria-hidden="true"
              decoding="async"
              className="pointer-events-none absolute -top-8 -right-3 z-10 h-auto w-28 object-contain md:-top-12 md:-right-6 md:w-44"
            />
          )}

          {/* Badge nổi trên khung hình */}
          <div className="absolute -bottom-4 left-4 md:left-8 flex flex-wrap gap-2">
            {t.hero.floatingBadges.map((badge) => (
              <Pill key={badge.id} tone="white" className="shadow-ambient">
                <span className="size-1.5 rounded-pill bg-leaf" aria-hidden="true" />
                {badge.label}
              </Pill>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
