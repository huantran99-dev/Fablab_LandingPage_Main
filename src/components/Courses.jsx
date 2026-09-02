import { useMemo, useState } from 'react'
import { useT } from '../i18n/context'
import { CourseCard } from './CourseCard'
import { CourseModal } from './CourseModal'
import { Button } from './ui/Button'
import { Pill } from './ui/Pill'
import { Reveal, RevealGroup } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

/**
 * Số card hiện trước khi bấm "Xem thêm", tính theo nhóm.
 *
 * Nhóm nào ít hơn ngưỡng này thì hiện đủ và không mọc ra nút — nên nhóm "Khóa học
 * STEM" (4 khóa) luôn hiện trọn, còn nhóm trải nghiệm (12 khóa) cắt bớt để trang
 * không dài gấp đôi ngay khi mở.
 */
const INITIAL_VISIBLE = 6

/**
 * Một nhóm khóa học: tiêu đề phụ + lưới card + nút mở rộng của riêng nó.
 *
 * Mỗi nhóm giữ state `expanded` độc lập, nên mở nhóm này không kéo theo nhóm kia.
 */
function CourseGroup({ group, courses, from, onOpen }) {
  const t = useT()
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? courses : courses.slice(0, INITIAL_VISIBLE)
  const hasMore = courses.length > INITIAL_VISIBLE

  return (
    <div className="flex flex-col">
      {/* h3: nằm dưới h2 của section, và trên h4 của từng card. */}
      <Reveal className="flex flex-col gap-3">
        <span className="flex flex-wrap items-center gap-3">
          <h3 className="text-heading-sm md:text-heading-lg text-ink">{group.title}</h3>
          <Pill tone="outline">{courses.length}</Pill>
        </span>
        <p className="max-w-[620px] text-body-sm text-graphite">{group.description}</p>
      </Reveal>

      {visible.length > 0 ? (
        <RevealGroup from={from} className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              onOpen={() => onOpen(course.id)}
            />
          ))}
        </RevealGroup>
      ) : (
        <p className="mt-8 text-subheading text-steel">{t.courses.emptyState}</p>
      )}

      {hasMore && (
        <Reveal className="mt-8 flex justify-center">
          <Button variant="ghost" size="lg" onClick={() => setExpanded((open) => !open)}>
            {expanded ? t.courses.showLess : t.courses.showMore}
          </Button>
        </Reveal>
      )}
    </div>
  )
}

export function Courses() {
  const t = useT()

  // Giữ `id` chứ không giữ nguyên object khóa học: đổi ngôn ngữ lúc popup đang
  // mở thì nội dung bên trong tự dịch theo, thay vì đứng nguyên bản cũ.
  const [openId, setOpenId] = useState(null)
  const openCourse = openId ? (t.courses.items.find((item) => item.id === openId) ?? null) : null

  // Gom khóa học về đúng nhóm một lần, thay vì lọc lại ở mỗi lần render nhóm.
  const byGroup = useMemo(() => {
    const buckets = new Map(t.courses.groups.map((group) => [group.id, []]))
    for (const course of t.courses.items) buckets.get(course.group)?.push(course)
    return buckets
  }, [t.courses.groups, t.courses.items])

  return (
    <Section id="courses">
      <SectionHeading
        eyebrow={t.courses.eyebrow}
        title={t.courses.title}
        description={t.courses.description}
        from="right"
      />

      {/* Hai nhóm trượt vào ngược chiều nhau để mắt tách được ranh giới giữa
          chúng, thay vì đọc thành một lưới dài liền mạch. */}
      <div className="mt-14 flex flex-col gap-16 md:gap-20">
        {t.courses.groups.map((group, index) => (
          <CourseGroup
            key={group.id}
            group={group}
            courses={byGroup.get(group.id) ?? []}
            from={index % 2 === 0 ? 'left' : 'right'}
            onOpen={setOpenId}
          />
        ))}
      </div>

      <CourseModal course={openCourse} onClose={() => setOpenId(null)} />
    </Section>
  )
}
