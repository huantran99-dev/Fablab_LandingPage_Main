import { PARTNER_LOGOS } from '../assets/images'
import { useT } from '../i18n/context'
import { Reveal } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

/**
 * Một mục trên dải: logo nếu có, còn không thì tên viết chữ.
 *
 * Đối tác không có logo trên site của trường thì hiển thị bằng chữ — đi tìm logo
 * ở nguồn khác rồi gán vào là gán sai nhận diện của một tổ chức có thật.
 */
function PartnerItem({ partner, logoAlt }) {
  const logo = PARTNER_LOGOS[partner.id]

  if (!logo) {
    return (
      <span className="flex h-16 shrink-0 items-center px-8 text-heading-sm text-steel">
        {partner.name}
      </span>
    )
  }

  return (
    <span className="flex h-16 shrink-0 items-center px-8">
      <img
        src={logo.src}
        width={logo.width}
        height={logo.height}
        alt={logoAlt.replace('{name}', partner.name)}
        loading="lazy"
        decoding="async"
        className="max-h-16 w-auto object-contain"
      />
    </span>
  )
}

export function Partners() {
  const t = useT()
  const items = t.partners.items

  return (
    <Section id="partners">
      <SectionHeading
        eyebrow={t.partners.eyebrow}
        title={t.partners.title}
        description={t.partners.description}
        align="center"
        from="right"
      />

      <Reveal from="left" className="mt-14">
        {/* `overflow-hidden` cắt phần track thò ra hai bên; mặt nạ gradient làm
            hai mép mờ dần để dải trông như chạy vô tận thay vì bị cắt cụt. */}
        <div
          className="relative overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div
            className="marquee-track flex w-max items-center"
            style={{ '--marquee-duration': `${items.length * 7}s` }}
          >
            {/* Danh sách lặp đúng hai lần: track trượt -50% là quay về đúng chỗ
                cũ, nên vòng lặp không có mối nối. Bản sao thứ hai chỉ để trang
                trí nên ẩn khỏi screen reader. */}
            {items.map((partner) => (
              <PartnerItem key={partner.id} partner={partner} logoAlt={t.partners.logoAlt} />
            ))}
            <span className="flex" aria-hidden="true">
              {items.map((partner) => (
                <PartnerItem key={partner.id} partner={partner} logoAlt={t.partners.logoAlt} />
              ))}
            </span>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
