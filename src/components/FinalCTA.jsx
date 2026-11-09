import { useT } from '../i18n/context'
import { buttonsOf } from '../lib/actions'
import { ActionButton } from './ui/ActionButton'
import { Reveal } from './ui/Reveal'

// `id="register"` giữ nguyên dù form giờ là popup: footer và nội dung trong database
// có thể đang trỏ #register, và bộ kiểm neo quét id này từ mã nguồn.
export function FinalCTA() {
  const t = useT()

  return (
    <section id="register" className="pb-16 md:pb-24 lg:pb-30">
      <div className="container-page">
        {/* Bề mặt đảo màu — điểm nhấn tối duy nhất của trang, đặt ngay trước
            footer để đóng lại mạch đọc. */}
        <Reveal className="relative overflow-hidden rounded-card-sm md:rounded-card bg-navy px-6 py-16 text-center md:px-16 md:py-20">
          {/* Vệt sáng trang trí */}
          <span
            className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-pill bg-signal/25 blur-3xl"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-pill bg-orchid/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto flex max-w-[640px] flex-col items-center gap-6">
            <h2 className="text-heading-lg md:text-display text-white">{t.finalCta.title}</h2>
            <p className="text-subheading text-white/70">{t.finalCta.description}</p>

            {/* Nút do admin tạo (dashboard → Kêu gọi cuối trang → Nút). Nền tối: `surface="dark"`
                đổi nút chính thành nền trắng, nút phụ thành viền trắng. Id thống kê `final-…`. */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {buttonsOf(t.finalCta, 'finalCta').map((button) => (
                <ActionButton key={button.id} button={button} slot="final" source="final-cta" surface="dark" />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
