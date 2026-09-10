import { CourseIcon } from '../assets/icons/CourseIcons'
import { ArrowRightIcon } from '../assets/icons/Icons'
import { COURSE_IMAGE_SIZE, COURSE_IMAGES } from '../assets/images'
import { useT } from '../i18n/context'
import { Pill } from './ui/Pill'

/**
 * Ba sắc pastel luân phiên theo vị trí card. Trước đây tô nền cả khối hình; giờ
 * khối hình là ảnh thật nên sắc màu chỉ còn ở huy hiệu icon — vẫn đủ giữ nhịp
 * màu cho lưới mà không phủ màu lên ảnh.
 */
const TONES = ['text-signal', 'text-ember', 'text-leaf']

export function CourseCard({ course, index, onOpen }) {
  const t = useT()
  const tone = TONES[index % TONES.length]

  // Hai nhóm khóa học mang hai bộ trường khác nhau, và card render theo trường nào
  // CÓ MẶT chứ không nhận thêm prop kiểu:
  //   nhóm STEM        -> level + duration + age  (số thật từ trang khóa học)
  //   nhóm trải nghiệm -> stage + topic           (phân loại của catalogue)
  const stage = course.stage && t.courses.stages.find((s) => s.id === course.stage)
  const topic = course.topic && t.courses.topics.find((x) => x.id === course.topic)

  // `CourseIcon` trả null khi không có icon cho id đó — huy hiệu sẽ là vòng tròn
  // trắng rỗng. Chương trình trải nghiệm vì thế trỏ `icon` tới một icon có sẵn;
  // nếu vẫn thiếu thì bỏ hẳn huy hiệu chứ không để vòng tròn trống.
  const iconId = course.icon ?? course.id
  const icon = <CourseIcon id={iconId} size={24} />

  // Card cố ý KHÔNG khai báo utility transition nào: khai báo transition gộp
  // trong index.css (không phân lớp) đã lo cả `translate` lẫn `box-shadow` cho
  // hover. Bản cũ liệt kê `transform` là sai — Tailwind v4 nhấc card bằng thuộc
  // tính `translate`, không nằm trong danh sách đó, nên card giật lên thay vì
  // nhấc mượt.
  //
  // (Tránh viết tên class Tailwind đầy đủ trong comment: trình quét đọc cả
  //  comment và sẽ sinh ra CSS chết cho class không ai dùng.)
  return (
    <article
      className={[
        'group flex h-full flex-col rounded-card-sm md:rounded-[46px] bg-white p-5 md:p-6',
        'shadow-ambient hover:-translate-y-1 hover:shadow-ambient-lift',
      ].join(' ')}
    >
      {/* Ảnh đại diện khóa học: ảnh thật chụp tại FabLab EIU, bo góc lớn.
          Icon vẽ tay không bỏ đi mà thu lại thành huy hiệu tròn ở góc — icon
          luôn đúng chủ đề khóa học, còn ảnh thì có khóa chỉ có ảnh gần đúng. */}
      <div className="relative h-40 overflow-hidden rounded-image-sm bg-ash/30">
        <img
          src={COURSE_IMAGES[course.id]}
          width={COURSE_IMAGE_SIZE.width}
          height={COURSE_IMAGE_SIZE.height}
          alt={t.courses.imageAlt.replace('{title}', course.title)}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-105"
        />

        <Pill tone="white" className="absolute top-3 right-3">
          {stage ? stage.short : t.courses.levels[course.level]}
        </Pill>

        {icon && (
          <span
            className={`absolute bottom-3 left-3 inline-flex size-11 items-center justify-center rounded-pill bg-white shadow-ambient ${tone}`}
          >
            {icon}
          </span>
        )}
      </div>

      {/* h4 chứ không phải h3: mỗi nhóm khóa học đã chiếm một h3 ở trên. */}
      <h4 className="mt-6 text-heading-sm text-ink">{course.title}</h4>

      <p className="mt-3 text-body-sm text-graphite line-clamp-2-fixed">
        {course.description}
      </p>

      {/* `mt-auto` đẩy phần chân xuống đáy để mọi card trong hàng cao bằng nhau */}
      <div className="mt-auto pt-6">
        {topic ? (
          <Pill tone="outline">{topic.label}</Pill>
        ) : (
          <div className="flex items-center gap-2 text-caption text-steel">
            <span>{course.duration}</span>
            <span aria-hidden="true">·</span>
            <span>
              {t.courses.ageLabel} {course.age}
            </span>
          </div>
        )}

        {/* Mở popup chi tiết. Phần `sr-only` giữ lại vì 16 card có cùng một nhãn
            "Tìm hiểu thêm" — screen reader cần biết nút này thuộc khóa nào. */}
        <button
          type="button"
          onClick={() => onOpen(course)}
          className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-body-sm font-medium text-signal transition-[gap] duration-200 ease-[var(--ease-out-soft)] hover:gap-3"
        >
          {t.courses.cardCta}
          <ArrowRightIcon size={16} />
          <span className="sr-only">— {course.title}</span>
        </button>
      </div>
    </article>
  )
}
