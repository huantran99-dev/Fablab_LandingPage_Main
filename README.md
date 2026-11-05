# FabLab EIU — Landing Page

Trang giới thiệu FabLab EIU, xưởng chế tạo số của Đại học Quốc tế Miền Đông.
Song ngữ Việt – Anh. Ảnh là ảnh thật chụp tại FabLab EIU, đóng gói sẵn trong
repo; icon là SVG vẽ tay — trang chạy được cả khi không có mạng.

Nội dung sửa được qua **dashboard quản trị** tại `/admin`, chạy trên backend
ExpressJS + SQLite trong [server/](server/).

## Dashboard quản trị

Giao diện theo phong cách TailAdmin (sidebar thu gọn, giao diện sáng/tối, tìm nhanh
bằng `Ctrl K`). Sửa được **cả 16 section** của trang, mỗi section một màn hình:

| Màn hình | Làm được gì |
|---|---|
| Tổng quan | Đăng ký mới, lượt xem 7 ngày, số khóa học, ảnh; đăng ký và lần lưu gần nhất |
| Đăng ký khóa học | Danh sách người gửi form (lọc theo trạng thái, khóa, ngày, tìm kiếm); gọi điện, đổi trạng thái, ghi chú nội bộ, xoá theo yêu cầu; số đăng ký theo từng khóa; xuất CSV mở được bằng Excel. Badge đỏ trên sidebar khi có đăng ký mới |
| Thống kê truy cập | Lượt xem, lượt khách, đăng ký theo ngày (7 / 30 / 90 ngày); nguồn truy cập, thiết bị, ngôn ngữ, nút được bấm; tỉ lệ mở popup → đăng ký của từng khóa |
| 17 section | Sửa chữ VI + EN cạnh nhau; thêm / sửa / xoá / đổi thứ tự mục; gắn ảnh. Gồm cả chữ của form đăng ký, thông số từng máy và dự án |
| Sự kiện mùa | Tết, Trung Thu, Noel…: đặt ngày bắt đầu / kết thúc, bật / tắt (tự hiện theo lịch, hoặc bật "Hiện ngay" để trang đổi luôn sau khi lưu); popup quảng cáo (ảnh, tiêu đề, nội dung, nút mở form đăng ký hoặc link) hiện **một lần** mỗi sự kiện cho mỗi người xem; bảng màu của cả trang (4 màu, có xem trước và cảnh báo tương phản); ảnh trang trí ở góc khối đầu trang; họa tiết vẽ sẵn (tuyết, hoa mai, hoa đào, đèn lồng, pháo giấy, dơi và bí ngô Halloween) đậu trên các nút chính và rơi nhẹ trên cả trang — người xem tắt được, máy bật giảm chuyển động thì không rơi. Nút "Xem thử trên trang" mở trang với sự kiện đó trước khi bật |
| Họa tiết | Tự tạo họa tiết cho sự kiện mùa: tải ảnh PNG nền trong suốt, trộn với hình có sẵn theo tỉ lệ; chỉnh cỡ hạt, tốc độ, độ lắc, mật độ, rơi xuống hay bay lên, kiểu chuyển động (xoay, lắc, lật, chỉ trôi, vỗ cánh); chọn vật trang trí trên nút. "Bắt đầu từ" một bộ có sẵn để chỉnh bản sao. Khung xem trước chạy hạt rơi thật ngay trong form |
| Khóa học › Popup chi tiết | Sửa nội dung popup theo từng ngôn ngữ; gỡ bản sửa là về bản gốc |
| Thư viện ảnh | Tải lên, xem ảnh đang dùng ở đâu, ghi chú nguồn, xoá ảnh không dùng |
| Tài khoản | Đổi mật khẩu (đăng xuất mọi nơi) |

Mọi thay đổi vào **bản nháp** trước; trang thật đổi khi bấm **Lưu** (`Ctrl S`). Máy chủ
từ chối lượt lưu làm hỏng trang — link menu trỏ tới khối đã xoá, hai giám đốc, id
trùng… — và báo đúng chỗ sai. Mỗi lần lưu có lịch sử, khôi phục được cả chữ lẫn ảnh.

