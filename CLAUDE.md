# CLAUDE.md — FabLab EIU Landing Page

Ghi chú dành cho agent làm việc trên repo này. [README.md](README.md) mô tả design
token, cấu trúc thư mục và bảng dữ liệu giả định cần thay — **không lặp lại ở
đây**. File này chỉ ghi những gì đã phải trả giá mới rút ra được, và những chỗ sửa
sai một lần là hỏng cả trang.

## Bối cảnh

Landing page giới thiệu FabLab EIU. Slogan **"Tự Hào Phục vụ cộng đồng"**. Song
ngữ VI/EN. Ảnh là ảnh thật chụp tại FabLab EIU và logo thật của trường, đều đóng
gói sẵn trong repo; chỉ icon còn là SVG vẽ tay — trang vẫn chạy được offline.

Stack: **Vite 8 + React 19 + Tailwind CSS v4** (plugin `@tailwindcss/vite`, cấu
hình bằng `@theme` / `@utility` trong CSS — **không có `tailwind.config.js`**,
đừng tạo). Linter là **oxlint** (`npm run lint`), không phải ESLint.

## Quy ước bắt buộc

- **Nội dung không hardcode trong component.** Mọi chữ nằm ở
  [src/i18n/vi.js](src/i18n/vi.js) và [src/i18n/en.js](src/i18n/en.js); hai file
  phải luôn cùng cấu trúc khóa. `id` / `group` / `level` của khóa học **không
  được dịch** — dùng làm React key và khóa tra icon.
- **Button không bao giờ có shadow.** Trong hệ "Loom" shadow chỉ thuộc về card và
  khung ảnh.
- Mọi nút đi qua `ui/Button.jsx`, mọi nhãn qua `ui/Pill.jsx`, mọi section qua
  `ui/Section.jsx`. Đây là chốt chặn giữ style khỏi lệch.
- Mọi truy cập `localStorage` phải bọc `try/catch` (chế độ riêng tư ném lỗi).

## Hệ scroll reveal — đọc trước khi động vào

Cơ chế: `IntersectionObserver` chỉ đổi attribute `data-reveal` /
`data-reveal-group` giữa `hidden` ↔ `shown`; **toàn bộ chuyển động do CSS lo**.
Một lưới chỉ tốn đúng một observer, các card không biết gì về animation.

| Mảnh | File |
|---|---|
| Observer + tuỳ chọn `once` / `enabled` | [src/hooks/useInView.js](src/hooks/useInView.js) |
| `Reveal` / `RevealGroup`, prop `from` | [src/components/ui/Reveal.jsx](src/components/ui/Reveal.jsx) |
| Rule CSS (cuối file, **ngoài mọi `@layer`**) | [src/index.css](src/index.css) |
| Cờ `REDUCED_MOTION` dùng chung | [src/lib/motion.js](src/lib/motion.js) |

### Bốn cái bẫy đã sập

**1. Rule reveal phải nằm NGOÀI mọi `@layer`.** CSS không phân lớp thắng toàn bộ
CSS có phân lớp. Bản đầu đặt trong `@utility` → rơi vào `@layer utilities`, cùng
specificity `(0,1,0)` với utility của CourseCard nhưng phát sinh **trước** nên bị
ghi đè, `transition-property` mất `opacity` và hiệu ứng chết câm. Nếu phải kiểm
lại: grep CSS đã build, xác nhận `@layer utilities{` đóng bằng `}}` **trước**
`[data-reveal]`.

**2. Tailwind v4 tách `transform` thành bốn thuộc tính riêng.**
`hover:-translate-y-1` sinh ra `translate:var(...)`, `scale-110` sinh ra
`scale:...`. Hai lưu ý ngược chiều nhau, đừng nhớ nhầm một nửa:

- Utility **`transition-transform` thì AN TOÀN** — nó nở ra thành
  `transition-property: transform, translate, scale, rotate`, phủ đủ cả bốn.
- **Giá trị tuỳ ý thì KHÔNG** — `transition-[transform,box-shadow]` sinh ra đúng
  literal hai thuộc tính đó, bỏ sót `translate`, nên hover bị giật. Đây chính là
  lỗi đã sửa ở CourseCard.

Hệ quả kép của việc `translate:` là thuộc tính riêng:

- Reveal dùng `transform:` nên **không** giẫm lên hover — hai thuộc tính độc lập.
- Nhưng khai báo `transition` shorthand không phân lớp lại **ghi đè
  `transition-property` của mọi utility Tailwind trên cùng phần tử**. Vì vậy
  `translate` và `box-shadow` của hover card phải nằm chung trong khai báo
  transition ở `index.css`, và [CourseCard.jsx](src/components/CourseCard.jsx) cố
  ý **không** khai báo utility transition nào. Đây là coupling có chủ đích — đừng
  "dọn dẹp" bằng cách trả transition về lại card.

