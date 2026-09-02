import { ArrowRightIcon } from '../assets/icons/Icons'
import { TEAM_IMAGES, TEAM_IMAGE_SIZE } from '../assets/images'
import { useT } from '../i18n/context'
import { initialsOf } from '../lib/initials'
import { Reveal, RevealGroup } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

/** Sắc nền luân phiên cho avatar chữ cái, để bốn ô không ảnh không bị đơn điệu. */
const INITIAL_TONES = ['bg-signal', 'bg-ember', 'bg-leaf']

/**
 * Avatar thành viên: ảnh thật nếu có, còn không thì chữ cái đầu.
 *
 * Trang gốc của trường để ảnh mẫu cho 4/10 người, nên ở đây họ không có ảnh.
 * Dựng chữ cái đầu là cách trung thực duy nhất — gán ảnh người khác hoặc ảnh
 * stock vào một người có thật thì thành bịa danh tính.
 */
function Avatar({ member, index, photoAlt }) {
  const photo = TEAM_IMAGES[member.id]

  if (photo) {
    return (
      <img
        src={photo}
        width={TEAM_IMAGE_SIZE.width}
        height={TEAM_IMAGE_SIZE.height}
        alt={photoAlt.replace('{name}', member.name)}
        loading="lazy"
        decoding="async"
        className="size-20 rounded-pill object-cover md:size-24"
      />
    )
  }

  return (
    <span
      className={`inline-flex size-20 items-center justify-center rounded-pill font-display text-heading-sm font-bold text-white md:size-24 ${INITIAL_TONES[index % INITIAL_TONES.length]}`}
      aria-hidden="true"
    >
      {initialsOf(member.name)}
    </span>
  )
}

export function Team() {
  const t = useT()

  return (
    <Section id="team">
      <SectionHeading
        eyebrow={t.team.eyebrow}
        title={t.team.title}
        description={t.team.description}
        align="center"
        from="left"
      />

      {/* Hai hàng năm người ở desktop, hai cột ở mobile — mười người chia chẵn ở
          cả hai bề ngang nên không có ô lẻ nào đứng trơ một mình. */}
      <RevealGroup
        as="ul"
        from="right"
        className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-5"
      >
        {t.team.members.map((member, index) => (
          <li key={member.id} className="flex flex-col items-center gap-4 text-center">
            <Avatar member={member} index={index} photoAlt={t.team.photoAlt} />
            <span className="flex flex-col gap-1">
              <span className="text-body-sm font-medium text-ink">{member.name}</span>
              <span className="text-caption text-steel">{member.role}</span>
            </span>
          </li>
        ))}
      </RevealGroup>

      <Reveal className="mt-12 flex justify-center">
        <a
          href={t.team.joinHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-body-sm font-medium text-signal transition-[gap] duration-200 ease-[var(--ease-out-soft)] hover:gap-3"
        >
          {t.team.joinCta}
          <ArrowRightIcon size={16} />
        </a>
      </Reveal>
    </Section>
  )
}
