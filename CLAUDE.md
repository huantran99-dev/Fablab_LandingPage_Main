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

Courses và Activities đều có **hai khối** bên trong. Chiều của khối gán theo chỉ
số chứ không viết cứng, và luôn bắt đầu ngược chiều tiêu đề section: Courses tiêu
đề `right` → khối `left`/`right`; Activities tiêu đề `left` → khối `right`/`left`.
Thêm khối thứ ba là nó tự xen kẽ tiếp. Tiêu đề phụ của khối để `up`, không trượt
ngang, kẻo section thành quá ồn.

Chia một section làm hai khối **không** ảnh hưởng nhịp giữa các section — tiêu đề
section giữ nguyên chiều cũ nên không phải lật những section phía sau.

**Thêm hay bỏ section ở giữa là phải đảo chiều mọi section phía sau** để giữ nhịp
xen kẽ. Thêm Team đã kéo theo việc lật Testimonials; thay Process bằng
Partners + Activities lại kéo theo lật cả Team lẫn Testimonials lần nữa.

## Menu hai cấp và bảng neo

Navbar có bốn mục cấp một: **Về chúng tôi** và **Sự kiện** (link thường), **FabLab**
và **StemLab** (hai nhánh mở submenu). Nhánh là `<button>` chứ không phải `<a>` và
trong i18n **không có `href`** — chúng không ứng với section nào của riêng mình,
chỉ gom các mục con.

| Mục | Cấp | Neo | Sinh ra ở đâu |
|---|---|---|---|
| Về chúng tôi | 1 | `#about` | `<Section id="about">` |
| Sự kiện | 1 | `#events` | suy từ `activities.groups[].id` |
| Thiết bị | 2 (FabLab) | `#facilities` | `<Section id="facilities">` |
| Cuộc thi | 2 (FabLab) | `#competitions` | suy từ `activities.groups[].id` |
| Khóa học STEM | 2 (StemLab) | `#courses-stem` | suy từ `` `courses-${group.id}` `` |
| Khóa học trải nghiệm | 2 (StemLab) | `#courses-experience` | như trên |

**"Sự kiện" đứng ở cấp một dù nội dung của nó nằm trong section Hoạt động** cùng với
"Cuộc thi" — đây là lựa chọn của người dùng, không phải sơ suất. Hai mục cùng trỏ
vào một section nhưng khác khối, và menu không cần phản chiếu cấu trúc trang.

Bốn neo **được dựng riêng cho menu này** và đều suy từ dữ liệu i18n, không
viết cứng — thêm nhóm khóa học hay khối hoạt động thì neo tự có. Nhưng `nav.links`
là dữ liệu, không tự cập nhật: **thêm nhóm mà muốn nó lên menu thì phải tự thêm
một mục con**.

`Section` của Courses (`#courses`) và Activities (`#activities`) vẫn còn và footer
vẫn trỏ vào — đừng xoá.

**Đừng chép tay danh sách id vào Navbar.** `sectionIds` làm phẳng qua `children`
của `nav.links`; đây là lần thứ hai chỗ này gây lỗi (lần trước là hardcode
`'process'` sau khi xoá section).

Mở/đóng theo mẫu **Disclosure Navigation** của WAI-ARIA: nút bật/tắt panel, Tab đi
xuyên qua bình thường, không cần roving tabindex. Panel đệm bằng khoảng độn TRÊN
panel chứ không bằng lề — có lề là có khe chết, chuột đi từ nút xuống panel sẽ làm
menu đóng giữa chừng. Drawer mobile dùng chung state `openBranch` với thanh
desktop (hai thứ không bao giờ cùng hiện) nhưng render dạng accordion.

### `useActiveSection` chọn theo thứ tự tài liệu

Hai điểm phải giữ, cả hai đều từng sai trong bản đầu:

1. `entries` mỗi lần callback **chỉ chứa phần tử vừa đổi trạng thái**, không phải
   toàn bộ phần tử đang lọt — nên phải cộng dồn vào một `Set` sống qua các lần gọi.
2. Thứ tự trong `entries` **không theo thứ tự tài liệu**. Phải sắp phần tử một lần
   lúc dựng observer bằng `compareDocumentPosition` rồi lấy mục **cuối cùng** đang
   lọt.