**3. `body` phải là `overflow-x: clip`, tuyệt đối không phải `hidden`.**
`translateX(±56px)` đẩy phần tử ra ngoài mép container. `hidden` cắt được tràn
nhưng biến `body` thành scroll container và **làm chết `position: sticky` của
Navbar**. `clip` cắt mà không tạo scroll container.

**4. Transition KHÔNG chạy trên phần tử vừa mount.** Card mới (bấm "Xem thêm")
khớp `[data-reveal-group=shown] > *` ngay từ lần resolve style đầu tiên nên tính
ra `opacity: 1` — không có thay đổi giá trị thì không có transition.
`animation` thì ngược lại, vẫn chạy. Đang chấp nhận đánh đổi này để đổi lấy hiệu
ứng hai chiều; đừng viết vào tài liệu hay comment rằng lọc/mở rộng "được animation
miễn phí" — nó không đúng.

### Hướng trượt hiện tại

Trong cùng section tiêu đề và lưới đi ngược chiều, rồi đảo lại ở section kế tiếp:
Pillars `left`/`right` → Courses `right`/`left` → Facilities `left`/`right` →
Partners `right`/`left` → Activities `left`/`right` → Team `right`/`left` →
Testimonials `left`/`right`. StatsBar · FinalCTA · Footer · nút "Xem thêm" ·
link tuyển dụng · chấm tròn dùng mặc định `up`.

Courses có **hai lưới** (hai nhóm khóa học): lưới đầu `left`, lưới sau `right`,
gán theo chỉ số nhóm chứ không viết cứng — thêm nhóm thứ ba là nó tự xen kẽ tiếp.
Tiêu đề phụ của nhóm để `up`, không trượt ngang, kẻo section thành quá ồn.

**Thêm hay bỏ section ở giữa là phải đảo chiều mọi section phía sau** để giữ nhịp
xen kẽ. Thêm Team đã kéo theo việc lật Testimonials; thay Process bằng
Partners + Activities lại kéo theo lật cả Team lẫn Testimonials lần nữa.

## Marquee đối tác

[Partners.jsx](src/components/Partners.jsx) chạy dải logo bằng CSS thuần, không
JS: track chứa **danh sách lặp đúng hai lần** rồi trượt `-50%`, nên hết bản sao
thứ nhất là trùng khít điểm đầu và vòng lặp không có mối nối. Bản sao thứ hai
mang `aria-hidden` để screen reader không đọc hai lần. Tốc độ theo số lượng logo
qua biến `--marquee-duration`.

**Cái bẫy `!important` + cascade layer:** với khai báo `!important`, thứ tự layer
bị **đảo ngược** — rule `!important` trong `@layer base` thắng rule `!important`
không phân lớp (ngược hẳn với khai báo thường). Rule reduced-motion chung ở base
chỉ ép `animation-duration: 0.01ms`, mà với animation lặp vô hạn thì đó là quay
cực nhanh chứ không phải dừng. Vì vậy marquee tắt bằng `animation-name: none`
chứ **không** dùng shorthand `animation: none` — shorthand sẽ bị base ghi đè mất
phần duration.

## Đối tác: chỉ 3/4 có logo

Site của trường **không có trang danh sách đối tác**. Bốn tổ chức trong
`partners.items` đều có căn cứ trên site (breadcrumb, thư viện media, hoặc trang
Sự kiện), nhưng **chỉ EIU, Becamex và BBI có logo**. Hệ thống trường Việt Anh chỉ
có văn bản lễ ký kết 19/7/2022, không có logo — nên nó không có key trong
`PARTNER_LOGOS` và hiển thị bằng chữ. **Đừng đi tìm logo ở nguồn khác rồi gán
vào**: gán sai nhận diện một tổ chức có thật còn tệ hơn là không có logo.

Stagger 90ms chỉ áp cho lượt vào (selector `[data-reveal-group='shown']`), chặn ở
450ms; lượt ra cả nhóm đi cùng lúc.

### Muốn quay lại chế độ chạy một lần

Đổi `once: false` → `once: true` trong `REVEAL_VIEWPORT` ở
[Reveal.jsx](src/components/ui/Reveal.jsx). Đúng một dòng. Hiệu ứng hai chiều làm
nội dung chuyển động cả khi cuộn ngược lên đọc lại — khá xa giọng tiết chế của
style reference, người dùng đã được báo trước điểm này.

## Hình ảnh

21 ảnh thật trong [src/assets/images/](src/assets/images/), tải từ thư viện media
của `fablab.eiu.edu.vn` (`/wp-json/wp/v2/media?per_page=100`) rồi cắt giữa + nén
sẵn. **Không có bước xử lý ảnh lúc build** — file trong repo đã là file cuối.

