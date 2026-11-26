import { COURSE_ICON_IDS, CourseIcon } from '../assets/icons/CourseIcons'
import { ArrowRightIcon } from '../assets/icons/Icons'
import { useT } from '../i18n/context'
import { Button } from './ui/Button'
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

  // Chương trình trải nghiệm trỏ `icon` tới một icon có sẵn; khóa STEM tra theo
  // chính `id`. Thiếu cả hai thì bỏ hẳn huy hiệu.
  //
  // Phải hỏi tập id, KHÔNG được hỏi `icon &&`: `<CourseIcon />` là phần tử JSX nên
  // luôn truthy, dù bên trong nó trả `null`. Bản trước kiểm kiểu đó và vẫn dựng ra
  // vòng tròn trắng trống trơn.
  const iconId = course.icon ?? course.id
  const hasIcon = COURSE_ICON_IDS.has(iconId)

  const image = course.image
  const badge = stage?.short ?? t.courses.levels[course.level]

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
        // `min-w-0`: ô lưới mặc định không co nhỏ hơn nội dung, nên một ảnh tải hỏng (chữ
        // thay thế dài + `width` thật 760) đẩy thẻ rộng 420px ở màn 390px và lố khung.
        'group relative flex h-full min-w-0 flex-col rounded-card-sm md:rounded-[46px] bg-white p-5 md:p-6',
        'shadow-ambient hover:-translate-y-1 hover:shadow-ambient-lift',
      ].join(' ')}
    >
      {/* Ảnh đại diện khóa học: ảnh thật chụp tại FabLab EIU, bo góc lớn.
          Icon vẽ tay không bỏ đi mà thu lại thành huy hiệu tròn ở góc — icon
          luôn đúng chủ đề khóa học, còn ảnh thì có khóa chỉ có ảnh gần đúng. */}
      <div className="relative h-40 overflow-hidden rounded-image-sm bg-ash/30">
        {/* Thiếu ảnh thì để nguyên nền xám của khung: `src` là `undefined` sẽ ra
            biểu tượng ảnh vỡ, xấu hơn hẳn một khối trống. */}
        {image && (
          <img
            src={image.url}
            width={image.width}
            height={image.height}
            alt={t.courses.imageAlt.replace('{title}', course.title)}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-105"
          />
        )}

        {/* Nhóm trải nghiệm hiện cấp học, nhóm STEM hiện cấp độ. Không tra ra
            được thì bỏ hẳn nhãn, đừng để một nhãn trắng không chữ. */}
        {badge && (
          <Pill tone="white" className="absolute top-3 right-3">
            {badge}
          </Pill>
        )}

        {/* Khóa đã công bố nhưng chưa mở lớp. Thiếu nhãn (bản lịch sử cũ) thì không vẽ. */}
        {course.comingSoon && t.courses.comingSoon && (
          <Pill tone="signal" className="absolute top-3 left-3">
            {t.courses.comingSoon}
          </Pill>
        )}

        {hasIcon && (
          <span
            className={`absolute bottom-3 left-3 inline-flex size-11 items-center justify-center rounded-pill bg-white shadow-ambient ${tone}`}
          >
            <CourseIcon id={iconId} size={24} />
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
        {/* Chip / dòng thời lượng nằm trong khối RIÊNG: bản trước để chip và nút cùng là
            phần tử nội dòng, nên ở bề rộng vừa đủ (768px) chúng dính sát trên một dòng,
            còn ở bề rộng khác lại tách hai dòng — thẻ trong cùng hàng cao lệch nhau. */}
        <div>
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
        </div>

        {/* Mở popup chi tiết. Phần `sr-only` giữ lại vì mọi card có cùng một nhãn
            "Tìm hiểu thêm" — screen reader cần biết nút này thuộc khóa nào.

            Cả thẻ bấm được theo mẫu "stretched link": lớp `::after` của nút phủ kín
            thẻ (thẻ là `relative`). Vẫn chỉ MỘT điểm dừng Tab mỗi thẻ, và rê chuột ở
            đâu trên thẻ cũng là rê lên nút nên nút tự tô xanh. Mẫu này cần nút KHÔNG
            tự đặt `relative` — Button chỉ đặt khi đeo vật trang trí mùa, mà biến thể
            này không đeo. */}
        <Button
          variant="signalOutline"
          type="button"
          onClick={() => onOpen(course)}
          className="mt-4 w-full after:absolute after:inset-0 after:content-['']"
        >
          {t.courses.cardCta}
          <ArrowRightIcon size={16} />
          <span className="sr-only">— {course.title}</span>
        </Button>
      </div>
    </article>
  )
}
