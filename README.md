# FabLab EIU — Landing Page

Trang giới thiệu FabLab EIU, xưởng chế tạo số của Đại học Quốc tế Miền Đông.
Song ngữ Việt – Anh. Ảnh là ảnh thật chụp tại FabLab EIU, đóng gói sẵn trong
repo; icon là SVG vẽ tay — trang chạy được cả khi không có mạng.

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # xuất bản tĩnh vào dist/
npm run preview  # xem thử bản build
npm run lint
```

## Hệ thiết kế

Bám theo [style reference đã chọn](https://styles.refero.design/style/bc2c6ecc-7a0d-4693-86e5-9fa93b165601)
("Loom"): nền trắng, **một** sắc xanh
`#1868db` cho mọi phần tử tương tác, card bo góc rất lớn trên nền pastel, shadow
ba lớp mềm, và mọi thứ bấm được đều bo tròn hoàn toàn (pill).

Toàn bộ token nằm trong khối `@theme` của [src/index.css](src/index.css) — đổi
một dòng ở đó là cả trang đổi theo:

| Nhóm | Token | Giá trị |
|---|---|---|
| Màu nhấn | `--color-signal` | `#1868db` |
| Nền pastel | `--color-wash` / `--color-butter` / `--color-mint` | `#e9f2fe` / `#fff5d4` / `#efffd6` |
| Nền đảo màu | `--color-navy` | `#123263` |
| Chữ | `--color-ink` / `--color-graphite` / `--color-steel` | `#101214` / `#292a2e` / `#7d818a` |
| Bo góc | `--radius-pill` / `--radius-card` / `--radius-image` | `9999px` / `68px` / `42px` |
| Đổ bóng | `--shadow-ambient` | chồng ba lớp |

Font Charlie Display / Charlie Text trong style reference là font độc quyền của
Atlassian nên không dùng được. Dự án dùng đúng hai fallback mà spec chỉ định:
**Inter Tight** cho tiêu đề và **Inter** cho nội dung, cài qua `@fontsource` để
self-host (có sẵn subset `vietnamese`, dấu tiếng Việt hiển thị đúng).

Ba component trong [src/components/ui/](src/components/ui/) là chốt chặn giữ
cho style không bị lệch: mọi nút đi qua `Button.jsx`, mọi nhãn đi qua `Pill.jsx`,
mọi section đi qua `Section.jsx`.

> Quy ước quan trọng: **button không bao giờ có shadow**. Trong hệ này shadow chỉ
> thuộc về card và khung ảnh.

## Cấu trúc

```
src/
├── index.css              # design tokens + base + utility
├── App.jsx                # ghép 10 section
├── i18n/
│   ├── vi.js · en.js      # TOÀN BỘ nội dung trang nằm ở đây
│   ├── context.js         # useLanguage() / useT()
│   └── LanguageProvider.jsx
├── components/            # mỗi section một file
│   └── ui/                # Button · Pill · Section
├── lib/                   # motion.js (cờ reduced-motion) · initials.js
├── assets/
│   ├── icons/             # SVG vẽ tay: 16 icon khóa học, icon giao diện
│   │                      #   (Logo.jsx dùng ảnh logo thật, không còn vẽ tay)
│   └── images/            # 21 ảnh thật + index.js ánh xạ id → ảnh
└── hooks/                 # useInView · useActiveSection
```

Component không hardcode chữ — muốn sửa nội dung thì sửa `vi.js` / `en.js`.
Hai file phải luôn cùng cấu trúc khóa, và `id` / `group` / `level` của khóa học
**không được dịch** vì dùng làm React key và khóa tra icon.

## Hình ảnh

21 ảnh trong [src/assets/images/](src/assets/images/) tải từ thư viện media của
`fablab.eiu.edu.vn`, đã cắt giữa và nén sẵn về đúng kích thước hiển thị
(JPEG chất lượng 82): **9,9 MB bản gốc → 1,2 MB**. Không xử lý ảnh lúc build,
không gọi ra mạng lúc chạy.

| Dùng ở đâu | Kích thước | Số lượng |
|---|---|---|
| Hero | 1200×900 | 1 |
| Card thiết bị (ô rộng) | 1000×600 | 2 |
| Card thiết bị (ô hẹp) | 760×560 · 679×500 | 2 |
| Card khóa học | 760×320 | 16 |
| Chân dung đội ngũ | 200×200 | 6 |

[index.js](src/assets/images/index.js) ánh xạ `id` của khóa học / thiết bị sang
ảnh. Thêm khóa học mới thì **phải thêm ảnh vào map**, nếu không card sẽ hiện ảnh
vỡ — không có ảnh mặc định.