Với ba section cách xa nhau thì hiếm khi lộ. Với `#courses-stem` và
`#courses-experience` nằm liền nhau trong cùng một section thì cả hai thường xuyên
cùng cắt dải quan sát `[88px, 45vh]`, và lấy `entries[0]` sẽ làm link nhấp nháy.

## Marquee: hai chỗ dùng, hai bài học

Dải đối tác ([Partners.jsx](src/components/Partners.jsx)) và đội ngũ
([Team.jsx](src/components/Team.jsx)) dùng chung `marquee-track`. Team chạy **hai
hàng ngược chiều nhau** — chiều ngược đặt bằng `animation-direction` inline, không
cần thêm keyframe (rule tắt chuyển động nhắm `animation-name` nên vẫn hiệu lực với
cả hai chiều).

**Khoảng cách giữa các mục phải nằm TRÊN TỪNG MỤC, không được dùng `gap` trên
track.** Track có N mục cộng một `<span>` chứa N bản sao. Với `gap: g`, track có N
khoảng còn span có N−1 khoảng, nên nửa chiều rộng không bằng chiều rộng một bản
sao — lệch đúng `g/2` và vòng lặp có mối nối nhìn thấy được. Lề phải trên từng thẻ
thì hai bản sao rộng bằng nhau tuyệt đối. Partners né chuyện này bằng `px` trên
từng mục; Team dùng `mr` — cùng một nguyên tắc.

**Tắt chuyển động thì phải cho cuộn ngang.** Rule reduced-motion chỉ dừng
animation, track đứng nguyên ở vị trí đầu và phần lớn mục nằm ngoài khung — nội
dung biến mất với đúng nhóm người dùng cần được phục vụ tử tế nhất. Utility
`marquee-viewport` chuyển `overflow-x` sang `auto` trong `prefers-reduced-motion`.
Đặt `overflow: hidden` cả hai trục chứ không chỉ `overflow-x`: một trục `hidden` mà
trục kia `visible` thì CSS tự nâng trục kia thành `auto` và sinh thanh cuộn dọc.

**Partners hiện CHƯA có `marquee-viewport`** — vẫn còn lỗi mất nội dung đó. Sửa thì
đổi `overflow-hidden` thành `marquee-viewport` là xong.

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

**Poster do người dùng cung cấp: đọc nội dung, đừng tin tên file.** Hai cuộc thi
2026 đến từ poster chính thức chứ không phải trang Sự kiện. File nhận được tên là
`activity-mcr-2025.png` nhưng poster ghi rõ **2026** — tên file sai, nội dung đúng.
Poster cũng phải nén về khung chung trước khi dùng: hai file gốc nặng 514 KB và
2,4 MB, trong khi cả bộ ảnh hoạt động chỉ 47–99 KB mỗi ảnh.

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

**Đội ngũ: 14/15 người có ảnh.** Ảnh do người dùng tự tải về từ trang Google Sites
`sites.google.com/eiu.edu.vn/fablab` lúc đang đăng nhập — agent tải từ ngoài chỉ
nhận **403 Forbidden** (URL gắn phiên đăng nhập `.../sitesv/…`; đã thử bỏ tham số
kích thước và gửi kèm `Referer`, vẫn 403). **Đừng tốn lượt thử tải lại** — nhờ người
dùng đưa file, y như cách họ đã đưa hai poster cuộc thi.

Còn thiếu ảnh của `phuong`. `TEAM_IMAGES` thiếu key thì
[Team.jsx](src/components/Team.jsx) tự dựng avatar chữ cái đầu. **Đừng lấp bằng ảnh
stock hay ảnh người khác** — đây là người có thật, gán sai mặt là bịa danh tính.

### Cắt ảnh chân dung: KHÔNG cắt giữa được

Ảnh nguồn là chân dung dọc (tỷ lệ 0,56–0,73), có ảnh chụp toàn thân. Cắt giữa sẽ ra
giữa thân người, không có mặt. Quy trình đã dùng, lặp lại được:

