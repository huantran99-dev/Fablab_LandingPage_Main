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
 * STEM" (4 khóa) luôn hiện trọn, còn nhóm trải nghiệm (30 chương trình) cắt bớt để
 * trang không dài gấp năm ngay khi mở.
 */
const INITIAL_VISIBLE = 6

/**
 * Một hàng chip lọc: "Tất cả" rồi tới từng lựa chọn, mỗi chip kèm số chương trình
 * còn lại NẾU chọn chip đó — số này đã tính cả bộ lọc của hàng kia, nên người dùng
 * không bao giờ bấm vào một chip rồi nhận lưới rỗng bất ngờ.
 *
 * Chip nào ra 0 thì vô hiệu hóa luôn thay vì để bấm vào rồi mới báo không có gì.
 */
function FilterRow({ label, options, value, onChange, countOf, allLabel }) {
  const choices = [{ id: null, label: allLabel }, ...options]

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="w-full text-caption font-medium text-steel sm:w-28">{label}</span>
      {choices.map((choice) => {
        const active = value === choice.id
        const count = countOf(choice.id)
        return (
          <Button
            key={choice.id ?? 'all'}
            size="sm"
            variant={active ? 'filled' : 'ghost'}
            aria-pressed={active}
            disabled={count === 0 && !active}
            onClick={() => onChange(active ? null : choice.id)}
            className={count === 0 && !active ? 'cursor-not-allowed opacity-40' : ''}
          >
            {choice.label}
            <span className={active ? 'text-white/70' : 'text-steel'}>{count}</span>
          </Button>
        )
      })}
    </div>
  )
}

/**
 * Một nhóm khóa học: tiêu đề phụ + bộ lọc (nếu có) + lưới card + nút mở rộng.
 *
 * Mỗi nhóm giữ state `expanded` và state bộ lọc độc lập, nên mở nhóm này không kéo
 * theo nhóm kia.
 */
function CourseGroup({ group, courses, from, onOpen }) {
  const t = useT()
  const [expanded, setExpanded] = useState(false)
  const [stage, setStage] = useState(null)
  const [topic, setTopic] = useState(null)

  const filtered = useMemo(() => {
    if (!group.filterable) return courses
    return courses.filter(
      (course) =>
        (stage === null || course.stage === stage) && (topic === null || course.topic === topic),
    )
  }, [group.filterable, courses, stage, topic])

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE)
  const hasMore = filtered.length > INITIAL_VISIBLE

  // Cố ý KHÔNG reset `expanded` khi đổi bộ lọc: `hasMore` vốn tính từ số card đã
  // lọc nên nút tự ẩn/hiện đúng, còn reset bằng effect sẽ đụng luật lint
  // `react(set-state-in-effect)`.

  const countStage = (id) =>
    courses.filter((c) => (id === null || c.stage === id) && (topic === null || c.topic === topic))
      .length
  const countTopic = (id) =>
    courses.filter((c) => (stage === null || c.stage === stage) && (id === null || c.topic === id))
      .length

  return (
    // Neo suy từ `group.id` chứ không viết cứng: thêm nhóm thứ ba là nó tự có neo.
    // Menu ở navbar trỏ thẳng vào đây (`#courses-stem`, `#courses-experience`).
    <div id={`courses-${group.id}`} className="flex flex-col">
      {/* h3: nằm dưới h2 của section, và trên h4 của từng card. */}
      <Reveal className="flex flex-col gap-3">
        <span className="flex flex-wrap items-center gap-3">
          <h3 className="text-heading-sm md:text-heading-lg text-ink">{group.title}</h3>
          <Pill tone="outline">{courses.length}</Pill>
        </span>
        <p className="max-w-[620px] text-body-sm text-graphite">{group.description}</p>
      </Reveal>

      {group.filterable && (
        <Reveal className="mt-8 flex flex-col gap-3">
          <FilterRow
            label={t.courses.filters.stage}
            allLabel={t.courses.filters.all}
            options={t.courses.stages.map((s) => ({ id: s.id, label: s.label }))}
            value={stage}
            onChange={setStage}
            countOf={countStage}
          />
          <FilterRow
            label={t.courses.filters.topic}
            allLabel={t.courses.filters.all}
            options={t.courses.topics}
            value={topic}
            onChange={setTopic}
            countOf={countTopic}
          />
        </Reveal>
      )}

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
        <p className="mt-8 text-subheading text-steel">
          {/* Lọc ra rỗng khác với nhóm vốn không có khóa nào — hai ngữ cảnh, hai câu. */}
          {courses.length > 0 ? t.courses.filters.empty : t.courses.emptyState}
        </p>
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