**Ảnh hoạt động lệch một bậc trên trang nguồn.** Trên
`fablab.eiu.edu.vn/vi/su-kien/`, ảnh nằm **trước** tiêu đề của chính nó, nên bóc
theo vị trí sẽ gán nhầm ảnh sang sự kiện kế bên (poster in 3D bị gán cho cuộc thi
xe đua, v.v.). Bộ ảnh hiện tại được gán bằng cách **mở từng ảnh ra xem** rồi khớp
theo nội dung và ngày in trên poster. Bổ sung ảnh mới thì làm y như vậy, đừng tin
thứ tự trong HTML.

Ba hoạt động không có ảnh riêng trên trang gốc (`stm32`, `print-3d-medical`,
`pcb`) dùng lại ảnh thật khác của FabLab, đánh dấu `// ~`.

Tỷ lệ ảnh hoạt động rất lệch nhau (poster dọc 0.7 đến ảnh ngang 2.05) nên carousel
dùng `object-contain` trên nền pastel. **Đừng đổi sang `object-cover`** — nó sẽ
cắt mất tiêu đề poster hoặc mặt người.

**Đội ngũ: chỉ 6/10 người có ảnh.** Trang "Về chúng tôi" của trường để ảnh mẫu
`demo_image.jpg` cho bốn người còn lại, nên `TEAM_IMAGES` không có key cho họ và
[Team.jsx](src/components/Team.jsx) dựng avatar chữ cái đầu. **Đừng lấp bằng ảnh
stock hay ảnh người khác** — đây là người có thật, gán sai mặt là bịa danh tính.
Tên và chức danh cũng lấy nguyên văn từ trang đó, không tự chế.

**Logo là ảnh thật, không còn là SVG tự vẽ.** `Logo-Fablab.png` là file gốc do
trường cung cấp (mark tròn + chữ "EIU FABLAB"); `logo-mark.png` là phần mark cắt
ra từ nó, và đó mới là file `Logo.jsx` dùng. Đừng ghép nguyên file gốc vào navbar
— ở 36px thì dòng chữ trong ảnh chỉ còn ~4px. Chữ cạnh logo cố ý để dạng text.
`public/favicon.png` là cùng ảnh mark, đổi logo thì nhớ đổi luôn kẻo lệch.

[index.js](src/assets/images/index.js) ánh xạ `id` khóa học / thiết bị sang ảnh.
**Thêm khóa học mới mà quên thêm ảnh thì `src` thành `undefined` và card hiện ảnh
vỡ** — không có ảnh mặc định, cũng không có cảnh báo lúc build. README liệt kê
sáu ảnh chỉ khớp gần đúng (đánh dấu `// ~` trong index.js).

Muốn đổi ảnh: bỏ file mới vào thư mục, sửa import trong `index.js`. Vite gắn hash
nội dung nên cache tự hết hiệu lực. Kích thước dịch nằm trong bảng ở README —
giữ đúng tỷ lệ kẻo `object-cover` cắt mất chủ thể.

Ảnh hero là ảnh trên màn hình đầu: để `fetchPriority="high"`, **không** lazy-load.
Mọi ảnh khác lazy-load. Ảnh nào cũng phải có `width`/`height` thật.

## Popup chi tiết khóa học

[CourseModal.jsx](src/components/CourseModal.jsx) dùng `<dialog>` gốc +
`showModal()`. Đừng thay bằng div tự dựng: trình duyệt đang lo sẵn bẫy focus,
`Esc`, trả focus và `inert` cho nền.

**Khóa cuộn nền phải đặt trên `<html>`, KHÔNG đặt trên `<body>`.** `body` đang có
`overflow-x: clip`; ghi đè `overflow` lên đó sẽ biến body thành scroll container
và làm chết navbar sticky — cùng cái bẫy đã mô tả ở trên.

[Courses.jsx](src/components/Courses.jsx) giữ **`id`** của khóa đang mở chứ không
giữ object, để đổi ngôn ngữ lúc popup đang mở thì nội dung dịch theo.

## Hai nhóm khóa học

Section khóa học chia làm hai khối, **không còn nút lọc**. Nhóm nằm ở
`courses.groups` (mảng, thứ tự trong mảng chính là thứ tự hiển thị); mỗi khóa trỏ
về nhóm bằng trường `group`.

| `group` | Chuyên mục thật trên site | Số khóa |
|---|---|---|
| `stem` | Khóa học STEM | 4 |
| `experience` | Chương trình trải nghiệm STEM | 12 |