Ảnh tải lên được tự xoay đúng chiều, thu về cạnh dài 1600px và **xoá thông tin vị trí
chụp (EXIF)**.

## Form đăng ký và thống kê

Mọi nút "Đăng ký" trên trang (menu, popup khóa học, khối cuối trang) mở cùng một form:
thông tin học viên, phụ huynh, khóa học quan tâm và ô đồng ý xử lý dữ liệu cá nhân
(Nghị định 13/2023). Mở từ popup khóa học thì khóa đó được chọn sẵn.

- **Dữ liệu cá nhân:** tự xoá sau 12 tháng (`REGISTRATION_RETENTION_DAYS`); mỗi lượt lưu
  kèm nguyên văn câu đồng ý người gửi đã thấy.
- **Chống spam:** giới hạn theo IP, ô bẫy bot, thời gian điền tối thiểu, bỏ bản trùng,
  trần số lượt mỗi ngày.
- **Thống kê không cookie:** không lưu IP, không dịch vụ bên ngoài, tôn trọng Do Not
  Track. Vì vậy "khách" được đếm theo từng ngày, và số liệu thấp hơn thực tế một chút.

Chi tiết: [docs/API.md](docs/API.md#12-đăng-ký-khóa-học) · vận hành, sao lưu:
[docs/DEPLOY.md](docs/DEPLOY.md).

## Chạy dự án

Lần đầu, sau `npm install`:

```bash
npm run seed          # nap noi dung tu src/i18n vao data/fablab.db (chi mot lan)
npm run verify:seed   # chung minh khong mat gi — phai in "identical"
npm run admin:create  # tao tai khoan admin, hoi truc tiep
```

Ngày thường cần **hai cửa sổ terminal**:

```bash
npm run server   # API + anh, http://127.0.0.1:3001
npm run dev      # trang + dashboard, http://localhost:5173 va /admin.html
```

Vite chuyển tiếp `/api` và `/media` sang cổng 3001, nên không cần cấu hình CORS.

Đưa lên máy chủ thật (VPS Linux + nginx): [docs/DEPLOY.md](docs/DEPLOY.md). Mô tả
đầy đủ các route, xác thực và mã lỗi: [docs/API.md](docs/API.md).

```bash
npm run build          # tu chay prebuild: xuat lai snapshot + dong bo anh
npm run preview        # xem thu ban build
npm run lint
npm run check:content  # bo kiem bat bien tren ma nguon
npm run check:snapshot # bo kiem tren ban du phong duoc dong goi
npm run check:admin    # form dashboard khong lam mat truong nao cua noi dung
```

> **Nội dung không còn nằm ở `src/i18n/*.js`.** Hai file đó giờ là hồ sơ nguồn gốc,
> chỉ được đọc tới lúc `npm run seed`. Sửa vào chúng không có tác dụng gì — xem
> [CLAUDE.md](CLAUDE.md).

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
├── App.jsx                # ghép 11 section
├── content/
│   └── snapshot.json      # bản dự phòng đóng gói (sinh ra ở prebuild, CÓ commit)
├── lib/
│   ├── contentStore.js    # vẽ bằng snapshot, rồi thay nóng bằng /api/content
│   ├── typography.js      # nối hai chữ cuối bằng U+00A0 lúc nạp nội dung
│   └── motion.js · track.js · initials.js
├── i18n/
│   ├── vi.js · en.js      # CHỈ còn là hồ sơ nguồn gốc + dữ liệu cho `npm run seed`
│   ├── context.js         # useLanguage() / useT()
│   └── LanguageProvider.jsx
├── components/            # mỗi section một file, register/ là form đăng ký
│   └── ui/                # Button · Pill · Section · Reveal · Field · RoundButton
├── admin/                 # dashboard quản trị (entry Vite thứ hai, admin.html)
├── assets/
│   ├── icons/             # SVG vẽ tay: 16 icon khóa học, icon giao diện
│   │                      #   (Logo.jsx dùng ảnh logo thật, không còn vẽ tay)
│   └── images/            # ảnh gốc + index.js ánh xạ id → ảnh (nguồn của seed)
└── hooks/                 # useInView · useActiveSection · useSlideshow · useScrollLock…
server/                    # ExpressJS + SQLite: API, ảnh, đăng ký, thống kê
```

Component không hardcode chữ — mọi chữ đi qua `useT()`, và **muốn sửa nội dung thì
dùng dashboard** (nguồn sự thật là `data/fablab.db`). Hai ngôn ngữ luôn cùng cấu trúc
khóa — dashboard ghi cả hai trong cùng một giao dịch — và `id` / `group` / `level` của
khóa học **không được dịch** vì dùng làm React key và khóa tra icon.

## Hình ảnh

60 ảnh trong [src/assets/images/](src/assets/images/), phần lớn tải từ website
`fablab.eiu.edu.vn` rồi cắt và nén sẵn về đúng kích thước hiển thị (JPEG chất
lượng 82–85). Không xử lý ảnh lúc build, không gọi ra mạng lúc chạy.

> ⚠️ Tổng hiện là **4,3 MB**, trong đó **7 logo đối tác chưa qua bước nén** chiếm
> khoảng 1,9 MB (`partner-petrusky.png` một mình đã 798 KB, hiển thị ở chiều cao
> 64px). `width`/`height` khai báo cho chúng cũng chưa đúng tỷ lệ thật. Cần nén lại
> trước khi lên production.

| Dùng ở đâu | Kích thước | Số lượng |
|---|---|---|
| Hero | 1200×900 | 1 |
| Card thiết bị (ô rộng) | 1000×600 | 2 |
| Card thiết bị (ô hẹp) | 760×560 · 679×500 | 2 |
| Card khóa học | 760×320 | 16 |
| Chân dung đội ngũ | 240×240 | 14 |
| Ảnh hoạt động | vừa khung 900×640 | 11 |
| Logo đối tác | vừa khung 320×120, PNG trong suốt | 10 |
| Logo FabLab | 94×94 + file gốc | 2 |

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

### Ảnh thẻ khóa học: lấy từ bộ slide "Giới thiệu STEMLab"

Từ 2026-11-05 **mỗi khóa (37) có ảnh riêng**, cắt từ chính slide của khóa đó trong bộ slide
chính thức của FabLab (Google Slides, slide 5–34 cho chương trình trải nghiệm, 36–42 cho khóa
chuyên sâu). File ở `src/assets/images/stemlab-<id>.jpg`, 760×320; comment `// slide N` trong
`COURSE_IMAGES` ghi slide nguồn. Không còn ảnh dùng lại / gần đúng (`~`, `↺`) cho khóa học.

- Ảnh chọn bằng mắt, ưu tiên ảnh chụp thật buổi học. Slide chỉ có ảnh minh họa / ảnh sản
  phẩm / ảnh chụp phần mềm thì dùng ảnh đó (vd. Thiết kế website, Blockchain, các khóa chuyên
  sâu). "Thế giới điện tử" là ba ảnh module ghép trên nền trắng.
- Ảnh nhỏ hơn khung thì được phóng (tối đa ~1,3×): Khám phá xe robot, Làm quen trí tuệ nhân tạo,
  Lập trình Drone (tấm giữa của ảnh ghép 3 tấm), Thế giới robot, Thế giới điện tử.
- Database đang chạy nhận ảnh bằng `npm run images:replace -- course` (đường lưu của dashboard,
  có lịch sử — khôi phục được ảnh cũ). Database mới thì `npm run seed` tự gắn.

**Không lấp bằng ảnh stock.** Cần ảnh khác thì thay file rồi chạy lại `images:replace`, hoặc
tải lên qua dashboard.

## Đối tác & hoạt động

**Dải đối tác** ([Partners.jsx](src/components/Partners.jsx)) chạy ngang liên tục
bằng CSS thuần — track lặp danh sách hai lần rồi trượt `-50%` nên vòng lặp không
có mối nối. Rê chuột vào thì dừng để đọc kịp. Người dùng bật `prefers-reduced-motion`
thì dải đứng yên và chuyển sang cho cuộn ngang bằng tay (`marquee-viewport`), nên
không logo nào bị khuất hẳn.

Bốn tổ chức, đều có căn cứ trên site của trường, nhưng **chỉ 3 có logo** (EIU,
Becamex, Becamex Business Incubator). Hệ thống trường Việt Anh chỉ có văn bản lễ
ký kết 19/7/2022 nên hiển thị bằng chữ. Thêm đối tác: bỏ logo vào
`src/assets/images/`, khai báo trong `PARTNER_LOGOS` và thêm một mục vào
`partners.items`.

**Carousel hoạt động** ([Activities.jsx](src/components/Activities.jsx)) có 14 mục,
chia làm **hai khối riêng**, mỗi khối một carousel độc lập:

| Khối | Neo | Số mục |
|---|---|---|
| Cuộc thi | `#competitions` | 3 |
| Sự kiện & hội thảo | `#events` | 11 |

Mười hai mục lấy nguyên từ trang "Sự kiện" của trường; hai cuộc thi 2026
(EIU Drone Soccer Championship và EIU MCR 2026) lấy từ **poster chính thức do
FabLab cung cấp** — ngày, giờ và địa điểm đọc thẳng từ poster.

Mục nào thuộc khối nào **suy từ `kind`** (`competition` → Cuộc thi; `seminar`,
`workshop`, `partnership` → Sự kiện), không phải một trường riêng trong i18n —
`kind` đã quyết định điều đó rồi. Muốn chuyển một hoạt động sang khối kia thì đổi
`kind` của nó. Mỗi mục có nhãn loại và ngày thật.

> Tên section là "thường niên" theo yêu cầu, nhưng thực tế chỉ hai cuộc thi là có
> tính lặp lại; phần còn lại là hội thảo và workshop diễn ra một lần trong khoảng
> 2019–2023. Ngày của từng mục đều hiện trên thẻ nên người đọc thấy được điều đó.

Mười một ảnh riêng cho từng hoạt động, ba mục còn lại dùng lại ảnh thật khác của
FabLab (đánh dấu `// ~`). Carousel dùng `object-contain` trên nền pastel vì nguồn
trộn poster dọc với ảnh chụp ngang.

## Đội ngũ

Section "Đội ngũ của chúng tôi" ([Team.jsx](src/components/Team.jsx)) liệt kê 15
thành viên. **Tên và chức danh lấy nguyên văn** từ trang "Về chúng tôi" trên
Google Sites của FabLab (`sites.google.com/eiu.edu.vn/fablab`) — không có chỗ nào
là nội dung tự nghĩ ra. Chức danh tiếng Anh là bản dịch của chính chức danh đó.

Thứ tự và cách chia giữ đúng trang gốc:

| Nhóm trên trang gốc | Chức danh | Số người |
|---|---|---|
| Cơ cấu tổ chức | Giám đốc FabLab | 1 |
| Thành viên STEM Lab | Chuyên viên STEM | 10 |
| Thành viên FabLab | Kỹ thuật viên | 4 |

Không dựng tiêu đề nhóm riêng trên trang vì chức danh đã tự phân biệt.

Mỗi thẻ hiện **tên · chức danh · trình độ học vấn**. Học vấn cũng lấy từ chính
trang đó, chỉ rút gọn cho vừa thẻ: bỏ chữ nối "ngành", giữ nguyên bậc học và tên
ngành. Riêng Giám đốc FabLab trang ghi cả ba bằng kèm trường và năm (Kỹ sư 2005 ·
Thạc sĩ 2009 · Tiến sĩ 2013, ĐH Sungkyunkwan) — thẻ chỉ hiện bằng cao nhất.

### Bố cục: một thẻ riêng + hai dải chạy ngang

**Giám đốc FabLab có thẻ riêng đứng yên** phía trên, avatar lớn hơn và chức danh
dạng pill. Người này được đánh dấu bằng cờ `lead: true` trong `team.members` —
component lọc theo cờ chứ không viết cứng `id`, nên bàn giao vai trò chỉ là chuyển
cờ sang người khác. Thẻ riêng cố ý **không trôi**: một người mà cứ trôi qua trôi
lại thì mất luôn ý nghĩa "tách riêng".

Mười bốn người còn lại chạy thành **hai hàng marquee ngược chiều nhau** (7 sang
trái, 7 sang phải), dùng lại đúng cơ chế của dải đối tác: track lặp danh sách hai
lần rồi trượt `-50%` nên vòng lặp không có mối nối. Rê chuột vào thì dừng để đọc kịp.

Số người mỗi hàng **suy từ dữ liệu** (`Math.ceil(n / 2)` trên phần còn lại sau khi
tách `lead`), thêm hay bớt người thì hai hàng tự cân lại.

> Khoảng cách giữa các thẻ đặt bằng lề **trên từng thẻ**, không dùng `gap` trên
> track. Với `gap`, bản sao thứ hai lệch đi đúng nửa khoảng cách và vòng lặp sẽ có
> mối nối nhìn thấy được.

**Khi người dùng tắt chuyển động**, track đứng yên nên phần lớn thẻ nằm ngoài
khung. Utility `marquee-viewport` vì thế chuyển sang cho **cuộn ngang bằng tay** —
không ai bị mất nội dung. Dải đối tác dùng chung utility này.

Link "Cơ hội làm việc tại EIU" đã bỏ theo yêu cầu.

### Ảnh chân dung: 14/15 người

Ảnh do người dùng tự tải về từ trang Google Sites lúc đang đăng nhập — tải từ ngoài
chỉ nhận **403 Forbidden** (URL gắn phiên đăng nhập `.../sitesv/…`). Còn thiếu ảnh
của **Hoàng Ngọc Phương**; người này hiển thị avatar chữ cái đầu.

Ảnh nguồn là chân dung dọc (tỷ lệ 0,56–0,73), có ảnh chụp toàn thân, nên **không cắt
giữa được** — cắt giữa ra giữa thân người. Mỗi ảnh có khung cắt riêng, tính từ vị trí
mặt đo được trên ảnh gốc sao cho **đầu chiếm 46% cạnh khung** và đường mắt ở 40%
chiều cao, rồi thu về 240×240 (6–17 KB mỗi ảnh, tổng ~151 KB).

Cùng một luật cắt cho cả 14 ảnh là điều bắt buộc chứ không phải cho đẹp: avatar hiển
thị **bo tròn**, nên mặt lệch vài phần trăm ở khung vuông sẽ thành mất cằm khi bo.
Quy trình đầy đủ và những chỗ đã sập bẫy nằm ở [CLAUDE.md](CLAUDE.md).

**Bổ sung ảnh mới:** đưa file gốc vào thư mục, đặt tên `team-<id>.jpg` (`id` xem ở
`team.members` trong i18n), rồi khai báo trong `TEAM_IMAGES`
([index.js](src/assets/images/index.js)). Thiếu key thì component tự chuyển sang
avatar chữ cái. **Đừng lấy ảnh stock hay ảnh người khác lấp vào.**

> `team-linh` là ảnh duy nhất **không còn bản gốc độ phân giải cao** — nguồn duy
> nhất là bản 200×200 thời WordPress. Khung đã cắt lại cho khớp 13 ảnh kia, nhưng
> vùng cắt chỉ ~135px phóng lên 240 nên mềm nét hơn thấy rõ. Nên thay khi có ảnh mới.

### Chỗ trang gốc còn khuyết

**Nhóm FabLab có một ô thứ năm chỉ có ảnh**, không kèm tên lẫn chức danh — nên danh
sách ở đây chỉ có 4 kỹ thuật viên. Cố ý không tự điền, vì đây là người có thật.

**"Hoàng Ngọc Phương"** (tên đầy đủ và bằng Thạc sĩ Cơ điện tử) do người dùng bổ
sung trực tiếp; trang gốc chỉ ghi "Phương" kèm "Kỹ sư ngành Kỹ thuật phần mềm".

Ngoài ra hai người cùng ra chữ cái đầu **ĐT** (Đỗ Nguyễn Anh **T**uấn và
Đỗ **T**rung Tính). Tên hiện ngay dưới avatar nên không gây nhầm, nhưng sẽ hết khi
có ảnh thật.

> Cùng lưu ý như với ảnh hoạt động: xác nhận với FabLab EIU rằng các thành viên
> đồng ý cho đăng tên, chức danh và ảnh trên trang này.

## Hai nhóm khóa học

Section "Khóa học" chia làm hai khối hiển thị song song, mở section ra là thấy ngay
cả hai loại hình:

| Nhóm (`group`) | Tiêu đề hiển thị | Số khóa | Bộ lọc |
|---|---|---|---|
| `stem` | Khóa học STEM (khóa học chuyên sâu 8 buổi) | 7 | không |
| `experience` | Chương trình trải nghiệm STEM | 30 | có |

Nhóm nằm ở `courses.groups` trong i18n — **thứ tự trong mảng là thứ tự trên
trang**. Thêm nhóm thứ ba chỉ cần thêm một phần tử và gán `group` cho khóa học,
không phải sửa [Courses.jsx](src/components/Courses.jsx).

Khối nào quá 6 khóa (8 khóa từ màn `xl`, khi lưới lên 4 cột) thì cắt bớt và hiện nút
"Xem thêm"; mỗi khối có trạng thái mở rộng và bộ lọc riêng.

### Hai nhóm dùng hai bộ trường khác nhau

| | `stem` (7 khóa) | `experience` (30 chương trình) |
|---|---|---|
| Trường phân loại | `stage` + `topic` (+ `comingSoon`) | `stage` + `topic` |
| Chip trên ảnh | cấp học (TH/THCS, THPT) + "Sắp ra mắt" | cấp học (TH/THCS/THPT) |
| Dòng chân card | chip nhóm chủ đề | chip nhóm chủ đề |
| Nguồn nội dung popup | `intensiveDetails.*.js` (**viết tay**) | `experienceDetails.*.js` (**viết tay**) |

Kiểu thẻ cấp độ (`level` + `duration` + `age`) vẫn còn trong schema và dashboard nhưng hiện
không khóa nào dùng.

[CourseCard.jsx](src/components/CourseCard.jsx) render theo trường nào **có mặt**,
không nhận thêm prop kiểu.

Bảy khóa `stem` lấy từ bộ slide chính thức "Giới thiệu STEMLab" (slide 35–42): sáu khóa
8 buổi và "Thế giới điện tử" (sắp ra mắt, 3 module). Bốn khóa cũ của website trước (Cánh
tay Robot, Robot Hình người, Lập trình Scratch, Xe Robot) đã bỏ.

### Bộ lọc của nhóm trải nghiệm

Chỉ nhóm này có bộ lọc — bật bằng cờ `filterable: true` trên phần tử tương ứng của
`courses.groups`, không suy đoán theo số lượng. Hai hàng chip **độc lập, kết hợp
bằng AND**:

| Chiều | Giá trị | Số chương trình |
|---|---|---|
| **Cấp học** (`stages`) | Tiểu học · THCS · THPT | 3 · 11 · 16 |
| **Nhóm chủ đề** (`topics`) | Khoa học tự nhiên và Sự sống | 9 |
| | Kỹ thuật và công nghệ Robot | 11 |
| | AIoT & Công nghệ số | 10 |

Số trên mỗi chip là số chương trình còn lại **nếu chọn chip đó**, đã tính cả bộ lọc
của hàng kia — nên không bao giờ bấm vào một chip rồi nhận lưới rỗng bất ngờ. Chip
nào ra 0 thì bị vô hiệu hóa.

> Card mới hiện ra sau khi lọc **không có hiệu ứng trượt**. Phần tử vừa mount đã ở
> đúng trạng thái cuối ngay lần resolve style đầu tiên nên không có gì để transition
> — đây là đánh đổi đã biết của hệ reveal, không phải lỗi.

## Popup chi tiết khóa học

Bấm "Tìm hiểu thêm" trên card sẽ mở popup chi tiết. Popup dùng thẻ `<dialog>`
gốc của trình duyệt nên có sẵn bẫy focus, phím `Esc`, trả focus về đúng nút vừa
bấm và làm nền phía sau bất hoạt — không cần thư viện nào.

Nội dung popup đến từ **hai nguồn khác hẳn nhau**, trộn lại ở `courses.details`:

| File | Cho | Nguồn | Sửa tay? |
|---|---|---|---|
| `courseDetails.*.js` | 4 khóa STEM cũ (đã bỏ khỏi trang) | **sinh ra** từ scraper các trang LearnPress | ❌ mất khi chạy lại |
| `intensiveDetails.*.js` | 7 khóa học chuyên sâu | **viết tay** từ slide "Giới thiệu STEMLab" | ✅ đây là chỗ sửa |
| `experienceDetails.*.js` | 30 chương trình trải nghiệm | **viết tay** từ catalogue chính thức | ✅ đây là chỗ sửa |

File sinh ra có giới thiệu, đối tượng, kiến thức, kỹ năng, giáo trình và `sourceUrl`
trỏ về trang gốc. File viết tay chỉ có **`curriculum` bốn dòng** — đúng bằng những
gì catalogue cung cấp.

Popup **chỉ hiện mục nào thật sự có dữ liệu**, không có thì bỏ hẳn mục đó chứ không
bịa cho đầy. Vì thế popup của chương trình trải nghiệm chỉ hiện phần "Nội dung khóa
học", còn popup của khóa học chuyên sâu hiện "Đối tượng" + 8 buổi.

> `cnc` là id duy nhất trùng giữa danh sách cũ và mới. Mục viết tay **thay hoàn
> toàn** mục sinh ra cùng tên (spread nông ở cấp một) — đúng ý định, vì đây là hai
> chương trình khác nhau.

## ⚠️ Nội dung cần thay bằng dữ liệu thật

Website gốc không công bố những thứ dưới đây, nên bản seed dùng **giá trị giả định**
để trang có hình hài (mỗi chỗ có comment `// TODO` trong `vi.js` / `en.js`). Sửa bằng
dashboard; cột "Hiện tại" là bản dự phòng đã commit (`snapshot.json`, rev 90):

| Nội dung | Màn hình dashboard | Hiện tại |
|---|---|---|
| Số liệu thống kê | Số liệu | 20.000+ · 30+ · 12.000+ · 20+ — xác nhận đã là số thật chưa |
| 3 cảm nhận học viên | Cảm nhận | Tên và nội dung **vẫn hư cấu hoàn toàn** |
| Email · điện thoại · địa chỉ | Chân trang › Liên hệ | Cần xác nhận lại |
| Link mạng xã hội | Chân trang › Kênh mạng xã hội | Facebook đã có link; YouTube và Website EIU vẫn `#` |

Mọi nút "Đăng ký" (menu, popup khóa học, khối cuối trang) đã mở form đăng ký thật —
xem mục [Form đăng ký và thống kê](#form-đăng-ký-và-thống-kê).

### Riêng dữ liệu khóa học

**Tên chương trình, phân loại và bốn dòng nội dung của 30 chương trình trải nghiệm
lấy nguyên văn từ catalogue chính thức của FabLab EIU.** Hai thứ dưới đây thì không:

| Thứ | Ai viết | Cần làm gì |
|---|---|---|
| Mô tả ngắn trên card (30 dòng) | **dự án tóm tắt** từ chính 4 gạch đầu dòng của mỗi chương trình | rà lại nếu muốn giọng văn của trường |
| Toàn bộ bản tiếng Anh của 30 chương trình | **bản dịch của dự án**, không phải bản EN chính thức | ⚠️ nên nhờ trường duyệt trước khi lên production |

Bốn khóa nhóm `stem` lấy từ nội dung thật trên `fablab.eiu.edu.vn`; `age` và
`duration` là số thật từ trang khóa học. Riêng `age` của khóa Scratch trang gốc
không ghi nên vẫn để giả định `8+`.

> **Nợ kỹ thuật:** bỏ các khóa cũ khiến `courseDetails.*.js` còn 15 mục không ai tra
> tới (~25 KB nguồn vẫn bị đóng gói). Không xoá tay vì đó là file sinh ra — cách
> sạch là chỉnh bộ scraper cho danh sách mới rồi chạy lại.

Khóa học chuyên sâu không có `duration` / `age`: slide chỉ ghi cấp học và 8 buổi, nên cấp
học nằm ở chip và "Đối tượng" trong popup, số buổi nằm ở mô tả và giáo trình.

## Menu điều hướng

Thanh menu có bốn mục, trong đó hai mục mở ra submenu:

```
Về chúng tôi     FabLab ▾            StemLab ▾               Sự kiện
   #about           │                   │                     #events
                    ├─ Thiết bị         ├─ Khóa học STEM
                    │    #facilities    │    #courses-stem
                    ├─ Dự án            └─ Khóa học trải nghiệm
                    │    #projects           #courses-experience
                    └─ Cuộc thi
                         #competitions
```

"Cuộc thi" và "Sự kiện" cùng trỏ vào section Hoạt động nhưng khác khối — menu
không phản chiếu cấu trúc trang, "Sự kiện" được đưa lên cấp một cho dễ tìm.

Toàn bộ nằm ở `nav.links` trong i18n. Mục có `children` là nhánh mở submenu và
**không có `href`** — nó là nút bật/tắt, không phải link, vì hai nhánh này không
ứng với section nào của riêng chúng.

Bốn neo cấp hai được dựng riêng cho menu này và **suy từ dữ liệu**: neo nhóm khóa
học là `` `courses-${group.id}` ``, neo khối hoạt động là chính `group.id`. Thêm
nhóm mới thì neo tự có, nhưng phải tự thêm một mục con vào `nav.links` nếu muốn nó
lên menu.

Trên desktop submenu là panel thả xuống (mở bằng chuột hoặc bàn phím, đóng bằng
`Esc` / bấm ra ngoài / rời focus); trong drawer mobile nó là accordion mở tại chỗ.

Drawer mobile là một `<dialog>` gốc mở bằng `showModal()`, giống các popup khác: trình
duyệt giữ focus trong drawer, `Esc` đóng và trả focus về nút menu, nền phía sau bất
hoạt, và khoá cuộn đặt trên `<html>`. Nới cửa sổ qua 1024px lúc đang mở thì drawer tự đóng.

## Ghi chú kỹ thuật

- **Ngôn ngữ** lưu ở `localStorage['fablab-lang']`, mặc định `vi`. Mỗi lần đổi,
  `<html lang>` được cập nhật theo để screen reader và SEO nhận đúng.
- **Navbar** tô sáng link theo section đang xem bằng `IntersectionObserver`; nhánh
  cấp một sáng khi bất kỳ mục con nào của nó đang được xem.
- **Số liệu** đếm tăng khi cuộn tới, và hiện thẳng số cuối nếu người dùng bật
  `prefers-reduced-motion`.
- Mọi truy cập `localStorage` đều bọc `try/catch` — trình duyệt ở chế độ riêng
  tư có thể ném lỗi khi đọc/ghi.
