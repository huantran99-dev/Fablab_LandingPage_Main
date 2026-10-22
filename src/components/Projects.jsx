import { useT } from '../i18n/context'
import { Pill } from './ui/Pill'
import { RevealGroup } from './ui/Reveal'
import { Section, SectionHeading } from './ui/Section'

/** Sắc nhãn theo trạng thái. Trạng thái mới thêm từ dashboard rơi về `outline`. */
const STATUS_TONES = {
  ongoing: 'signal',
  done: 'outline',
}

/**
 * Dự án của FabLab — lưới card ảnh + tên + mô tả.
 *
 * Card nằm TRỰC TIẾP trong RevealGroup nên ăn khai báo transition gộp ở index.css
 * (opacity, transform, translate, box-shadow): nhấc khi hover mượt mà không phải khai
 * utility transition nào trên card — khai vào là ghi đè mất `translate` (bẫy 2 trong
 * CLAUDE.md), y như CourseCard.
 */
export function Projects() {
  const t = useT()
  const projects = t.projects

  // Section mới hơn snapshot / database cũ: không có dữ liệu thì không dựng gì.
  if (!projects?.items?.length) return null

  return (
    <Section id="projects">
      <SectionHeading
        eyebrow={projects.eyebrow}
        title={projects.title}
        description={projects.description}
        align="center"
        from="right"
      />

      <RevealGroup from="left" className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {projects.items.map((project) => {
          // Vắng `status` là có chủ đích (trang gốc không ghi). Có mà tra hụt thì cũng
          // bỏ nhãn — một viên thuốc rỗng trông như lỗi.
          const statusLabel = project.status ? projects.statuses?.[project.status] : null
          const image = project.image

          return (
            <article
              key={project.id}
              className="flex flex-col gap-4 rounded-card-sm bg-white p-5 shadow-ambient hover:-translate-y-1 hover:shadow-ambient-lift"
            >
              {/* Ảnh tách nền, tỉ lệ từ dọc 0.4 tới ngang 2.3 — `object-contain` trong
                  khung trắng cố định, không cắt mất mô hình nào. */}
              {image && (
                <div className="flex h-44 items-center justify-center rounded-image-sm border border-ash/60 bg-white p-4">
                  <img
                    src={image.url}
                    width={image.width}
                    height={image.height}
                    alt={projects.imageAlt.replace('{title}', project.title)}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full w-auto object-contain"
                  />
                </div>
              )}

              {statusLabel && (
                <Pill tone={STATUS_TONES[project.status] ?? 'outline'} className="self-start">
                  {statusLabel}
                </Pill>
              )}

              <h3 className="text-heading-sm text-ink">{project.title}</h3>
              <p className="text-body-sm text-graphite">{project.description}</p>
            </article>
          )
        })}
      </RevealGroup>
    </Section>
  )
}