Đây **không phải cách chia tự nghĩ ra**: đọc từ breadcrumb của cả 16 trang
`fablab.eiu.edu.vn/courses/<slug>/`. Scratch là khóa duy nhất chưa gắn chuyên mục
trên site, xếp vào `stem` theo độ dài (7 tuần, dài hơn mọi khóa trải nghiệm).

`duration` cũng là số thật từ trang khóa học (`N tuần · M giờ`). Số tuần khớp
chính xác với tổng số buổi cộng từ giáo trình, nên **1 buổi = 1 tuần** — muốn hiện
"buổi" thay "tuần" thì sửa đúng một chuỗi trong mỗi từ điển.

**Bậc heading trong section này: h2 (section) → h3 (nhóm) → h4 (tên card).** Thêm
nhóm hay đổi bố cục thì giữ nguyên thứ bậc, đừng để hai h3 ngang hàng với tên card.

### courseDetails.*.js là file SINH RA, đừng sửa tay

Nội dung bóc từ các trang LearnPress thật trên `fablab.eiu.edu.vn`
(`/courses/<slug>/`, khối `div.thim-course-content`, tiêu đề mục nằm trong
`<strong>`). Sửa tay sẽ mất khi ai đó chạy lại bộ sinh. Mỗi mục có `sourceUrl` để
đối chiếu với trang gốc.

Shape của `courses.details` **cố ý không đối xứng** giữa hai ngôn ngữ: khóa nào
trang gốc không có mục đó thì thiếu hẳn key, và popup chỉ render mục có dữ liệu.
Quy ước "hai từ điển cùng shape" chỉ áp cho chữ giao diện. Năm khóa không có trang
tiếng Anh được đánh dấu `viOnly: true`.

## Bẫy khi sửa i18n bằng regex

`nav.switchLanguage` chứa nguyên văn chuỗi con `age: '` (switchLangu**age: '**).
Một script thay `age: '...'` hàng loạt đã ghi đè nhầm vào đó ở cả hai file. Nếu
phải patch i18n bằng regex thì **neo vào ranh giới từ** (`\bage:`) và in ra danh
sách vị trí sắp sửa để soát trước khi ghi.

Giá trị đúng: `vi.js` → `'Chuyển ngôn ngữ'`, `en.js` → `'Switch language'`.

## "Animation không chạy" — kiểm cái này TRƯỚC khi debug code

Nguyên nhân đã xảy ra một lần và tốn cả một lượt điều tra: **Windows tắt hiệu ứng
chuyển động** → `prefers-reduced-motion: reduce` khớp → cả ba cơ chế (reveal CSS,
`CountUp`, block trong `@layer base`) đều chủ động tự tắt. Đó là **hành vi đúng**.

Bật lại ở `Settings → Accessibility → Visual effects → Animation effects → On`.
**Không ghi đè cờ này trong code** — nó phục vụ người dùng có rối loạn tiền đình.

## Đếm số

`CountUp` trong [StatsBar.jsx](src/components/StatsBar.jsx) đã có sẵn từ bản dựng
đầu (rAF + `easeOutCubic`, 1400ms). `once: false` khiến `active` lật false→true
nên bốn con số tự đếm lại từ 0 mỗi lượt — **không cần sửa `CountUp`**.

## Bẫy môi trường (Windows)

- oxlint bắt lỗi `react(set-state-in-effect)`. Cách xử lý đã dùng: **derive lúc
  render** thay vì `setState` trong effect (xem `display` ở StatsBar và `current`
  ở Testimonials).
- **Tailwind quét cả comment.** Viết tên class đầy đủ trong comment sẽ sinh ra CSS
  chết cho class không ai dùng. Diễn đạt vòng khi cần nhắc tới một class.
- `npm run build` báo `EBUSY ... rmdir 'dist\assets'` nếu shell đang đứng bên
  trong `dist/`. Đưa cwd ra ngoài rồi chạy lại.

## Giới hạn của agent trong repo này

**Xem được file ảnh, không xem được trang đã render.** Công cụ Read mở được
`.jpg`/`.png`, nên việc chọn ảnh và kiểm tra khung cắt là làm thật được — đừng bỏ
qua bước đó rồi chọn ảnh theo tên file. Nhưng không có công cụ chụp màn hình:
không cách nào tự xác nhận bố cục, chuyển động hay khoảng cách của trang.

Mọi kiểm chứng còn lại là **cấu trúc** (grep CSS đã build, byte offset, đối chiếu
id ↔ ảnh, lint, build). Những thứ luôn phải nhờ người dùng nhìn: không có thanh
cuộn ngang ở 375px và 1440px lúc đang trượt, Navbar còn dính, hover card nhấc
mượt không giật, số liệu đếm lại từ 0 khi quay lại, và ảnh trong card không bị
`object-cover` cắt mất chủ thể ở từng bề ngang màn hình.
