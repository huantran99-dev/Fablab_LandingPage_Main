import { ArrowRightIcon } from '../assets/icons/Icons'
import { HERO_IMAGE } from '../assets/images'
import { useT } from '../i18n/context'
import { Button } from './ui/Button'
import { Pill } from './ui/Pill'

export function Hero() {
  const t = useT()

  return (
    <section id="top" className="pt-10 pb-16 md:pt-16 md:pb-24 lg:pb-28">
      <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        <div className="flex flex-col items-start gap-6 animate-rise">
          <Pill>{t.hero.eyebrow}</Pill>

          <h1 className="text-display-lg text-ink">{t.hero.title}</h1>

          <p className="text-subheading text-graphite max-w-[540px]">
            {t.hero.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button href="#courses" size="lg">
              {t.hero.primaryCta}
              <ArrowRightIcon />
            </Button>
            <Button href="#facilities" variant="outlined" size="lg">
              {t.hero.secondaryCta}
            </Button>
          </div>
        </div>

        {/* Khung ảnh chính: bo góc lớn + shadow ba lớp, đúng cách style reference
            xử lý khối hình ảnh chính của trang. */}
        <div className="relative animate-rise [animation-delay:120ms]">
          <div className="overflow-hidden rounded-image-sm md:rounded-image shadow-ambient">
            {/* Ảnh nằm trên màn hình đầu tiên nên tải sớm và ưu tiên cao — không
                lazy-load, kẻo đẩy chậm LCP của cả trang. `width`/`height` thật
                giữ chỗ trước khi ảnh về, tránh giật layout. */}
            <img
              src={HERO_IMAGE.src}
              width={HERO_IMAGE.width}
              height={HERO_IMAGE.height}
              alt={t.hero.imageAlt}
              fetchPriority="high"
              decoding="async"
              className="block aspect-[4/3] w-full object-cover"
            />
          </div>

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