1. Dựng **bảng ảnh** (contact sheet) xem cả bộ cùng lúc — xác nhận đúng người.
2. Dựng **bảng đo**: vẽ lưới phần trăm lên ảnh gốc để ĐỌC RA vị trí mặt thay vì
   đoán. Bước này bắt buộc: lần đầu tôi đoán mặt ở 22–30%, đo ra mới biết hai ảnh
   có mặt ở **42%** (người đứng xa) và khung cắt trượt hẳn khỏi người. Mỗi bảng
   tối đa 3 ảnh — gộp 7 ảnh vào một bảng thì đọc sai vài phần trăm, đủ để hỏng.
3. Cắt bằng **ba số đo được**, không phải bằng tâm/cạnh khung tự đặt: đỉnh tóc,
   cằm, tâm mặt theo chiều ngang. Script tự tính khung sao cho **đầu chiếm 46%
   cạnh ô vuông** và **đường mắt ở 40% chiều cao khung**.
4. **Xem lại bản đã cắt trong khung TRÒN** — thẻ hiển thị bo tròn, nên cằm hoặc
   trán sát mép vuông sẽ bị khuyết khi bo.

**Vì sao đổi từ `Cx`/`Cy`/`Side` sang ba số đo.** Bản đầu nhập thẳng tâm và cạnh
khung, mỗi ảnh một con số tự đặt. Kết quả: `manh` lệch trái (tâm mặt thật ở 53,8%
chứ không phải 48%), `nhi` và `huan` bị **hình tròn cắt mất cằm** (tâm đặt quá cao),
mỗi ảnh một cỡ mặt. Sai số này gần như vô hình ở khung vuông và chỉ lộ ra khi bo
tròn. Nhập số đo rồi để máy tính khung thì 14 ảnh ra cùng một bố cục, kiểm bằng số
được (`dau=0.46` cho mọi ảnh) chứ không phải bằng mắt.

Khung tự kẹp vào trong ảnh khi tràn mép, nên vài ảnh có đường mắt lên 0,32–0,33
thay vì 0,40 (`hung`, `tinh`, `nhi` — đầu sát mép trên ảnh gốc). Đó là đánh đổi
đúng: thà mặt hơi cao còn hơn lọt vùng trống ngoài khung.

Script nằm ở scratchpad (`contact-sheet.ps1`, `measure2.ps1`, `crop-team2.ps1`,
`avatar-preview.ps1`). Ảnh gốc sao lưu ở `team-originals/`, bản cắt cũ ở
`team-crop-v1/` — **cả hai đều ngoài git**, đừng coi là có sẵn ở lượt sau.

**Ảnh cũ và ảnh mới cùng tên có thể là hai người khác nhau.** `team-hien` và
`team-phuoc` bản WordPress cũ so với bản Google Sites mới là hai khuôn mặt khác hẳn
(kính, dáng mặt). Đã lấy bản mới theo chỉ dẫn của người dùng và báo lại. Nếu gặp
lại tình huống này: **mở cả hai ra so mặt**, đừng ghi đè im lặng.

`team-linh` là ảnh duy nhất **không còn bản gốc** — nguồn duy nhất là bản 200×200
thời WordPress. Đã cắt vào để khung khớp 13 người kia, nhưng vùng cắt chỉ ~135px
phóng lên 240 nên mềm nét hơn thấy rõ. Có ảnh chụp mới thì thay.

Trang gốc còn một chỗ khuyết, **cố ý giữ nguyên**: nhóm FabLab có một ô thứ năm chỉ
có ảnh mà không có tên. Đừng suy đoán rồi điền vào.

"Hoàng Ngọc Phương" (tên đầy đủ, Thạc sĩ Cơ điện tử) do người dùng tự sửa vào
`vi.js`; trang gốc chỉ ghi "Phương" kèm "Kỹ sư ngành Kỹ thuật phần mềm". **Người
dùng sửa một từ điển thì phải đồng bộ sang từ điển kia** — lần này `en.js` bị bỏ
quên và script kiểm bắt được vì tên người không được phép khác nhau giữa hai bản.

**Giám đốc FabLab tách ra một thẻ riêng** đứng trên hai dải chạy, đánh dấu bằng cờ
`lead: true` trong `team.members`. [Team.jsx](src/components/Team.jsx) lọc theo cờ,
**không viết cứng `id`** — bàn giao vai trò là chuyển cờ, không phải sửa component.
Người này bị loại khỏi dải chạy để không hiện hai lần.