Ảnh hero tải sớm với `fetchPriority="high"`; mọi ảnh còn lại `loading="lazy"`.
Ảnh nào cũng có `width`/`height` thật để không giật layout lúc tải.

### Logo

`Logo-Fablab.png` (100×118) là logo chính thức do FabLab EIU cung cấp: mark tròn
ở trên, dòng chữ "EIU FABLAB" ở dưới. `logo-mark.png` là **phần mark cắt ra từ
chính file đó**, đặt giữa khung vuông 94×94.

Navbar và footer chỉ dùng phần mark, còn chữ "EIU FabLab" vẫn để dạng text: ở
kích thước hiển thị (36px) thì dòng chữ có sẵn trong file chỉ còn chừng 4px, không
đọc nổi. Để text cũng giúp wordmark ăn theo font và màu của trang.

`public/favicon.png` là cùng ảnh mark đó, nên tab trình duyệt khớp với logo trên
trang.

> **Trước khi lên production:** xác nhận với FabLab EIU rằng bạn được phép dùng
> lại bộ ảnh này, và rằng những người xuất hiện trong ảnh — trong đó có trẻ em —
> đã đồng ý cho đăng. Ảnh đang công khai trên website của trường không đương
> nhiên có nghĩa là được phép dùng lại ở nơi khác.

### Sáu ảnh chỉ khớp gần đúng

Thư viện của trường không có ảnh riêng cho mọi khóa. Sáu card dưới đây đang dùng
ảnh thật của FabLab nhưng **chụp hoạt động khác** — nên thay khi có ảnh đúng.
Trong [index.js](src/assets/images/index.js) chúng được đánh dấu bằng `// ~`:

| Khóa học | Ảnh đang dùng |
|---|---|
| Quang sợi & Laser | Sinh viên làm việc trên máy tính |
| Cơ khí | Sân thi đấu xe robot |
| Hệ thống Điện | Phòng học STEM trống |
| Công nghệ Môi trường Nước | Giảng viên đứng lớp |
| Gia công CNC | Ảnh tập thể trong xưởng |
| Khu điện tử *(thiết bị)* | Ảnh xưởng chung |

Mười lăm ảnh còn lại đúng chủ đề. Bốn khóa nhóm "Khóa học STEM" khớp chính xác vì
trường có ảnh chụp đúng buổi học đó.

## Đội ngũ

Section "Đội ngũ của chúng tôi" ([Team.jsx](src/components/Team.jsx)) liệt kê 10
thành viên. **Tên và chức danh lấy nguyên văn** từ trang "Về chúng tôi" của
trường (`fablab.eiu.edu.vn/vi/ve-chung-toi/`) — không có chỗ nào là nội dung tự
nghĩ ra. Chức danh tiếng Anh là bản dịch của chính chức danh đó (trang EN của
trường vẫn để tiếng Việt, lại thiếu một người và trùng một người, nên bản tiếng
Việt mới là nguồn chuẩn).

**Chỉ 6/10 người có ảnh chân dung.** Bốn người còn lại trên trang gốc dùng ảnh
mẫu `demo_image.jpg`, nên ở đây hiển thị avatar chữ cái đầu — không lấy ảnh stock
hay ảnh người khác lấp vào.

Ảnh chân dung là 200×200, tổng 56 KB. Thiếu ảnh của ai thì bỏ key đó khỏi
`TEAM_IMAGES` trong [index.js](src/assets/images/index.js), component tự chuyển
sang avatar chữ cái.

> Cùng lưu ý như với ảnh hoạt động: xác nhận với FabLab EIU rằng các thành viên
> đồng ý cho đăng tên, chức danh và ảnh trên trang này.

## Hai nhóm khóa học

Section "Khóa học" chia làm hai khối hiển thị song song — **không còn nút lọc**,
mở section ra là thấy ngay cả hai loại hình:

| Nhóm (`group`) | Tiêu đề hiển thị | Số khóa | Thời lượng |
|---|---|---|---|
| `stem` | Khóa học STEM | 4 | 5–10 tuần |
| `experience` | Chương trình trải nghiệm STEM | 12 | 3–6 tuần |

Cách chia và tên nhóm **lấy từ chính site của trường**, đọc từ breadcrumb của cả
16 trang `fablab.eiu.edu.vn/courses/<slug>/`. Scratch là khóa duy nhất chưa gắn
chuyên mục trên site; xếp vào `stem` theo độ dài (7 tuần).

