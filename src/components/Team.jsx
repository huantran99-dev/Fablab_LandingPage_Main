import { useT } from '../i18n/context'
import { initialsOf } from '../lib/initials'
import { Pill } from './ui/Pill'
import { Reveal } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

/** Sắc nền luân phiên cho avatar chữ cái, để các ô không ảnh không bị đơn điệu. */
const INITIAL_TONES = ['bg-signal', 'bg-ember', 'bg-leaf']

/**
 * Hai cỡ avatar: thẻ trên dải chạy, và thẻ riêng của người phụ trách.
 *
 * Ảnh nguồn 240px, nên cỡ lớn nhất (112px) vẫn còn dư độ phân giải cho màn hình
 * mật độ điểm ảnh gấp đôi. Phóng to nữa là bắt đầu mềm nét — phải xuất lại ảnh
 * trước, đừng chỉ đổi con số ở đây.
 */
const AVATAR_SIZES = {
  sm: { box: 'size-16 sm:size-20', text: 'text-subheading' },
  lg: { box: 'size-24 sm:size-28', text: 'text-heading-sm' },
}

/** Mặt nạ làm mờ hai mép để dải trông như chạy vô tận thay vì bị cắt cụt. */
const EDGE_FADE = 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)'

/**
 * Avatar thành viên: ảnh thật nếu có, còn không thì chữ cái đầu.
 *
 * Hiện 14/15 người có ảnh; còn thiếu Hoàng Ngọc Phương.
 *
 * Dựng chữ cái đầu là cách trung thực duy nhất — gán ảnh người khác hoặc ảnh
 * stock vào một người có thật thì thành bịa danh tính.
 */
function Avatar({ member, index, photoAlt, size = 'sm' }) {
  const photo = member.image
  const { box, text } = AVATAR_SIZES[size]

  if (photo) {
    return (
      <img
        src={photo.url}
        width={photo.width}
        height={photo.height}
        alt={photoAlt.replace('{name}', member.name)}
        loading="lazy"
        decoding="async"
        className={`${box} shrink-0 rounded-pill object-cover`}
      />
    )
  }

  return (
    <span
      className={`inline-flex ${box} ${text} shrink-0 items-center justify-center rounded-pill font-display font-bold text-white ${INITIAL_TONES[index % INITIAL_TONES.length]}`}
      aria-hidden="true"
    >
      {initialsOf(member.name)}
    </span>
  )
}

/**
 * Thẻ riêng của người phụ trách, đứng trên hai dải chạy.
 *
 * Đứng yên chứ không trôi theo dải: một người mà cứ trôi qua trôi lại thì không
 * đọc kịp, và cũng mất luôn ý nghĩa "tách riêng" mà thẻ này sinh ra để làm.
 */
function LeadCard({ member, photoAlt }) {
  return (
    <article className="mx-auto flex max-w-[560px] flex-col items-center gap-5 rounded-card-sm border border-ash/60 bg-white p-6 text-center shadow-ambient sm:flex-row sm:gap-6 sm:p-8 sm:text-left">
      <Avatar member={member} index={0} photoAlt={photoAlt} size="lg" />
      <span className="flex flex-col items-center gap-2 sm:items-start">
        <span className="font-display text-heading-sm font-bold text-ink">{member.name}</span>
        <Pill tone="signal">{member.role}</Pill>
        <span className="text-caption text-steel">{member.education}</span>
      </span>
    </article>
  )
}

/**
 * Thẻ một thành viên trên dải.
 *
 * Bề rộng cố định và lề phải nằm TRÊN THẺ chứ không dùng `gap` trên track: với
 * `gap`, bản sao thứ hai lệch đi đúng nửa khoảng cách nên vòng lặp có mối nối
 * nhìn thấy được. Lề trên từng thẻ thì hai bản sao rộng bằng nhau tuyệt đối.
 *
 * Thẻ nới rộng ở `sm` trở lên để bù chỗ cho avatar to hơn. Ở mobile giữ nguyên
 * 320px — rộng hơn nữa là thẻ không bao giờ lọt trọn trong màn hình 375px — nên
 * khoảng cách trong thẻ phải thu lại, kẻo dòng học vấn dài nhất bị cắt.
 */
function MemberCard({ member, index, photoAlt }) {
  return (
    <div className="mr-6 flex w-[320px] shrink-0 items-center gap-3 rounded-card-sm border border-ash/60 bg-white p-4 sm:w-[380px] sm:gap-4">
      <Avatar member={member} index={index} photoAlt={photoAlt} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-body-sm font-medium text-ink">{member.name}</span>
        <span className="truncate text-caption text-steel">{member.role}</span>
        <span className="truncate text-caption text-signal">{member.education}</span>
      </span>
    </div>
  )
}

/**
 * Một hàng chạy ngang.
 *
 * Track chứa danh sách LẶP ĐÚNG HAI LẦN rồi trượt -50%, nên hết bản sao thứ nhất
 * là trùng khít điểm đầu — vòng lặp không có mối nối, không cần JS đo đạc.
 * Bản sao thứ hai mang `aria-hidden` để screen reader không đọc hai lần.
 *
 * `animation-direction` đặt bằng style inline nên thắng utility mà không cần
 * thêm keyframe ngược. Rule tắt chuyển động dùng `animation-name` nên vẫn có
 * hiệu lực với cả hai chiều.
 */
function MarqueeRow({ members, reverse, photoAlt, offset }) {
  const cards = members.map((member, index) => (
    <MemberCard key={member.id} member={member} index={offset + index} photoAlt={photoAlt} />
  ))

  return (
    <div className="marquee-viewport relative" style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}>
      <div
        className="marquee-track flex w-max"
        style={{
          '--marquee-duration': `${members.length * 6}s`,
          animationDirection: reverse ? 'reverse' : undefined,
        }}
      >
        {cards}
        <span className="flex" aria-hidden="true">
          {cards}
        </span>
      </div>
    </div>
  )
}

export function Team() {
  const t = useT()

  // Người được đánh dấu `lead` tách ra thẻ riêng; phần còn lại mới lên dải chạy.
  // Lọc theo cờ trong dữ liệu chứ không viết cứng `id` — đổi người phụ trách thì
  // không phải sửa component.
  const lead = t.team.members.find((member) => member.lead)
  const members = t.team.members.filter((member) => !member.lead)

  // Chia đôi, hàng trên nhiều hơn khi lẻ. Tính từ dữ liệu chứ không viết cứng —
  // thêm hay bớt người thì hai hàng tự cân lại.
  const half = Math.ceil(members.length / 2)
  const rows = [members.slice(0, half), members.slice(half)]

  return (
    <Section id="team">
      <SectionHeading
        eyebrow={t.team.eyebrow}
        title={t.team.title}
        description={t.team.description}
        align="center"
        from="right"
      />

      {lead && (
        <Reveal className="mt-14">
          <LeadCard member={lead} photoAlt={t.team.photoAlt} />
        </Reveal>
      )}

      {/* Hai hàng chạy ngược chiều nhau: mắt bắt được ngay đây là hai dải riêng
          biệt chứ không phải một khối trôi đều. */}
      <Reveal from="left" className="mt-12 flex flex-col gap-6">
        {rows.map((row, index) => (
          <MarqueeRow
            key={index}
            members={row}
            reverse={index % 2 === 1}
            photoAlt={t.team.photoAlt}
            offset={index * half}
          />
        ))}
      </Reveal>
    </Section>
  )
}