`education` cũng lấy từ trang đó, chỉ bỏ chữ nối "ngành" cho vừa thẻ. Trang còn ghi
**chức vụ kiêm nhiệm ở EIU** cho bốn người (Phó trưởng khoa Kỹ thuật, Trợ giảng,
Giảng viên khoa Giáo dục đại cương) — hiện chưa đưa lên trang vì người dùng chỉ yêu
cầu chức danh trong FabLab.

Khi bóc trang này, **bóc hai lần với hai câu hỏi khác nhau rồi đối chiếu**: lần đầu
mô hình trích xuất gán trùng một URL ảnh cho ba người khác nhau.

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

Section khóa học chia làm hai khối. Nhóm nằm ở `courses.groups` (mảng, thứ tự trong
mảng chính là thứ tự hiển thị); mỗi khóa trỏ về nhóm bằng trường `group`.

| `group` | Tiêu đề | Số khóa | Bộ lọc |
|---|---|---|---|
| `stem` | Khóa học STEM | 4 | không |
| `experience` | Chương trình trải nghiệm STEM | 30 | có |

**Hai nhóm cố ý mang hai bộ trường khác nhau**, và [CourseCard.jsx](src/components/CourseCard.jsx)
render theo trường nào CÓ MẶT chứ không nhận prop kiểu:

| | `stem` | `experience` |
|---|---|---|
| Phân loại | `level` | `stage` + `topic` |
| Chip trên ảnh | cấp độ | cấp học (TH/THCS/THPT) |
| Dòng chân card | `duration` · `age` | chip nhóm chủ đề |
| Icon | tra theo `id` | tra theo `icon` |

Bốn khóa `stem` đọc từ breadcrumb `fablab.eiu.edu.vn/courses/<slug>/`, `duration`
và `age` là số thật từ trang khóa học. 30 chương trình `experience` lấy từ
**catalogue chính thức do FabLab cung cấp** — catalogue không có thời lượng, độ
tuổi hay mô tả ngắn, nên đừng đi tìm rồi điền vào.

### Bộ lọc đã QUAY LẠI — đừng bỏ đi lần nữa

Tài liệu cũ từng ghi "không còn nút lọc": bộ lọc bị bỏ hồi section chỉ có 16 khóa
chia hai nhóm, lúc đó hai nhóm là đủ. Với **30 chương trình trong một nhóm** thì lý
do đó không còn đúng, và bộ lọc được thêm lại theo yêu cầu của người dùng.

Bật bằng cờ `filterable: true` trên phần tử của `courses.groups`, **không suy đoán
theo số lượng**. Hai hàng chip (`stages`, `topics`) độc lập, kết hợp bằng AND.

Hai điều dễ làm hỏng:

- **Đừng reset `expanded` khi đổi bộ lọc bằng effect** — đụng luật lint
  `react(set-state-in-effect)`. `hasMore` vốn tính từ số card đã lọc nên nút tự
  ẩn/hiện đúng, không cần reset.
- **Đừng viết rằng lọc có hiệu ứng trượt.** Card vừa mount đã ở trạng thái cuối
  ngay lần resolve style đầu tiên nên không có gì để transition (xem bẫy 4 ở trên).

`stage` / `topic` / `icon` của từng chương trình đều là khóa tra cứu: sai một chữ
là chip trống hoặc huy hiệu rỗng, **không có cảnh báo lúc build**.

**Bậc heading trong section này: h2 (section) → h3 (nhóm) → h4 (tên card).** Thêm
nhóm hay đổi bố cục thì giữ nguyên thứ bậc, đừng để hai h3 ngang hàng với tên card.

**Bậc heading trong section này: h2 (section) → h3 (nhóm) → h4 (tên card).** Thêm
nhóm hay đổi bố cục thì giữ nguyên thứ bậc, đừng để hai h3 ngang hàng với tên card.

### Hai file nội dung popup, hai luật ngược nhau

`courses.details` trộn hai nguồn: `{ ...courseDetails*, ...experienceDetails* }`.