Nhóm nằm ở `courses.groups` trong i18n — **thứ tự trong mảng là thứ tự trên
trang**. Thêm nhóm thứ ba chỉ cần thêm một phần tử và gán `group` cho khóa học,
không phải sửa [Courses.jsx](src/components/Courses.jsx).

Khối nào quá 6 khóa thì cắt bớt và hiện nút "Xem thêm"; mỗi khối có trạng thái mở
rộng riêng.

## Popup chi tiết khóa học

Bấm "Tìm hiểu thêm" trên card sẽ mở popup chi tiết. Popup dùng thẻ `<dialog>`
gốc của trình duyệt nên có sẵn bẫy focus, phím `Esc`, trả focus về đúng nút vừa
bấm và làm nền phía sau bất hoạt — không cần thư viện nào.

Nội dung trong popup **bóc từ các trang khóa học thật** trên
`fablab.eiu.edu.vn` (LearnPress), nằm ở
[courseDetails.vi.js](src/i18n/courseDetails.vi.js) và
[courseDetails.en.js](src/i18n/courseDetails.en.js): giới thiệu, đối tượng,
kiến thức đạt được, kỹ năng đạt được và danh sách bài học. Mỗi khóa có
`sourceUrl` trỏ về trang gốc để đối chiếu.

Popup **chỉ hiện mục nào thật sự có dữ liệu** — không có thì bỏ hẳn mục đó chứ
không bịa cho đầy. Bốn khóa (Môi trường Nước, Ứng suất, CNC, Năng lượng) và khóa
Scratch không có trang tiếng Anh; bản EN của chúng nói rõ điều đó và dẫn sang
trang tiếng Việt.

| | VI | EN |
|---|---|---|
| Khóa có nội dung chi tiết | 16/16 | 11/16 |
| Tổng số mục nội dung | 270 | 136 |

## ⚠️ Nội dung cần thay bằng dữ liệu thật

Website gốc không công bố những số liệu dưới đây, nên hiện tại là **giá trị giả
định hợp lý** để trang có hình hài. Cần thay trước khi đưa lên production. Mỗi
chỗ đều có comment `// TODO` ngay bên trên trong `vi.js` và `en.js`:

| Nội dung | Vị trí | Hiện tại |
|---|---|---|
| Số liệu thống kê | `stats.items` | 2.400 học viên · 40 thiết bị · 180 dự án |
| 3 cảm nhận học viên | `testimonials.items` | Tên và nội dung **hư cấu hoàn toàn** |
| Email · điện thoại · địa chỉ | `footer.contact` | Cần xác nhận lại |
| Link mạng xã hội | `footer.social.items` | Đang để `#` |

Ngoài ra các nút CTA hiện trỏ tới `#register` (khối CTA cuối trang) — cần nối
vào form đăng ký hoặc trang đăng ký thật.

Riêng **danh sách 16 khóa học** (12 định hướng nghề nghiệp + 4 phát triển tư duy)
lấy từ nội dung thật trên `fablab.eiu.edu.vn`, chỉ phần mô tả ngắn trên card là do
dự án viết lại cho gọn.

**Độ tuổi và thời lượng giờ đều là số thật.** `age` lấy từ mục "Đối tượng"
(15/16 khóa), `duration` lấy từ số tuần và số giờ ghi trên trang khóa học
(16/16). Riêng `age` của khóa Scratch trang gốc không ghi nên vẫn để giả định
`8+` — đây là giá trị giả định cuối cùng còn sót trong dữ liệu khóa học.

Số tuần khớp chính xác với tổng số buổi cộng từ giáo trình (Cánh tay Robot:
3+2+3+1+1 = 10 buổi = 10 tuần), nên **1 buổi = 1 tuần**. Muốn hiển thị "buổi"
thay cho "tuần" thì sửa đúng một chuỗi trong mỗi từ điển.

## Ghi chú kỹ thuật

- **Ngôn ngữ** lưu ở `localStorage['fablab-lang']`, mặc định `vi`. Mỗi lần đổi,
  `<html lang>` được cập nhật theo để screen reader và SEO nhận đúng.
- **Navbar** tô sáng link theo section đang xem bằng `IntersectionObserver`.
- **Số liệu** đếm tăng khi cuộn tới, và hiện thẳng số cuối nếu người dùng bật
  `prefers-reduced-motion`.
- Mọi truy cập `localStorage` đều bọc `try/catch` — trình duyệt ở chế độ riêng
  tư có thể ném lỗi khi đọc/ghi.