| File | Cho | Sửa tay? |
|---|---|---|
| `courseDetails.*.js` | 4 khóa STEM | **KHÔNG** — file sinh ra, sửa là mất |
| `experienceDetails.*.js` | 30 chương trình trải nghiệm | **CÓ** — viết tay có chủ đích |

Nhầm file là mất công hoặc mất dữ liệu. Đầu mỗi file đều ghi rõ nó thuộc loại nào.

`cnc` là id duy nhất trùng giữa hai file; spread nông nên mục viết tay **thay hoàn
toàn** mục sinh ra cùng tên — đúng ý định, vì đó là hai chương trình khác nhau.

Bỏ 12 khóa cũ để lại 11 mục mồ côi trong `courseDetails.*.js` (~25 KB vẫn bị đóng
gói). Cố ý không xoá tay; cách sạch là chỉnh bộ scraper rồi chạy lại.

### courseDetails.*.js là file SINH RA, đừng sửa tay

Nội dung bóc từ các trang LearnPress thật trên `fablab.eiu.edu.vn`
(`/courses/<slug>/`, khối `div.thim-course-content`, tiêu đề mục nằm trong
`<strong>`). Sửa tay sẽ mất khi ai đó chạy lại bộ sinh. Mỗi mục có `sourceUrl` để
đối chiếu với trang gốc.

Shape của `courses.details` **cố ý không đối xứng** giữa hai ngôn ngữ: khóa nào
trang gốc không có mục đó thì thiếu hẳn key, và popup chỉ render mục có dữ liệu.
Quy ước "hai từ điển cùng shape" chỉ áp cho chữ giao diện. Năm khóa không có trang
tiếng Anh được đánh dấu `viOnly: true`.

## Hai khối hoạt động

Section Hoạt động cũng chia hai khối như section Khóa học: **Cuộc thi** (2 mục) và
**Sự kiện & hội thảo** (11 mục), mỗi khối một carousel riêng gọi `useCarousel` của
chính nó.

**Khối nào chứa hoạt động nào suy từ `kind`, KHÔNG có trường `group` trong i18n.**
Đây là chỗ cố ý khác với section Khóa học. Courses buộc phải có
`courses.items[].group` vì chuyên mục của trường không suy ra được từ trường nào
khác; còn ở đây `kind` đã là thứ quyết định — "cuộc thi" đúng bằng
`kind: 'competition'`. Bảng ánh xạ nằm ở `KIND_GROUP` trong
[Activities.jsx](src/components/Activities.jsx). Muốn chuyển một hoạt động sang
khối kia thì **đổi `kind` của nó**, đừng thêm trường mới.

Thêm một `kind` mới mà quên thêm vào `KIND_GROUP` thì hoạt động đó **biến mất khỏi
trang** (rơi vào bucket `undefined`, không có cảnh báo lúc build). Script kiểm
trong scratchpad có chốt chặn cho việc này.

**Bậc heading: h2 (section) → h3 (khối) → h4 (tên hoạt động).** Giống hệt section
Khóa học, và cùng một cái bẫy: thêm h3 cho khối mà quên hạ tên hoạt động xuống h4
thì outline có hai h3 ngang hàng.

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
- **Tên biến PowerShell không phân biệt hoa thường.** Script cắt ảnh đặt hằng số
  cạnh ảnh là `$OUT` rồi dùng `$out` cho đường dẫn file — chúng là **một biến**,
  nên từ vòng lặp thứ hai cạnh ảnh biến thành đường dẫn và mọi ảnh sau ảnh đầu
  đều hỏng. Thông báo lỗi chỉ vào `DrawImage` chứ không chỉ vào chỗ sai.
- `New-Object Type ($a), ($b)` bị PowerShell gom tham số sai. Dùng `[Type]::new()`.
  `Measure-Object` trả `Double`, ép `[int]` trước khi đưa vào `Bitmap::new`.
- **Grep CSS đã build phải tính tới biến thể.** Class có `sm:` được sinh ra dưới
  tên `.sm\:size-20`, tìm `.size-20{` sẽ báo thiếu trong khi code hoàn toàn đúng.
  Đây là lần thứ ba script kiểm sai chứ không phải code sai — nghi ngờ script trước.

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
