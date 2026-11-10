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
đừng tạo). Linter là **oxlint** (`npm run lint`), không phải ESLint. Backend
**ExpressJS + SQLite** trong [server/](server/), phục vụ dashboard quản trị.

## ⚠️ Nội dung KHÔNG còn nằm ở `src/i18n/*.js`

Đây là điều dễ quên nhất và đắt nhất khi phát hiện lại. **Sửa `vi.js` hay `en.js`
bây giờ không có tác dụng gì** — không component nào import chúng nữa.

| Nguồn | Vai trò |
|---|---|
| `data/fablab.db` | **Nguồn sự thật.** Dashboard ghi vào đây. Ngoài git. |
| [src/content/snapshot.json](src/content/snapshot.json) | Bản dự phòng đóng gói vào bundle. **Sinh ra nhưng CÓ commit.** |
| `src/i18n/*.js` | **Chỉ còn là hồ sơ nguồn gốc + corpus seed.** Không ai import. |

Trang vẽ ngay bằng snapshot rồi gọi `/api/content` thay nóng
([contentStore.js](src/lib/contentStore.js)). Nhờ vậy không bao giờ trắng trang, và
API chết thì vẫn đủ nội dung — chỉ là bản của lần build gần nhất. Snapshot tự tươi
lại ở bước `prebuild` mỗi lần `npm run build`.

Muốn đổi nội dung: dùng dashboard, hoặc sửa DB. Muốn dựng lại DB từ đầu: xoá
`data/fablab.db` rồi `npm run seed` — đó là lúc duy nhất `src/i18n/*.js` còn được
đọc tới.

## Quy ước bắt buộc

- **Nội dung không hardcode trong component.** Mọi chữ đi qua `useT()`; hai ngôn
  ngữ phải luôn cùng cấu trúc khoá (xem bảng trên về nơi chữ thật sự nằm). `id` /
  `group` / `level` của khóa học **không được dịch** — dùng làm React key và khóa
  tra icon.
- **Chạy `npm run check:content` và `npm run check:snapshot` trước khi tin là
  xong.** Repo không có bộ test; hai lệnh này là thứ thay thế.
- **Button không bao giờ có shadow.** Trong hệ "Loom" shadow chỉ thuộc về card và
  khung ảnh.
- Mọi nút đi qua `ui/Button.jsx`, mọi nhãn qua `ui/Pill.jsx`, mọi section qua
  `ui/Section.jsx`. Đây là chốt chặn giữ style khỏi lệch.
- Mọi truy cập `localStorage` phải bọc `try/catch` (chế độ riêng tư ném lỗi).
- **Chữ rớt đơn lẻ ở dòng cuối: hai lớp, đừng gỡ lớp nào.** `body { text-wrap: pretty }`
  ở index.css (tiêu đề dùng `balance`), cộng [tieLastWords](src/lib/typography.js) nối hai
  chữ cuối mỗi chuỗi bằng U+00A0 lúc NẠP nội dung trong contentStore. Chỉ có CSS thì còn
  25 chỗ (Chrome bỏ qua khi chữ cuối dài như "2019–2023.", Firefox không hỗ trợ `pretty`);
  có cả hai thì 0, đo bằng puppeteer ở 5 bề rộng × 2 ngôn ngữ kể cả popup. **Đừng chèn
  `&nbsp;` vào database** — admin sửa chữ là mất. Thêm khoá tra cứu mới (kiểu `kind`,
  `stage`) thì thêm vào `SKIP_KEYS`, kẻo id bị dính ký tự lạ và tra hụt.

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

**Nhưng `body` cắt thôi là KHÔNG đủ trên điện thoại.** Trình duyệt mobile vẫn tính phần
khối reveal đang dịch ±56px vào bề ngang trang: trang 390px dàn thành ~426px, bị thu nhỏ
hoặc kéo ngang được, vuốt hàng thẻ thì cả trang trôi theo. Vì vậy
[Section.jsx](src/components/ui/Section.jsx) có `overflow-x-clip` — cắt tại nguồn, vẫn là
`clip` nên không tạo vùng cuộn, chiều dọc không bị cắt, navbar vẫn dính (đã đo: header
`top = 0` sau khi cuộn ở cả 390px lẫn 1280px). `Hero` và `FinalCTA` tự dựng `<section>`
nhưng chỉ trượt dọc nên không cần.

**Đừng truyền utility ẩn/hiện (`hidden sm:…`) vào `Button`/`Pill`.** Hai component đó
có sẵn `inline-flex` trong class gốc, và trong CSS đã build `.inline-flex` phát sinh SAU
`.hidden` nên luôn thắng: nút "Đăng ký ngay" của navbar từng hiện cả trên điện thoại (lỗi
có từ commit đầu tiên), đẩy thanh menu rộng ~480px. Đặt ẩn/hiện lên một phần tử **bọc**
(`hidden sm:contents` — `contents` để bố cục từ `sm` trở lên y như cũ). Cùng lý do, cỡ của
`Pill` đi qua prop `size` (`md` mặc định, `lg` cho nhãn đầu section và hero) — đừng truyền
`text-*` / `px-*` vào `className`.

**4. Transition KHÔNG chạy trên phần tử vừa mount.** Card mới (bấm "Xem thêm")
khớp `[data-reveal-group=shown] > *` ngay từ lần resolve style đầu tiên nên tính
ra `opacity: 1` — không có thay đổi giá trị thì không có transition.
`animation` thì ngược lại, vẫn chạy. Đang chấp nhận đánh đổi này để đổi lấy hiệu
ứng hai chiều; đừng viết vào tài liệu hay comment rằng lọc/mở rộng "được animation
miễn phí" — nó không đúng.

### Hướng trượt hiện tại

Thứ tự trang (từ 2026-10-20, xưởng và thiết bị lên đầu): Hero → StatsBar → **Facilities →
Projects** → Pillars → Courses → Activities → Team → Partners → Testimonials → FinalCTA.

**Chiều không còn viết cứng trong component** (từ 2026-11-03, cùng lúc có công tắc bật/tắt
section). [App.jsx](src/App.jsx) dựng các khối từ `PAGE_SECTIONS`, bỏ khối đang tắt, rồi
đưa prop `side` cho 8 khối thuộc `RHYTHM` ([pageSections.js](src/lib/pageSections.js)) theo
thứ tự trong số khối ĐANG HIỆN: khối nhịp thứ 0 `left`, thứ 1 `right`… Tiêu đề trượt theo
`side`, nội dung theo `opposite(side)`. Không tắt khối nào thì ra đúng chiều cũ:
Facilities `left`/`right` → Projects `right`/`left` → Pillars `left`/`right` → Courses
`right`/`left` → Activities `left`/`right` → Team `right`/`left` → Partners
`left`/`right` → Testimonials `right`/`left` (đã đo: trước và sau một vòng tắt/bật khớp
tuyệt đối). Trong Pillars: h3 Sứ mệnh `up`,
lưới trụ cột `opposite(side)`, rồi khối chia đôi Tầm nhìn `left` | Giá trị cốt lõi `right` (nền trắng,
ngăn bằng đường kẻ — cố ý KHÔNG dùng nền navy, vì FinalCTA đã giữ bề mặt tối). Hai chiều của
khối chia đôi là chiều THEO VỊ TRÍ trên màn hình, nên giữ cố định, không đi theo `side`. StatsBar · FinalCTA · Footer · nút "Xem thêm" ·
link tuyển dụng · chấm tròn dùng mặc định `up`.

Courses và Activities đều có **hai khối** bên trong. Chiều của khối gán theo chỉ
số chứ không viết cứng, và luôn bắt đầu ngược chiều tiêu đề section (`opposite(side)`,
rồi `side`): mặc định Courses tiêu đề `right` → khối `left`/`right`; Activities tiêu đề
`left` → khối `right`/`left`.
Thêm khối thứ ba là nó tự xen kẽ tiếp. Tiêu đề phụ của khối để `up`, không trượt
ngang, kẻo section thành quá ồn.

Chia một section làm hai khối **không** ảnh hưởng nhịp giữa các section — tiêu đề
section giữ nguyên chiều cũ nên không phải lật những section phía sau.

Tắt / bật một khối ở giữa **không phải lật tay gì cả** — nhịp tự tính lại. (Trước đây thêm
Team đã kéo theo lật Testimonials, thay Process bằng Partners + Activities lại kéo theo lật
cả Team lẫn Testimonials.) **Thêm section mới vào trang** thì: thêm khoá vào `PAGE_SECTIONS`
(+ `TOGGLEABLE_SECTIONS` ở schema máy chủ, `toggleable: true` ở descriptor — `check:admin` so
ba danh sách), component vào `COMPONENTS` trong App.jsx, vào `RHYTHM` nếu nó đi nhịp (nhận
prop `side`), và neo của nó vào `sectionAnchors`.

## Bật/tắt section (từ 2026-11-03, API 20)

Cả 11 khối của trang (Hero → FinalCTA) có công tắc "Hiện section này trên trang công khai"
ở đầu trang soạn của chính nó ([SectionVisibility.jsx](src/admin/editor/SectionVisibility.jsx)).
Thanh menu, footer, form đăng ký không tắt được. Thanh bên dashboard gắn nhãn "Ẩn" (đọc
`meta.sections[].hidden`).

- **Dữ liệu: `hidden: true` ở cấp trên cùng của section**, vắng = hiện — không cần migration,
  bản cũ vẫn hợp lệ. Công tắc ghi vào CẢ HAI bản của bản nháp, chỉ áp khi Lưu ("Bỏ thay đổi"
  huỷ được). Invariants mục 3f chặn hai bản lệch nhau (chỉ xảy ra khi sửa tay database).
- **Khôi phục một bản lịch sử cũ là khôi phục luôn trạng thái ẩn/hiện của bản đó** — bản
  trước ngày có công tắc không có khoá, nên khối HIỆN lại. Đúng ý (khôi phục = trở về y như
  lúc đó) nhưng dễ bất ngờ.
- **Link tự ẩn khi đích tắt** qua [useLiveHref](src/hooks/useLiveHref.js): menu (nhánh hết
  mục con thì bỏ hẳn, cả drawer), footer (cột rỗng thì bỏ), nút Hero `#courses` /
  `#facilities`, nút link của popup sự kiện mùa. Neo của mỗi khối ở `sectionAnchors`; neo
  theo nhóm (`courses-stem`, `events`…) vẫn suy từ dữ liệu. **Hero không bao giờ làm mất
  `#top`** — logo navbar trỏ vào đó.
- Máy chủ KHÔNG coi link trỏ vào khối đang tắt là lỗi: `renderedAnchors` tính neo từ mã
  nguồn, không theo trạng thái. Nhờ vậy tắt một khối không khoá lượt lưu menu / footer.
- Đã thử trên bản sao: tắt Dự án → menu FabLab mất `#projects`, footer mất link, nhịp phía
  sau đảo; tắt thêm Khóa học → nhánh StemLab biến mất (cả drawer 390px), nút chính của Hero
  ẩn; tắt thêm Hero → trang bắt đầu từ Số liệu, navbar vẫn dính; 320/390/1280 không tràn
  ngang, không lỗi console. Menu FabLab mở khi RÊ CHUỘT — bài thử bấm vào nó là đóng lại.

## Nút, popup, form do admin tạo (từ 2026-11-09, API 23)

Người dùng muốn nút và form "linh hoạt, CRUD được": admin tạo nút rồi chọn chức năng (mở form,
mở popup, mở link). Đã chốt: **chỉ nút kêu gọi chính** (Hero, thanh menu + drawer, cuối trang;
nút chính của popup sự kiện mùa thêm hai lựa chọn form / popup) — nút trong thẻ khóa học / sự
kiện giữ nguyên vì chúng đã tự gắn đúng khóa / sự kiện. Có **trình tạo form** (section `forms`)
và **popup tự tạo** (section `popups`) — popup chỉ mở khi bấm nút, không tự hiện.

| Mảnh | File |
|---|---|
| Hình dạng nút · popup · form | `buttonSchema` / `popupsSchema` / `formsSchema` ở [sections.js](server/schema/sections.js) |
| Duyệt mọi nút (luật, id thống kê, nhãn) | [server/content/buttons.js](server/content/buttons.js) |
| Đường lui nút cũ, variant, nút còn vẽ được không | [src/lib/actions.js](src/lib/actions.js) |
| Vẽ một nút | [ActionButton.jsx](src/components/ui/ActionButton.jsx) |
| Trạng thái popup / form + `runAction` | [ActionProvider.jsx](src/components/actions/ActionProvider.jsx) |
| Popup · form | [CustomPopup.jsx](src/components/CustomPopup.jsx) · [FormDialog.jsx](src/components/forms/FormDialog.jsx) + [CustomForm.jsx](src/components/forms/CustomForm.jsx) |
| Kiểm bài gửi (CHÉP hai nơi) | [validateForm.js](src/components/forms/validateForm.js) · [formSubmission.js](server/schema/formSubmission.js) |
| Route | `POST /api/forms/:id` ở [public.write.js](server/routes/public.write.js) · [forms.admin.js](server/routes/forms.admin.js) |
| Dashboard | `buttonFields()` ở [descriptors.js](src/admin/sections/descriptors.js) · [FormSubmissionsPage.jsx](src/admin/pages/FormSubmissionsPage.jsx) |

- **`style` của nút là NGỮ NGHĨA (`primary` / `secondary`), không phải tên class** — `variantFor`
  đổi theo nền (`surface="dark"` ở FinalCTA → `inverted` / `invertedOutline`). Tên class trong dữ
  liệu thì Tailwind không sinh CSS (xem "Component phải chịu được dữ liệu lạ").
- **Tên trường né khoá có sẵn**: `popup` đã là cờ của seasonal, `type` là chữ DỊCH của bảng thiết bị
  → nút dùng `formId` / `popupId` / `courseId`, ô form dùng `fieldType`. Cả bảy khoá hành động nằm
  trong `SHARED_FIELDS` VÀ `SKIP_KEYS` (typography.js) — thiếu ở `SKIP_KEYS` là id dính U+00A0.
- **Khoá cũ `primaryCta` / `secondaryCta` / `nav.cta` vẫn ở schema (tuỳ chọn)**: khôi phục bản lịch
  sử cũ ghi lại không qua schema. Vắng `buttons` → `buttonsOf()` dựng nút từ khoá cũ với ĐÚNG hành
  động cũ (như migration 025). `buttons: []` là admin xoá hết — giữ trống, không rơi về khoá cũ.
- **Ô hiện theo điều kiện `when: { trường: [giá trị…] }`** ([model.js](src/admin/editor/model.js) `isActive`):
  MỌI điều kiện phải đúng, và chuỗi phụ thuộc phải nêu đủ (khóa chọn sẵn là `{ action: ['register'],
  registerKind: ['course'] }` — chỉ nêu `registerKind` thì đổi sang link vẫn giữ khóa). Ô ẩn bị BỎ
  KHOÁ ở `fromWorking`, nên không sót `formId` cũ. `fillSubIds` giờ đệ quy (lựa chọn lồng trong ô).
  Danh sách con có `maxItems` (nút của popup ≤ 2).
- **Thứ tự dialog trong App**: `SeasonalPopup › CustomPopup › FormDialog › RegisterDialog` — dialog có
  nút mở dialog khác đứng TRƯỚC (cùng lý do "Hai dialog chuyển giao…" ở dưới). Nút trong popup gọi
  `onBefore` (đóng popup) rồi `runAction` trong CÙNG handler; popup → popup khác chỉ đổi nội dung.
- **Id thống kê `${slot}-${id}`** (`hero`, `final`, `nav`, `nav-drawer`, `popup-<id popup>`). Nút seed
  giữ id `primary` / `secondary` nên `hero-primary`… trùng id cũ, số liệu nối tiếp. Máy chủ nhận
  `cta_click` theo `CTA_IDS` cũ HOẶC nút đang có trong nội dung (đệm theo `rev`); trang Thống kê lấy
  nhãn từ `meta.ctaLabels`. Thêm chỗ đặt nút: thêm vào `SLOTS` ở buttons.js, dùng đúng tên slot ở component.
- **Form tự tạo luôn có ô năm sinh + ô đồng ý** (không nằm trong `fields`). `allowMinors` tắt → dưới
  16 bị chặn (mã `age`, chữ lỗi là `forms.adultOnly`); bật → dưới 16 phải có tên phụ huynh. Chữ
  chung (nút đang gửi, lỗi chung, "bắt buộc") mượn `register`.
- **Bài gửi lưu nhãn + chữ đọc được bản VI chụp lúc gửi** (`answers_json`: `{ id, label, type, value,
  text }`) — lựa chọn lưu bằng id, admin đổi nhãn / xoá ô về sau thì bài cũ vẫn đọc được. CSV theo
  một form mở mỗi ô thành một cột. Bảng `form_submission` KHÔNG có CHECK trên `source` (Zod kiểm,
  `FORM_SOURCES`) — thêm chỗ đặt nút không phải dựng lại bảng; bảng `registration` thì vẫn phải (025
  đã thêm `hero`, `popup`). Hai route ghi công khai DÙNG CHUNG bộ giới hạn IP và trần mỗi ngày.
- Migration 025 (sinh bằng máy): `buttons` dựng từ CHỮ đang có trong database (`json_extract`), bỏ
  khoá cũ, chốt `buttons IS NULL`; chèn `popups` / `forms` (mục mẫu, form mẫu đang đóng); dựng lại
  `registration`; tạo `form_submission`. Đã thử trên bản sao database thật: `rev` hero / finalCta /
  nav +2, 2 dòng đăng ký khớp mã băm, seed mới + `verify:seed` → `identical`.
- **Đừng chạy `npm run build` trong repo để thử** khi database thật chưa áp migration mới: `prebuild`
  mở `data/fablab.db` qua `getDb()` và áp migration ngay. Thử thì `vite build --outDir <scratch>`.
- Đã thử bằng puppeteer trên bản sao (3999 / 4320): nút mặc định đúng hành động cũ; Hero → popup →
  nút "Gửi góp ý" → form (popup đóng, form mở); gửi trống → tóm tắt lỗi; 2015 ở form không nhận
  trẻ em → lỗi tuổi; form nhận trẻ em → ô phụ huynh, lưu kèm `parent_name`; nút register chọn sẵn
  khóa; link https mở tab mới; đóng form → nút trong popup ẩn + POST 422; xoá form đang được trỏ /
  nút trỏ form lạ / VI-EN lệch hành động → 422; 320/390 không tràn; không lỗi console.

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
| Dự án | 2 (FabLab) | `#projects` | `<Section id="projects">` |
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
của `nav.links` SAU KHI đã lọc link chết (`liveNavLinks` — khối đang tắt); đây là lần thứ hai chỗ này gây lỗi (lần trước là hardcode
`'process'` sau khi xoá section).

Mở/đóng theo mẫu **Disclosure Navigation** của WAI-ARIA: nút bật/tắt panel, Tab đi
xuyên qua bình thường, không cần roving tabindex. Panel đệm bằng khoảng độn TRÊN
panel chứ không bằng lề — có lề là có khe chết, chuột đi từ nút xuống panel sẽ làm
menu đóng giữa chừng. Drawer mobile dùng chung state `openBranch` với thanh
desktop (hai thứ không bao giờ cùng hiện) nhưng render dạng accordion.

### Drawer mobile là `<dialog>` ở top layer (từ 2026-10-28)

Bản trước là một div `fixed inset-0` nằm TRONG `<header>`, khoá cuộn bằng
`body.style.overflow`. Ba lỗi, đều đã đo bằng puppeteer ở 390px:

- **Mở sau khi cuộn thì drawer chỉ cao 76px** (màn 844px). Khi đã cuộn, header có
  `backdrop-blur`, mà `backdrop-filter` (cũng như `transform`, `filter`) biến phần tử thành
  khung chứa của con `position: fixed` — `inset-0` tính theo header chứ không theo màn
  hình. `<dialog>` + `showModal()` nằm ở top layer nên thoát khỏi mọi khung chứa của tổ
  tiên. **Đừng đưa drawer về lại dạng div `fixed` trong header.**
- Tab thoát khỏi drawer xuống nội dung bị che phía sau. Dialog modal lo bẫy focus. (Sau
  phần tử cuối, Chrome cho Tab ghé `BODY` / thanh trình duyệt một nhịp rồi quay về đầu
  dialog — đó là hành vi gốc, ba popup kia cũng vậy, không phải focus lọt ra trang.)
- Khoá cuộn trên `<body>` trái luật ở trên; giờ dùng `useScrollLock` có bộ đếm.

`drawerOpen = menuOpen && !isDesktop` (`useMediaQuery` 1024px): dialog modal mà bị ẩn bởi
breakpoint thì cả trang thành `inert`, nên nới cửa sổ qua `lg` là phải đóng. Sự kiện
`close` của dialog gọi `closeDrawer`, nên `Esc` và lần đóng do breakpoint đều đi một đường.

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

Cả Team lẫn Partners đều bọc track bằng `marquee-viewport` (Partners được thêm ngày
2026-10-28 — trước đó nó còn `overflow-hidden` và mất logo khi giảm chuyển động). Thêm
dải chạy thứ ba thì dùng đúng utility đó, đừng tự đặt `overflow-hidden`.

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

Tỷ lệ ảnh hoạt động rất lệch nhau (poster dọc 0.7 đến ảnh ngang 2.05) nên banner
dùng `object-contain` cho poster (xem "Hai kiểu banner tự chạy"). **Đừng đổi sang `object-cover`** — nó sẽ
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

**Ảnh khóa học (37) lấy từ bộ slide chính thức "Giới thiệu STEMLab"** (từ 2026-11-05, người
dùng yêu cầu; một ảnh tiêu biểu mỗi khóa): `src/assets/images/stemlab-<id>.jpg`, 760×320.
Quy trình đã dùng, lặp lại được (script ở scratchpad, ngoài git):

1. Đọc presentation qua connector Google Slides lấy `image.contentUrl` của từng phần tử ảnh
   rồi **tải ngay** — link hết hạn sau ~30 phút. Ảnh ghép 3 tấm (slide 6, 7, 13, 8) có khe
   TRONG SUỐT ở `x = 599–612` và `1213–1226`: tách tấm bằng `extract`, đừng cắt giữa.
2. Dựng bảng ảnh theo slide, chọn bằng mắt (ưu tiên ảnh chụp thật buổi học).
3. Cắt bằng sharp: `cover` + `attention` mặc định; ảnh `attention` chọn sai (cắt đầu người,
   bỏ chủ thể) thì đặt tay `top`; ảnh sản phẩm / bản vẽ dùng `contain` trên nền trắng (hoặc
   màu góc ảnh). Lượt đầu 9/37 ảnh phải cắt lại — **luôn xem bảng ảnh đã cắt**.
4. File import thẳng ở thư mục gốc `images/`: hook nạp ảnh của Node
   ([import-hook.mjs](server/scripts/import-hook.mjs)) chỉ trả `basename`, nên thư mục con
   làm seed tìm sai file.

Database đang chạy nhận ảnh qua **`npm run images:replace -- <scope>`**
([replace-images.js](server/scripts/replace-images.js)) — khác `seed:images` (chỉ điền scope
CHƯA có ảnh): thay ảnh của scope ĐÃ có ảnh, đi `writeSectionPair` nên có lịch sử (khôi phục
được ảnh cũ), `rev` +2, chữ gửi lại qua schema (thứ tự khoá đổi, nội dung không — đã so sau
khi sắp khoá). Bỏ qua mục đã gắn đúng ảnh theo sha256 → chạy lại không làm gì. Chạy được khi
máy chủ đang bật (đệm nội dung khoá theo `rev` đọc từ database).

[index.js](src/assets/images/index.js) ánh xạ `id` khóa học / thiết bị sang ảnh.
**Thêm khóa học mới mà quên thêm ảnh thì `src` thành `undefined` và card hiện ảnh
vỡ** — không có ảnh mặc định, cũng không có cảnh báo lúc build. README liệt kê
sáu ảnh chỉ khớp gần đúng (đánh dấu `// ~` trong index.js).

Muốn đổi ảnh: bỏ file mới vào thư mục, sửa import trong `index.js`. Vite gắn hash
nội dung nên cache tự hết hiệu lực. Kích thước dịch nằm trong bảng ở README —
giữ đúng tỷ lệ kẻo `object-cover` cắt mất chủ thể.

Ảnh hero là ảnh trên màn hình đầu: để `fetchPriority="high"`, **không** lazy-load.
Mọi ảnh khác lazy-load. Ảnh nào cũng phải có `width`/`height` thật.

## Section Về chúng tôi (từ 2026-10-27)

[Pillars.jsx](src/components/Pillars.jsx). h2 là "Về EIU FabLab" (tên mục trên trang gốc);
bên dưới là **ba khối NGANG CẤP** Sứ mệnh / Tầm nhìn / Giá trị cốt lõi, mỗi khối một h3 dùng
chung hằng `BLOCK_TITLE`. Trước đó Sứ mệnh là h2 cỡ display còn hai khối kia là nhãn caption —
người dùng chỉ ra là lệch cấp. Tên trụ cột và tên giá trị là h4.

- **Tầm nhìn**: thẻ `wash`, câu cỡ `subheading` chữ thường (bản cũ cỡ tiêu đề + dấu ngoặc
  kép lớn bị chê "to và thô"), dưới là `visionHighlights` — tách từ chính câu tầm nhìn,
  không thêm ý. Khoá này ở **cấp trên cùng**, không nằm trong `vision`: bản lịch sử cũ
  (`vision` chỉ có title/body, schema strict) vẫn hợp lệ.
- **Giá trị cốt lõi**: accordion WAI-ARIA, mở một mục mỗi lần, mục đầu mở sẵn. Mô tả rút gọn
  từ khối "GIÁ TRỊ CỐT LÕI" trên `fablab.eiu.edu.vn/vi/` và "Core Values" trên `/en/` (đọc
  nguyên văn bằng curl — công cụ đọc web chỉ trả bản diễn giải). `description` bắt buộc khi
  ghi; mục thiếu (bản lịch sử cũ) thì component vẽ dòng chữ thường, không bấm được.
- Transition mở/đóng (`grid-template-rows`) đặt trên div BÊN TRONG `<li>`, không trên `<li>`:
  `<li>` là con của RevealGroup, transition shorthand của reveal sẽ đè (bẫy 2).
- Vào database cũ qua migration 013: mỗi ngôn ngữ một câu UPDATE (`rev` +2), chốt bằng
  `missionTitle IS NULL`, `title` chỉ đổi khi còn nguyên văn cũ, `values` dựng lại giữ thứ tự
  và chỉ gắn mô tả cho id đã biết. Đã thử: admin sửa tiêu đề / tự thêm giá trị → giữ nguyên.
- `check:admin` bỏ cả `video` (không chỉ `image`) khi so form: cả hai đến từ bảng binding.
  Lỗi này chỉ lộ ra khi database có video thật đầu tiên.

## Sự kiện mùa: popup, màu, họa tiết (từ 2026-10-28, API 13 → 17)

Tết, Trung Thu, Noel…: admin tạo sự kiện ở section `seasonal` (dashboard "Sự kiện mùa");
trong khoảng ngày đó trang hiện popup quảng cáo và đổi màu. Đã chốt với người dùng: thiết
kế do admin thêm = **bảng màu + ảnh tải lên** (ảnh popup, ảnh trang trí góc Hero); popup
**một lần mỗi sự kiện**. Lượt hai (API 14) người dùng muốn "thêm đồ họa, không chỉ đổi màu":
**họa tiết vẽ sẵn bằng mã** (admin chọn, không tải ảnh) vừa **đậu trên nút chính** vừa **rơi
thưa trên cả trang** có nút tắt. Nút vẫn pill, không shadow, không đổi bo góc.

| Mảnh | File |
|---|---|
| Chọn sự kiện (`pickSeason`, `?season=`, ngày VN) | [src/lib/season.js](src/lib/season.js) |
| Ghi biến màu lên `<html>` | [SeasonTheme.jsx](src/components/SeasonTheme.jsx) |
| Popup | [SeasonalPopup.jsx](src/components/SeasonalPopup.jsx) |
| Ảnh trang trí | [Hero.jsx](src/components/Hero.jsx) |
| Hình họa tiết (dữ liệu path) · vẽ SVG | [src/lib/motifs.js](src/lib/motifs.js) · [MotifArt.jsx](src/lib/MotifArt.jsx) |
| Hạt rơi + nút tắt (canvas, `lazy`) | [SeasonFall.jsx](src/components/SeasonFall.jsx) |
| Bộ máy hạt rơi (dùng chung với dashboard) | [src/lib/fallEngine.js](src/lib/fallEngine.js) |
| Thư viện họa tiết tự tạo · xem trước sống | section `motifs` · [MotifPreview.jsx](src/admin/editor/MotifPreview.jsx) |
| Bản chép id họa tiết phía máy chủ | [server/content/motifs.js](server/content/motifs.js) |
| Tương phản WCAG (CHÉP hai nơi) | [src/lib/color.js](src/lib/color.js) · [server/content/color.js](server/content/color.js) |
| Schema · luật | `seasonalSchema` · mục 3d trong [invariants.js](server/content/invariants.js) |

- **Chọn ở trình duyệt, không ở máy chủ**: mục ĐẦU TIÊN có `enabled` và `start ≤ hôm nay ≤ end`
  (giờ VN, cùng cách tính `dayKey`) — hoặc có `now` ("Hiện ngay, không chờ ngày bắt đầu",
  API 15) thì chỉ cần chưa qua `end`. `now` có vì người dùng bật Tết 2027 rồi thấy trang chính
  không đổi (đúng lịch: chưa tới ngày) trong khi `?season=` thì đổi — tưởng là hỏng. Cột trạng
  thái của dashboard dùng CÙNG luật (`seasonStatus`): "Đang hiện trên trang" / "Tự hiện từ …"
  — sửa luật ở `pickSeason` thì sửa luôn ở đó. Trang vẽ bằng snapshot nên phải đổi đúng ngày cả khi API
  chết. Hệ quả: sự kiện bật SAU lần build gần nhất thì lúc tải trang vẽ màu mặc định trước
  rồi mới đổi khi `/api/content` về — chạy `npm run build` sau khi bật để snapshot mang sẵn.
  `?season=<id>` ép một mục bất kể ngày / công tắc (nút "Xem thử trên trang" của dashboard).
- **Màu đi qua biến CSS, không qua class.** CSS đã build dùng `var(--color-signal)` cho mọi
  utility, nên `SeasonTheme` chỉ `setProperty` lên `<html>` (useLayoutEffect — trước lần vẽ,
  không nháy). `colorPrimary`→`--color-signal`, `colorSurface`→`--color-wash`,
  `colorDark`→`--color-navy`, `colorAccent`→`--color-ember`.
- **Chữ trên nền signal dùng token `on-signal`, KHÔNG dùng chữ trắng cố định.** Màu chủ đạo
  sáng (vàng Tết) thì chữ trắng không đọc được; `readableOn()` chọn trắng hoặc màu mực và
  ghi `--color-on-signal`. Đã đổi ở Button (`filled`), Pill (`signal`), Navbar, Pillars,
  RegisterForm, Courses. **Thêm phần tử nền signal có chữ thì dùng token đó.** Hover/active
  của nút là `--color-signal-hover` / `--color-signal-active` (`color-mix` từ signal trong
  `@theme`) — đừng viết lại mã hex vào Button.
- **Khe media thứ ba `decors`** (scope `seasonal-decor`, trường `decor`). Các khe giờ khai ở MỘT
  bảng `MEDIA_SLOTS` trong [assemble.js](server/content/assemble.js); `SECTION_IMAGES` /
  `SECTION_VIDEOS` / `SECTION_DECORS` suy từ đó, `sectionSlots()` cho đường ghi. Thêm khe thứ
  tư: thêm vào bảng, rồi nối ở route PUT, SectionPage / ItemList / ItemModal, `publish.js`,
  `BINDING_KEYS` của check-admin.
- **Popup "một lần"**: `localStorage['fablab-season-seen'] = { id: phiênBản }`, phiên bản = băm
  chữ HAI ngôn ngữ + url ảnh → admin sửa popup là hiện lại một lần, đổi ngôn ngữ thì không.
  Đánh dấu ngay lúc HIỆN. Mở sau 1,2 giây, chờ nếu tab ẩn hoặc đang có dialog khác. Mount
  TRƯỚC `<RegisterDialog />` (nút đăng ký đóng popup rồi mở form, cùng lý do popup khóa học).
  Thử bằng puppeteer: đè `Date` qua `evaluateOnNewDocument`, dùng `userDataDir` để giữ
  localStorage giữa các lần chạy. Đã thử: hiện → tải lại không hiện → sửa tiêu đề → hiện lại
  một lần → tải lại không hiện.
- Nguồn đăng ký `seasonal-popup` cần **migration 017 dựng lại bảng `registration`** (CHECK trên
  `source`, cùng cách 014). Thêm nguồn nữa là lại phải dựng lại. Đã thử trên bản sao: số dòng
  và mã băm nội dung trước/sau khớp.
- Migration 016 chèn section với ba mục MẪU đang tắt (Tết 2027, Trung Thu 2027, Noel 2026);
  bảng màu mẫu đã kiểm ≥ 4.5:1. Cảnh báo "popup chưa có ảnh" chỉ cho mục ĐANG BẬT — mục mẫu
  chưa có ảnh là bình thường, báo mãi thành nhiễu.
- **Họa tiết: MỘT nguồn hình cho ba nơi.** `motif` (`snow | mai | dao | lantern | confetti |
  halloween`, vắng = không; `halloween` = dơi + bí ngô, thêm ở API 16) + `fall` (true/vắng — tách riêng để chỉ trang trí nút). Mỗi hình là path SVG
  trong hộp 24×24 ở motifs.js; nút và dashboard vẽ bằng SVG (MotifArt.jsx), canvas vẽ lại
  CÙNG path bằng `Path2D`. Id bộ (`MOTIFS`) và id hình (`GLYPHS`) chép ở
  [server/content/motifs.js](server/content/motifs.js) — `check:content` so hai bản, lệch là
  HỎNG — và nhãn ở ô chọn trong descriptors.js. Tách motifs.js / MotifArt.jsx vì oxlint
  (`only-export-components`) không cho trộn hằng với component.
- **Thư viện họa tiết tự tạo (API 17)**: section `motifs` (dashboard "Họa tiết"). Người dùng
  muốn tự tạo mà vẫn giữ 6 bộ có sẵn; đã chốt: hình mới = **ảnh PNG tải lên**, lưu ở **thư
  viện riêng** dùng lại cho nhiều sự kiện, **trộn được** ảnh với hình có sẵn.
  - `shapes[]` = ảnh (scope binding `motif-shape`); `items[]` = họa tiết: 1–6 `particles`
    (`shape` = id hình có sẵn hoặc `img:<id ảnh>`, `weight` tương đối, `sizeMin/Max`,
    `flap`), `direction`, `motion` (`spin | tilt | flip | drift`), `speedMin/Max`, `sway`,
    `density` (%), `ornamentShape` / `ornamentCorner` / `ornamentSize`. Mọi trường trừ `name`
    là dùng chung. Tên `particles` chứ KHÔNG phải `kinds` — `kinds` đã là trường dùng chung
    nghĩa khác (`activities.groups[].kinds`).
  - `seasonal.items[].motif` giờ là `idSchema`: bộ có sẵn HOẶC id trong `motifs.items`. Luật
    tồn tại ở invariants (mục 3e, như luật `facility`) → xoá họa tiết đang dùng bị chặn; id
    tự tạo trùng id bộ có sẵn là lỗi; ảnh `img:` chưa gắn file chỉ là cảnh báo.
  - **Mọi nơi vẽ đi qua `resolveMotif(id, t.motifs, accent)`** (motifs.js) → `{ particles,
    ornament }` cùng một dạng cho bộ có sẵn lẫn tự tạo; nút dùng `useSeasonMotif()`
    (season.js). Bộ có sẵn trả nguyên `PARTICLES` / `ornamentPieces` nên hình không đổi.
  - Bộ máy canvas tách ra [fallEngine.js](src/lib/fallEngine.js): SeasonFall đo cửa sổ, khung
    xem trước của dashboard đo ô 224px (`ResizeObserver`). Ảnh nạp bằng `Image` rồi vẽ
    "contain" vào sprite vuông; ảnh lỗi thì bỏ loại hạt đó. Ảnh trên nút là `<img>` đặt
    bằng `style`.
  - "Chỉnh bộ có sẵn" = tạo họa tiết "Bắt đầu từ: Tuyết…" (`presets` của list, suy từ
    `PARTICLES`) rồi sửa bản sao — bộ gốc trong mã không đổi.
  - Bộ soạn có thêm: `createDefaults` (mục mới có thông số hợp lệ), sublist `rowDefaults` /
    `idFrom` (dòng không có nhãn dịch lấy id từ trường chung), `Select` gom `optgroup` theo
    `group`. Ô chọn hình đọc `ctx.vi.shapes` (thấy cả ảnh chưa lưu); ô chọn họa tiết của sự
    kiện đọc `/meta` → `motifs` (dashboard nạp lại meta sau mỗi lượt Lưu).
  - Migration 020 chèn section (chốt theo từng ngôn ngữ như 004), mẫu `tuyet-day` không gắn
    vào sự kiện nào. Đã thử trên bản sao database thật: `rev` +2, chạy lại không chèn trùng.
- **Vật trang trí trên nút**: chỉ biến thể `filled` / `inverted` và KHÔNG ở cỡ `sm` (chip lọc
  khóa học dùng `filled` cỡ `sm` — đeo vào thì cả hàng rối). Button thêm `relative
  group/btn` (nhóm CÓ TÊN, kẻo dính hover của thẻ cha). Vị trí đặt bằng `style` để dashboard
  dùng được (admin.css không quét src/components/). Nhô ra ngoài nút tối đa ~15px.
  Hai bẫy đã gặp: (1) SVG là phần tử thay thế — đặt cả `left` lẫn `right` thì nó vẫn giữ bề
  rộng tự nhiên theo viewBox, lớp tuyết chỉ phủ nửa nút; phải ghi `width` rõ. (2) Tuyết
  TRẮNG TINH trên nền trắng của trang là vô hình — tuyết dùng xanh xám nhạt có viền.
  Rung khi rê chuột: utility `animate-ornament-sway`, media giảm chuyển động đặt BÊN TRONG
  utility để đi theo biến thể hover (lặp vô hạn → tắt bằng `animation-name`, bẫy marquee).
- **Hạt rơi**: `lazy()` trong App.jsx, chỉ nạp khi sự kiện có `motif` + `fall` (ngày thường
  không tải gói ~3,8 KB). Một canvas `fixed z-40 pointer-events-none` (dưới navbar z-50,
  dialog ở top layer nên luôn trên), 10–34 hạt theo diện tích, sprite vẽ sẵn một lần.
  Dừng khi tab ẩn; KHÔNG chạy khi giảm chuyển động (đọc sống qua `useMediaQuery`) hay
  `saveData` — lúc đó nút tắt cũng ẩn. Nút tắt góc dưới-trái, đứng SAU Footer trong cây để là
  điểm dừng Tab cuối; lựa chọn ở `localStorage['fablab-season-fall']`. Đã đo: 60 khung/giây,
  bấm xuyên canvas vẫn trúng nút, không tràn ngang ở 390/1280px.
- Dơi Halloween vỗ cánh bằng cờ `flap` trên LOẠI hạt (không phải cả bộ): co giãn chiều dọc,
  không bao giờ dẹt hẳn. Dơi tím than có viền tím sáng — đen tuyền thì chìm hẳn trên khối
  tím đêm của FinalCTA.
- Migration 019 thêm mục mẫu `halloween-2026` (25/10 → 01/11/2026, ĐANG TẮT) vào CUỐI danh sách
  bằng `json_insert('$.items[#]')`, chốt theo từng ngôn ngữ bằng id. Bảng màu cam #c2410c /
  nền #fff7ed / tím đêm #3b0764 đã đo ≥ 4.5:1.
- Migration 018 thêm nhãn `effectOff`/`effectOn` và gắn họa tiết cho ba mục mẫu (chỉ khi còn
  đúng id và chưa có `motif`). **Không sửa 016** — database thật đã chạy nó.
- Bài thử puppeteer đổi nội dung bằng cách chặn `/api/content` thì phải TĂNG `rev` trong
  phản hồi: contentStore bỏ qua bản cùng `rev` với snapshot, trang giữ nội dung cũ.
- Dashboard: ô `date` và `color` mới trong FieldControl; `color` để trống = bỏ khoá (giống
  `select` tuỳ chọn). [SeasonPreview.jsx](src/admin/editor/SeasonPreview.jsx) vẽ mẫu màu bằng
  `style` (màu là dữ liệu) và cảnh báo tương phản đúng các cặp máy chủ cảnh báo.

## Section Dự án

[Projects.jsx](src/components/Projects.jsx), ngay sau Thiết bị. 8 dự án lấy từ
`fablab.eiu.edu.vn/vi/du-an/` và `/en/projects/`; ảnh gán bằng cách mở từng ảnh ra xem
(bản VI và EN dùng hai file khác nhau cho cùng một ảnh ở ba mục — lấy bản lớn hơn).

- **`status` cố ý VẮNG trên mọi dự án.** Trang gốc không ghi dự án nào đang làm hay đã
  xong; người dùng chọn "có trường, để trống" thay vì để agent đoán. Vắng = không nhãn.
  Có thì phải là khoá của `projects.statuses` (invariants), và là trường dùng chung.
- **Ô chọn tuỳ chọn trong dashboard:** `fromWorking` ([model.js](src/admin/editor/model.js))
  bỏ hẳn khoá khi ô `optional` để trống — gửi `""` là 422. ItemModal cũng không tự chọn
  sẵn lựa chọn đầu cho ô `optional` (tự chọn là tự gắn nhãn thay người dùng).
- **Migration 008 chèn "Dự án" vào menu và footer bằng SQL JSON**, không ghi đè cả
  section: dựng lại mảng con bằng `json_group_array(json(v) ORDER BY o)` (SQLite ≥ 3.44,
  bản đóng gói là 3.49), mục cũ ở vị trí `2k`, mục mới ở `2k+1` ngay sau `facilities`.
  Admin đã đổi cấu trúc (không còn nhánh `fablab` / cột `explore`) thì câu đó bỏ qua.
  Kiểm bằng `rev`: section +2, nav +2, footer +2.

**Nội dung database thật đã khác corpus seed** (đo 2026-11-10): admin còn 3 dự án (Xe đua MCR,
Robot giao hàng, STEM Platform), ảnh là ẢNH CHỤP ngang (tới 1600px, không còn ảnh tách nền),
mô tả tới 273 ký tự, có `status` (kể cả khoá tự thêm `comingsoon`). Thiết kế phải chịu được
cả hai: 3 hay 8 dự án, ảnh dọc 0.4 hay ngang 2:1, mô tả 85 hay 300 ký tự.

### Sân khấu trưng bày (từ 2026-11-10, thay vòng xoay 3D)

Người dùng báo vòng 3D "hơi nhỏ", mô tả bị cắt (`line-clamp-3` trên thẻ 280px), và "vuốt
trên di động không chạy". Đo bằng `page.touchscreen` trên bản cũ: trong giả lập, hàng cuộn
`snap-x` (< 768px) VẪN cuộn và vòng (≥ 768px chạm) VẪN xoay — không tái hiện được lỗi vuốt;
cái đo ra được là với **3 dự án, bán kính vòng chỉ ~90px nên ba thẻ chồng lên nhau**, và hàng
cuộn không có dấu hiệu nào (chấm, số đếm) cho thấy vuốt được. Người dùng chọn "sân khấu
trưng bày" trong bốn phương án (coverflow, bento + popup, cuộn kể chuyện). Vòng 3D cũ còn
trong lịch sử git (trước commit này) nếu muốn quay lại.

[Projects.jsx](src/components/Projects.jsx): một dự án mỗi lúc trên một thẻ lớn — khung hình
(nền `wash` + vệt sáng + số thứ tự khổng lồ `ink/5` + ảnh `object-contain` có `drop-shadow`)
và cột chữ (đếm `03 / 03`, nhãn trạng thái, tên, mô tả ĐẦY ĐỦ, ← → + vạch tiến độ). Từ `lg`
hai cột `[1.15fr_1fr]`, dưới đó xếp dọc. Dải ảnh nhỏ bên dưới để chọn thẳng.

- **Bộ não là `useSlideshow`** (chung với section Hoạt động): phím ← →, vuốt / kéo ngưỡng 40px
  không pointer capture, nuốt click sau khi kéo. Vùng nhận cử chỉ mang `touch-pan-y`: trình
  duyệt giữ cuộn dọc (đã đo: kéo dọc trên sân khấu vẫn cuộn trang), cử chỉ ngang về tay mình.
- **Không tự chạy**: không vẽ vạch tiến trình nên hook không bao giờ tự chuyển → không cần nút
  dừng (WCAG 2.2.2), không thêm nhãn mới vào database.
- **Các slide chồng cùng một ô grid** (như carousel Sự kiện): thẻ cao theo slide cao nhất, mô tả
  dài không bị cắt, đổi dự án không nhảy chiều cao. Slide không chọn: `inert` + `aria-hidden` +
  `opacity-0`. Hàng ← → đặt TUYỆT ĐỐI ở đáy thẻ, ngoài các slide (không mờ theo) — vì vậy cột chữ
  chừa `pb-24` / `lg:pb-28`; đổi chiều cao hàng nút là đổi cả hai số đó.
- **Chuyển cảnh** bằng transition trên phần tử luôn mount (không dính bẫy 4): ảnh trượt + lớn
  dần, số thứ tự trượt ngược (thị sai), chữ hiện dần có trễ. Utility nêu rõ
  `transition-[opacity,translate,scale]` (bẫy 2). Giảm chuyển động: `motion-reduce:transition-none`.
- **Nghiêng theo chuột** (≤ 6°): chỉ `pointerType === 'mouse'`, không khi giảm chuyển động. Ghi
  biến CSS `--tilt-x/y` thẳng lên khung hình (không state, không re-render); ảnh dùng `transform:
  perspective() rotateX/Y(var)` — độc lập với `translate`/`scale` của chuyển cảnh ở lớp bọc.
- **Ảnh không phóng quá cỡ thật**: `max-h` + `w-auto` + `max-w-full` (ảnh nhỏ nhất ~230px).
- **Dải ảnh nhỏ cuộn bằng `scrollTo` của CHÍNH dải** để đưa nút đang chọn vào giữa —
  `scrollIntoView` kéo cả trang về section mỗi lần đổi dự án.
- Bọc sân khấu trong `Reveal` (không RevealGroup — rule `> *` sẽ ghi `transform` lên slide).
- Nhãn `previous`/`next`/`goTo` từ migration 009; thiếu thì rơi về `projects.title`.
- Đã thử bằng puppeteer: vuốt chạm ở 390 / 820 / 1024px đổi 1 → 2 → 1; mô tả không bị cắt và hàng
  nút không đè chữ ở 320 / 390 / 768 / 1280px; không tràn ngang; dải ảnh nhỏ, phím ← →, giảm
  chuyển động đúng; không lỗi console. Nút tròn bông tuyết đè góc dưới-trái trong ảnh chụp
  điện thoại là nút tắt hạt rơi của sự kiện mùa (cố định), không thuộc section này.

## Popup thông số thiết bị

Bốn ô của section Thiết bị giữ nguyên; trong mỗi ô có một hàng nút tên máy, bấm vào
mở [EquipmentModal.jsx](src/components/EquipmentModal.jsx). Dữ liệu là **section riêng
`equipment`** chứ không nằm trong `facilities`: ảnh đi qua bảng `binding`, mà
`SECTION_IMAGES` chỉ cho **một scope ảnh trên một section**. Tách ra thì đường ghi, lịch
sử, ảnh và dashboard dùng lại nguyên si.

- `equipment.items[].facility` trỏ về `facilities.items[].id` — **trường dùng chung**, và
  là luật cắt ngang section trong invariants: id lạ là lỗi (máy biến mất khỏi trang), nên
  xoá một ô còn máy trỏ tới bị chặn. Dashboard lấy danh sách ô qua `/meta` (`ctx` của một
  section không thấy section khác).
- Giá trị thông số tên là **`detail`, không phải `value`**: `value` nằm trong
  `SHARED_FIELDS` (số liệu StatsBar), đặt trùng tên là bị đòi bằng nhau giữa VI và EN.
  `check:content` đã bắt lỗi này ngay lần đầu.
- **Ba máy điện tử cố ý có `specs: []`** — trang gốc không công bố thông số; popup hiện
  `noSpecs`. Tên file ảnh có gợi ý thông số (200MHz, 30V 3A) — đừng điền từ đó.
- Nguồn là `fablab.eiu.edu.vn/vi/thiet-bi/` và `/en/devices/`. Hai lỗi đánh máy của bản
  VI đã sửa theo bản EN (Form 3: 145x145x185 **mm**; đầu in Cubicon 210F: 0.4 **mm**).
  Bản EN gọi DS460 là "wire saw" và GDS-2204A là "pulse meter" — ảnh cho thấy đó là máy
  cưa lọng và máy hiện sóng, đã ghi theo ảnh.
- Ảnh máy là **ảnh sản phẩm** đăng trên trang Thiết bị (nên mang `// ~`), đã gán bằng
  cách mở từng ảnh ra xem — 12/12 khớp chữ in trên máy.

**Database đã seed nhận section qua migration 006, còn ẢNH qua `npm run seed:images`**
(migration SQL không xử lý được file). Script chỉ điền scope **chưa có ảnh nào**, nên
chạy lại an toàn và không gắn lại ảnh admin đã gỡ. Danh sách scope ảnh nằm ở **một chỗ**:
[image-sources.js](server/scripts/image-sources.js), dùng chung cho `seed` và
`seed:images`.

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
| `stem` | Khóa học STEM (khóa học chuyên sâu) | 7 | không |
| `experience` | Chương trình trải nghiệm STEM | 30 | có |

**Hai nhóm cố ý mang hai bộ trường khác nhau**, và [CourseCard.jsx](src/components/CourseCard.jsx)
render theo trường nào CÓ MẶT chứ không nhận prop kiểu:

| | thẻ cấp độ | thẻ cấp học |
|---|---|---|
| Phân loại | `level` | `stage` + `topic` (+ `comingSoon`) |
| Chip trên ảnh | cấp độ | cấp học + "Sắp ra mắt" |
| Dòng chân card | `duration` · `age` | chip nhóm chủ đề |
| Icon | tra theo `id` | tra theo `icon` |

**Từ 2026-11-05 (API 21) CẢ HAI nhóm dùng thẻ cấp học.** Kiểu thẻ cấp độ vẫn còn trong
schema / dashboard nhưng không khóa nào dùng. Nhóm `stem` là **7 khóa học chuyên sâu** lấy
từ bộ slide chính thức "Giới thiệu STEMLab" (Google Slides `1_79GBiFFR9…`, slide 35–42, đọc
qua connector Google Slides): sáu khóa 8 buổi + "Thế giới điện tử" (COMING SOON, 3 module).
Bốn khóa cũ của website trước (Cánh tay Robot, Robot Hình người, Lập trình Scratch, Xe
Robot) đã bỏ. 30 chương trình `experience` (slide 5–34) đã khớp từ trước, không đổi.

- **Nhóm chủ đề của khóa chuyên sâu đọc theo MÀU tiêu đề slide** (xanh = Robot, đỏ = AIoT,
  theo slide 35) — chữ trên slide không ghi. "Thế giới điện tử" tô màu cam, không thuộc nhóm
  nào; đang để `robotics` (2/3 module là drone / robot). Đã báo người dùng.
- Cấp **`th-thcs`** ("Tiểu học – THCS", chip `TH/THCS`) cho bốn khóa ghi "TIỂU HỌC / THCS".
  Bộ lọc của nhóm trải nghiệm chỉ liệt kê cấp học **có trong chính nhóm đó**
  ([Courses.jsx](src/components/Courses.jsx)), kẻo hiện một chip 0 mục.
- **`comingSoon: true`** (trường dùng chung, thẻ cấp học) + nhãn `courses.comingSoon`:
  chip "Sắp ra mắt" góc trái ảnh thẻ và đầu popup. Vẫn nhận đăng ký (đăng ký trước / tư vấn).
- "Khám phá xe robot" và "Thiết kế website" trùng TÊN với hai chương trình trải nghiệm
  nhưng là khóa khác → id mang hậu tố (`xe-robot-chuyen-sau`, `website-chuyen-sau`).
- Popup: `audience` (cấp học trên slide) + `curriculum` (8 buổi nguyên văn) ở
  `intensiveDetails.*.js` — **viết tay**, nguồn `handwritten`. Slide không có giới thiệu /
  kiến thức / kỹ năng / thời lượng / độ tuổi — đừng điền thêm.
- Ảnh: migration 023 tạm gắn ảnh thật dùng lại (`↺ ~`); từ 2026-11-05 cả 37 khóa đã có ảnh
  riêng cắt từ slide (xem mục "Hình ảnh"). Chỉ ảnh minh họa của slide 4 / 35 (tổng quan nhóm
  chủ đề) ghi "được tạo bằng AI" — không dùng.
- Database đang chạy nhận nội dung qua **migration 023** (sinh bằng máy, chốt theo từng ngôn
  ngữ bằng id `the-gioi-robot`): giữ nguyên mọi mục không thuộc `stem`, nối 7 khóa mới, thêm
  cấp `th-thcs`, đổi mô tả nhóm CHỈ khi còn nguyên văn cũ, chèn 14 dòng `course_detail` và
  chép binding ảnh từ id nguồn. Đã thử trên bản sao: `rev` +2, 30 chương trình trải nghiệm
  khớp mã băm, bảng đăng ký không đổi, chạy lại không đổi gì.

30 chương trình `experience` lấy từ
**catalogue chính thức do FabLab cung cấp** — catalogue không có thời lượng, độ
tuổi hay mô tả ngắn, nên đừng đi tìm rồi điền vào.

### Bộ lọc đã QUAY LẠI — đừng bỏ đi lần nữa

Tài liệu cũ từng ghi "không còn nút lọc": bộ lọc bị bỏ hồi section chỉ có 16 khóa
chia hai nhóm, lúc đó hai nhóm là đủ. Với **30 chương trình trong một nhóm** thì lý
do đó không còn đúng, và bộ lọc được thêm lại theo yêu cầu của người dùng.

**Lưới 4 cột từ `xl`** (từ 2026-10-22, khi `container-page` nới từ 1200 lên 1440px), nên
số thẻ hiện sẵn là 8 ở `xl`, 6 dưới đó (`INITIAL_VISIBLE_XL` / `INITIAL_VISIBLE`) — luôn là
bội của số cột để hàng cuối không lẻ. Đổi số cột là đổi cả hai số này.

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

### Hai file nội dung popup, hai luật ngược nhau

`courses.details` trộn ba nguồn: `{ ...courseDetails*, ...experienceDetails*, ...intensiveDetails* }`.

| File | Cho | Sửa tay? |
|---|---|---|
| `courseDetails.*.js` | 4 khóa STEM cũ (đã bỏ khỏi trang) | **KHÔNG** — file sinh ra, sửa là mất |
| `intensiveDetails.*.js` | 7 khóa học chuyên sâu | **CÓ** — viết tay từ slide |
| `experienceDetails.*.js` | 30 chương trình trải nghiệm | **CÓ** — viết tay có chủ đích |

Nhầm file là mất công hoặc mất dữ liệu. Đầu mỗi file đều ghi rõ nó thuộc loại nào.

`cnc` là id duy nhất trùng giữa hai file; spread nông nên mục viết tay **thay hoàn
toàn** mục sinh ra cùng tên — đúng ý định, vì đó là hai chương trình khác nhau.

Bỏ các khóa cũ để lại 15 mục mồ côi trong `courseDetails.*.js` (~30 KB vẫn bị đóng
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

Section Hoạt động cũng chia hai khối như section Khóa học: **Cuộc thi** (3 mục) và
**Sự kiện & hội thảo** (11 mục), mỗi khối một carousel riêng gọi `useSlideshow` của
chính nó.

**Khối nào chứa hoạt động nào suy từ `kind`, KHÔNG có trường `group` trên từng mục
trong i18n.** Đây là chỗ cố ý khác với section Khóa học. Courses buộc phải có
`courses.items[].group` vì chuyên mục của trường không suy ra được từ trường nào
khác; còn ở đây `kind` đã là thứ quyết định — "cuộc thi" đúng bằng
`kind: 'competition'`. Muốn chuyển một hoạt động sang khối kia thì **đổi `kind` của
nó**, đừng thêm trường mới.

Danh sách `kind` của mỗi khối nằm ở **`activities.groups[].kinds` trong i18n**, không
còn ở bảng `KIND_GROUP` viết cứng trong component. Vẫn là **một danh sách cho mỗi
khối** chứ không phải một trường cho mỗi mục, nên lập luận trên còn nguyên — nhưng
thêm một `kind` giờ là sửa dữ liệu, không phải sửa mã.

Trước đây `kind` lạ tra ra `undefined` và hoạt động **biến mất khỏi trang không một
lời cảnh báo**. Giờ `groupActivities()` cho nó rơi vào **khối cuối**: vẫn là đặt sai
chỗ, nhưng sai một cách nhìn thấy được. `npm run check:content` bắt trường hợp này.

**Bậc heading: h2 (section) → h3 (khối) → h4 (tên hoạt động).** Giống hệt section
Khóa học, và cùng một cái bẫy: thêm h3 cho khối mà quên hạ tên hoạt động xuống h4
thì outline có hai h3 ngang hàng.

### Hai kiểu banner tự chạy (từ 2026-10-21)

| Khối | Kiểu | File |
|---|---|---|
| có `groups[].videoBanner: true` (Cuộc thi) | **banner video tràn màn hình**, mỗi cuộc thi một video nền, chỉ chữ trên lớp phủ | [ActivityVideoBanner.jsx](src/components/ActivityVideoBanner.jsx) |
| còn lại (Sự kiện) | **carousel truyền thống**: thẻ trắng ảnh trái / chữ phải, ← → hai bên, chấm tròn, 6,5 giây/slide | `ActivityCarousel` trong [Activities.jsx](src/components/Activities.jsx) |

Lịch sử: lần đầu người dùng nói "video banner auto run", agent hiểu thành banner ẢNH trông
như video — **sai ý**. Ý thật: banner tràn màn hình, nền là video THẬT, lớp phủ trình bày
nội dung. Hỏi rõ "video thật hay hiệu ứng" trước khi làm thứ gì có chữ "video".

Hai kiểu dùng chung bộ não [useSlideshow](src/hooks/useSlideshow.js) (con trỏ, tự chạy,
dừng, vuốt, phím) và [SlideProgress](src/components/SlideProgress.jsx) (chỉ báo slide =
bộ đếm giờ; `variant="bars"` vạch trắng cho banner tối, `variant="dots"` chấm tròn cho
thẻ trắng). Sửa hành vi tự chạy là sửa ở hook, đừng chép lại vào từng banner.

⚠️ **Rê chuột dừng banner tràn màn hình = trông như HỎNG.** Bản đầu dừng tự chạy khi chuột
nằm trên banner; banner Cuộc thi cao gần trọn màn hình nên lúc xem chuột hầu như luôn ở
trên nó → người dùng báo "không tự chạy". Giờ `pauseOnHover` mặc định TẮT, chỉ carousel
Sự kiện (thẻ nhỏ) bật. Bài thử: đặt chuột GIỮA banner rồi chờ — phải tự chuyển. Trước khi
kết luận "tự chạy hỏng", kiểm luôn Windows có tắt hiệu ứng chuyển động không (đọc bằng
`SystemParametersInfo(SPI_GETCLIENTAREAANIMATION)`).

**Banner video:**

- Tràn màn hình bằng `<Section contained={false}>` — Activities tự đặt `container-page`
  cho phần còn lại. **Không dùng `100vw`**: nó tính cả thanh cuộn dọc nên rộng hơn trang.
- Video `muted loop playsInline preload="none"`, phát/dừng bằng effect theo
  `slide đang hiện && đang phát && banner trong khung nhìn` — slide khác, banner chưa cuộn
  tới thì không tải byte nào (đã đo: `readyState 0` trước khi cuộn tới). `muted` phải gán
  cả THUỘC TÍNH trong effect (Safari iOS). `play()` bị từ chối (iPhone tiết kiệm pin) thì
  nuốt lỗi — ảnh poster mờ phía dưới vẫn còn. Video hiện dần khi `playing`, không chớp đen.
- Cuộc thi chưa có video → nền là poster phóng to + mờ + Ken Burns. **Không còn poster
  bên phải và không còn tiêu đề khối nhìn thấy được** (người dùng yêu cầu bỏ, 2026-10-23);
  h3 vẫn ở đó dạng `sr-only` để giữ thứ bậc h2 → h3 → h4.
- Mỗi slide đứng theo `duration` của video, kẹp 8–20 giây.
- Lớp phủ: điện thoại là dải DỌC (chữ dồn đáy, nửa trên để video lộ ra — bản đầu phủ đều
  70% và video gần như biến mất), từ `md` là dải NGANG (chữ bên trái).
- Nút dừng dừng CẢ chuyển slide lẫn video. Giảm chuyển động hoặc `navigator.connection
  .saveData`: video không tự phát, bấm "Phát" mới chạy; slide vẫn không tự chuyển khi
  giảm chuyển động (`playing` ≠ `autoplay` trong hook — đừng gộp).
- Rê chuột lên nút bên trong banner cũng là "rê vào banner" → dừng. Bài thử tự động phải
  đưa chuột ra ngoài sau khi bấm, kẻo tưởng tự chạy hỏng (đã tốn một lượt vì vậy).

**Carousel Sự kiện (từ 2026-10-23, thay banner ảnh nền navy):**

- Người dùng muốn "kiểu truyền thống": thẻ trắng (dựng lại theo bản trước commit 5eb524a),
  ← → hai bên thẻ từ `md`. Ẩn/hiện mũi tên đặt trên DIV bọc, không truyền vào `RoundButton`.
- Các slide chồng cùng một ô grid và hoà vào nhau bằng opacity: thẻ cao bằng slide cao nhất,
  không nhảy chiều cao. Poster vẫn `object-contain` trên nền `wash`.
- **Chấm đang chọn là bộ đếm giờ** (viên dài tô dần `signal`). Điện thoại: hàng chấm RIÊNG
  một dòng, ← ⏸ → ở dòng dưới — chen chung một hàng thì 11 chấm gãy 2–3 dòng ở 320–390px.
- ⚠️ **Giảm chuyển động bật giữa chừng → slide nhấp nháy.** Rule ở `@layer base` ép mọi
  animation còn 0.01ms, tức `animationend` bắn gần như mỗi khung hình. Vì vậy chặn hai lớp:
  hook đọc media query **sống** qua `useMediaQuery` (không phải hằng `REDUCED_MOTION`) để
  tắt tự chạy, và CSS đặt `animation-name: none` cho `animate-banner-progress` /
  `animate-ken-burns`. Đã thử bằng `page.emulateMediaFeatures` cả lúc tải trang lẫn bật
  giữa chừng: slide đứng yên.
- `aria-live` của dòng sr-only là `off` khi đang tự chạy (mẫu carousel WAI-ARIA), `polite`
  khi đã dừng. Nút dừng là bắt buộc (WCAG 2.2.2) — nhãn `activities.pause`/`play`, vào
  database cũ qua migration 010; thiếu thì rơi về `activities.title`.
- Ken Burns (`stamps[i]` làm `key` lớp zoom) giờ chỉ còn ở nền mờ của banner Cuộc thi khi
  chưa có video.
- **Nút đăng ký theo loại trên TỪNG SLIDE** (từ 2026-11-05, API 22 — thay nút "Trở thành thành
  viên FabLab ngay" của API 18–21, người dùng đổi ý): "Đăng ký cuộc thi" / "Đăng ký Workshop" /
  "Đăng ký hội thảo". Thẻ Sự kiện: cột chữ, dưới mô tả. Banner Cuộc thi: hàng [Đăng ký cuộc
  thi] [Xem chi tiết]; chân popup chi tiết cũng có. Mở **form sự kiện** (xem "Ba loại đăng ký"
  bên dưới) qua `openEventRegister(id, source)`.
  - Luật vẽ nút ở MỘT chỗ, [eventRegisterLabel](src/lib/activities.js), dùng cho cả ba nơi và
    khớp luật máy chủ nhận/từ chối: nhãn `activities.registerCta[kind]` có chữ, mục không bật
    `registerClosed`, và `register.event` có mặt. `partnership` (lễ ký kết Việt Anh) cố ý
    KHÔNG có nhãn → không có nút — người dùng chọn vậy.
  - `items[].registerClosed: true` = "Đóng đăng ký" (switch trên dashboard, trường dùng chung).
    **Vắng = đang nhận** — người dùng chọn "mặc định bật" dù gần hết sự kiện trên trang đã qua;
    admin tự tắt từng mục. Đừng đổi thành cờ "mở đăng ký" — lật nghĩa là mọi nút biến mất.
  - `joinMember` còn trong schema (tuỳ chọn, để khôi phục bản lịch sử cũ) nhưng trang không
    đọc nữa; migration 024 xoá nó khỏi database, descriptor bỏ ô — để lại thì `check:admin`
    báo "không có ô sửa được".
- **Nút chữ dài trong ô hẹp dùng prop `wrap` của Button** (bỏ `whitespace-nowrap`, căn giữa):
  cột chữ của thẻ Sự kiện ở 320px chỉ ~240px, nút một dòng rộng ~280px. Đừng truyền
  `whitespace-normal` qua `className` — cùng bẫy thứ tự CSS với `hidden`/`inline-flex`.
- Mọi nút đăng ký trong section Hoạt động ghi CÙNG nguồn đăng ký `events` (dashboard gọi
  là "Section Hoạt động") — cố ý, để khỏi dựng lại bảng `registration` lần nữa. Phân biệt
  từng nút bằng `cta_click`: `events` (thẻ Sự kiện), `competitions` (banner Cuộc thi),
  `competition-detail` (nút Xem chi tiết), `competition-modal` (nút trong popup). Cột
  `target` của bảng `event` không có CHECK nên thêm id nút chỉ cần `CTA_IDS` + nhãn ở
  StatsPage. **Migration 021 dựng lại bảng `registration`** như 017 để thêm `events` vào
  CHECK. Nguồn đăng ký liệt kê ở NĂM chỗ: `REGISTRATION_SOURCES`, `CTA_IDS`, `SOURCE_LABELS`
  (dashboard và máy chủ), nhãn của StatsPage.
- **Popup "Xem chi tiết" của Cuộc thi** ([ActivityModal.jsx](src/components/ActivityModal.jsx),
  khung chép CourseModal): poster `object-contain`, nhãn + ngày, mô tả, rồi hai trường tuỳ
  chọn của mục: `details` (chữ dịch, đoạn cách nhau bằng dòng trống) và `link` (dùng chung,
  https). **Bản seed cố ý không có cả hai** — trang gốc không có nội dung dài, đừng bịa.
  - Tên `link`, KHÔNG phải `href`: luật `href` buộc trỏ neo có thật.
  - contentStore chỉ nối hai chữ cuối của CẢ chuỗi, nên popup gọi `tieLastWords` cho TỪNG
    đoạn lúc render (không chèn U+00A0 vào database).
  - Banner giữ `openId` (đổi ngôn ngữ thì popup dịch theo) và truyền `hold` cho
    `useSlideshow`: popup mở thì slide đứng yên, nếu không thì đóng popup focus trả về một nút
    đã nằm trên slide `inert` và rơi xuống `BODY` (đã đo: giữ nguyên slide sau 12 giây, Esc
    trả focus về đúng nút).
  - Ô `details` / `link` của dashboard mang cờ `omitEmpty` ([model.js](src/admin/editor/model.js)):
    trống thì bỏ hẳn khoá; trường dịch chỉ bỏ khi CẢ HAI bản trống, kẻo hai bản lệch cấu trúc.
  - Nhãn `viewDetails` / `detailLink` / `closeDetails` vào database cũ qua migration 022
    (chốt `viewDetails IS NULL` theo từng ngôn ngữ, `rev` +2). Vắng `viewDetails` thì không có
    nút; vắng `closeDetails` thì mượn `courses.modal.close`.
  - Tìm nút "Xem chi tiết" trong bài thử bằng `/Xem\s+chi\s+tiết/`: ba chữ nên đã bị nối U+00A0.
  - Popup sự kiện mùa tự mở sau 1,2 giây — bài thử phải chờ rồi đóng nó trước, kẻo
    `dialog[open]` bắt nhầm popup Tết.
- Bài thử gửi form bằng puppeteer phải đặt user agent thường và chờ > 3 giây trước khi gửi:
  máy chủ coi trình duyệt headless / điền dưới `MIN_FILL_MS` là bot, trả 201 mà KHÔNG lưu.

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

## Dashboard quản trị

Ở `/admin`. **Entry Vite thứ hai** (`admin.html` + [src/admin/](src/admin/)), không
phải một route của trang công khai: Rollup dựng hai đồ thị độc lập nên người xem
trang tải đúng bằng khi chưa có dashboard. Đã kiểm — `index.html` không hề nạp chunk
nào của admin, và `main-*.css` giữ nguyên hash cũ.

Không dùng react-router trên app hiện tại vì router sẽ vào bundle công khai vô điều
kiện, và chunk admin chỉ tách được nếu MỌI import đều lazy — một import tĩnh lỡ tay
là dính lại, không có lỗi build nào báo.

Dashboard **cố ý không dùng hệ "Loom"**: nó có `admin.css` riêng theo phong cách
TailAdmin (dựng lại bằng token, không chép template). Kéo hệ kia sang là mở rộng vùng
ảnh hưởng của `index.css` (file có ràng buộc thứ tự lớp rất chặt) để đổi lấy thứ công
cụ quản trị không cần.

**Font là Inter, không phải Outfit của TailAdmin.** Outfit chỉ có bộ latin + latin-ext,
và latin-ext bỏ đúng dải U+1EA0–1EF1 (ạ ả ấ ầ ệ ự…) — chữ Việt sẽ ghép từng ký tự với
font hệ thống. Kiểm `unicode-range` trong CSS của gói font trước khi đổi font.

`admin.css` cũng tự loại `server/`, `src/components/`, `src/i18n/`, `src/content/` khỏi
quét Tailwind — chiều ngược của `@source not "./admin"` trong `index.css`.

### "Không tải được ảnh, không lưu được" — kiểm máy chủ TRƯỚC khi debug code

Đã xảy ra một lần: **Vite tự nạp mã dashboard mới, còn `npm run server` thì KHÔNG**.
Người dùng để máy chủ chạy từ sáng qua các commit backend, nên dashboard mới nói chuyện
với máy chủ cũ (chỉ mở "Cảm nhận", chưa có route ảnh) — mọi lỗi trông như lỗi dashboard.
Mã mới chạy đúng hoàn toàn khi thử qua proxy Vite trên bản sao database.

Chốt đã đặt: `/api/health` trả `api` (`API_VERSION` trong
[content.public.js](server/routes/content.public.js)), dashboard so với `EXPECTED_API`
trong [App.jsx](src/admin/App.jsx) và hiện băng đỏ nếu thấp hơn. **Thêm route hay đổi
hợp đồng mà dashboard phụ thuộc thì tăng CẢ HAI số**, và sửa [docs/API.md](docs/API.md)
trong cùng commit — phản hồi mẫu trong đó là phản hồi thật đã chạy trên bản sao database.
Kiểm nhanh: so giờ khởi động tiến
trình trên cổng 3001 với giờ commit backend gần nhất. Lưu ý mọi `/api/admin/*` đều qua
`requireSession` trước khi xét route, nên dò bằng curl chưa đăng nhập luôn ra 401 — không
phân biệt được route có tồn tại hay không.

### "Sửa xong phải tải lại vài lần mới thấy" — đã sửa, đừng làm hỏng lại

Nguyên nhân là header `Cache-Control: public, max-age=60, stale-while-revalidate=600` của
`/api/content`: 60 giây đầu trình duyệt dùng bản cũ không hỏi máy chủ, 10 phút sau đó
còn hiện bản cũ TRƯỚC rồi mới lặng lẽ tải bản mới cho lần sau. Giờ là `no-cache` (luôn
hỏi lại, ETag theo `rev` nên không đổi chỉ tốn một 304), và
[contentStore.js](src/lib/contentStore.js) gọi `fetch(..., { cache: 'no-cache' })` để cả
trình duyệt còn giữ phản hồi theo header cũ cũng phải hỏi lại. Route quản trị: `no-store`.

Ba lớp xác nhận, cả ba đều có hiệu ứng loading:

- **Dashboard tự kiểm sau mỗi lượt lưu / khôi phục / lưu popup**
  ([publish.js](src/admin/lib/publish.js) + [usePublishCheck](src/admin/hooks/usePublishCheck.js)):
  đọc `/api/content` y như trang công khai (`cache: 'no-store'`, không cookie) rồi so với
  bản trong database — sắp khoá trước khi so (Zod dựng lại object theo thứ tự schema), ảnh
  so riêng theo id mục. Chip ở thanh dưới: "Đang kiểm tra…" → "Đã lên trang công khai"
  hoặc "chưa trả bản mới" kèm "Kiểm tra lại". Thử lại ~6 giây rồi mới báo hỏng.
- **Nút Lưu / Xác nhận có vòng xoay** (`loading` của [Button](src/admin/ui/Button.jsx)).
- **Trang công khai**: [ContentSyncBar](src/components/ContentSyncBar.jsx) — vạch mảnh mép
  trên trong lúc hỏi máy chủ, hiện trễ 300ms để 304 nhanh không làm nháy. Trang tự hỏi lại
  khi người xem **quay lại tab** (`visibilitychange`, cách nhau ≥ 3 giây), nên sửa ở tab
  dashboard rồi chuyển sang tab trang là thấy, không cần tải lại. Trạng thái "đang đồng bộ"
  là store RIÊNG — gộp vào store nội dung thì mỗi lượt hỏi làm cả trang vẽ lại hai lần.

Animation lặp vô hạn của vạch tắt bằng `animation-name: none` khi giảm chuyển động (cùng
bẫy `!important` + layer như marquee).

### Ba luật của đường ghi

1. **Mọi thao tác ghi tác động lên CẢ HAI ngôn ngữ trong CÙNG một giao dịch.**
   Giao diện không có nút nào chỉ thêm một mục vào bản tiếng Việt. Nhờ vậy "hai bản
   lệch cấu trúc" là trạng thái **không thao tác ra được**, chứ không phải một lỗi
   trông chờ bộ kiểm bắt lại sau khi đã ghi.
2. **Không có schema thì không ghi được.** `PUT` vào section chưa khai trong
   [schema/sections.js](server/schema/sections.js) trả 400. Cả 17 section đã có
   schema strict. Thêm section mới vào trang là phải thêm schema, không phải nới
   lỏng chốt chặn. `activities.items[].date` **được để trống** — 4 hoạt động thật
   không có ngày; đừng "sửa" schema thành bắt buộc.
3. **`rev` là chốt chống ghi đè.** `GET` trả `rev`, `PUT` phải gửi lại đúng số đó,
   lệch thì 409. Hai tab cùng mở thì tab cũ nhận lỗi thay vì lặng lẽ xoá việc của
   tab kia.

Lịch sử chép bản cũ **trước** khi ghi đè, và khôi phục luôn lấy cả hai ngôn ngữ của
cùng một thời điểm — khôi phục một nửa là đúng cái lệch cấu trúc vừa nói. Lịch sử lưu
kèm ảnh (`bindings_json`), nên khôi phục trả lại cả ảnh.

### 17 section, một bộ soạn thảo

Không có editor viết tay cho từng section. [descriptors.js](src/admin/sections/descriptors.js)
mô tả mỗi section bằng dữ liệu; `SectionPage` + `ItemList` + `ItemModal` dựng mọi thứ.
Hai điều phải giữ, **`npm run check:admin` kiểm cả hai**:

- **Mọi khoá của mục phải được mô tả.** Form dựng lại mục CHỈ từ trường nó biết —
  khoá thiếu mô tả bị rơi mất ở lượt lưu kế tiếp, không cảnh báo. Thêm trường vào
  nội dung là phải thêm vào descriptor.
- **Trường dịch / dùng chung phải khớp `SHARED_FIELDS`** trong
  [invariants.js](server/content/invariants.js). Để trường dùng chung thành hai ô
  VI | EN là dựng ra form chỉ dẫn tới 422.

Form giữ **bản làm việc** `{ id, vi, en, shared }` rồi dựng lại hai mục lúc Áp dụng
([model.js](src/admin/editor/model.js)); trường dùng chung chỉ tồn tại một lần nên không
thể lệch. Thêm/xoá/đổi thứ tự đi qua `mapBoth`. Đổi kiểu thẻ khóa học thì trường của
kiểu kia không lọt vào — `fromWorking` chỉ lấy trường của kiểu đang chọn.

`id` **khoá sau khi tạo**: nó là khoá tra ảnh, icon, bố cục và neo cùng lúc.

### Ảnh đi cùng lượt lưu section

`PUT` nhận `images: { idMục: idẢnh | null }` và áp binding trong **cùng giao dịch** với
chữ. Nhờ vậy "Bỏ thay đổi" huỷ luôn việc thay ảnh. Scope `singleton` còn chứa `logo`
(của Logo.jsx, không thuộc section nào) — đường ghi của `hero` chỉ được đụng `hero`,
nên [SECTION_IMAGES](server/content/assemble.js) liệt kê tường minh.

**Dọn ảnh chỉ cho mục vừa bị xoá TRONG lượt đó**, không phải "binding không khớp mục
nào". Seed có binding mồ côi **có chủ đích**: logo thật của Becamex và BBI nằm sẵn ở
scope `partner` dù hai đối tác chưa có trên trang. Bản đầu dọn kiểu "không khớp là
xoá" và **đã xoá im lặng cả hai ngay lượt lưu Đối tác đầu tiên**, kể cả khi không đổi
gì. Giữ lại thì thêm lại đối tác đó là logo tự về đúng chỗ.

Ghi chú nguồn `~`/`↺` trên binding được giữ khi ảnh không đổi, xoá khi thay ảnh (ghi
chú mô tả quan hệ cũ không còn đúng).

### Bất biến chạy trên từ điển đã ráp, so với MỐC

Sau khi ghi (vẫn trong giao dịch), máy chủ ráp lại toàn bộ và chạy
[invariants.js](server/content/invariants.js) — cùng bộ luật với `check:content`. Luật
cắt ngang section chỉ thấy được ở đây: xoá khối `competitions` làm chết link menu.

Chỉ **lỗi mới** mới chặn, chỉ **cảnh báo mới** mới báo — so với mốc chạy trước khi ghi.
Không có mốc thì: cảnh báo của section khác dội vào mọi lượt lưu, và tệ hơn, một lỗi có
sẵn (ví dụ xoá một icon khỏi mã nguồn) **khoá lưu mọi section vô thời hạn**, kể cả lượt
đang cố sửa chính lỗi đó.

Mục thiếu ảnh là **cảnh báo**, không phải lỗi: component đã có đường lui, và admin phải
tạo được mục trước rồi mới gắn ảnh.

### `rev` công khai = SUM(section.rev) + `content_counter`

Popup chi tiết khóa học ghi vào `course_detail`, không đụng `section`. Thiếu bộ đếm
(migration 002) thì `rev` đứng yên → bộ đệm trả bản cũ, ETag trả 304, `contentStore`
bỏ qua "cùng rev" — bản sửa **không bao giờ lên trang**, không lỗi nào báo. Thêm bảng
nội dung nào ngoài `section` là phải tăng bộ đếm này khi ghi.

Route popup **chỉ ghi dòng `overridden`**; `null` là gỡ bản sửa về bản gốc. Không kiểm
đối xứng (cố ý) và không có lịch sử (bản gốc luôn còn). Xoá khóa học không xoá dòng
`scraped`/`handwritten` — tạo lại đúng id đó là popup cũ sống lại.

### Thư viện ảnh

Tải lên bằng `express.raw` (không multer), xác thực đứng **trước** bộ đọc thân. sharp:
`rotate()` rồi thu cạnh dài về 1600, **không chép metadata** — ảnh điện thoại mang toạ độ
GPS, mà đây là ảnh người thật trên trang công khai. Băm **sau** khi xử lý. Xoá ảnh đang
dùng → 409 kèm danh sách chỗ dùng. Xoá chỉ xoá file ở `data/media/`, bản ở
`public/media/` giữ lại cho snapshot đã commit.

**`/media/<không tồn tại>` phải trả 404.** Không có chốt đó thì nó rơi xuống fallback SPA
và nhận `index.html` mã 200 — ảnh vừa xoá trông như vẫn còn.

### Video nền (từ API 10)

Cùng bảng `media` (phân biệt bằng `mime`, cột `duration` từ migration 011), cùng route tải
lên, cùng bảng `binding` nhưng **scope riêng `activity-video`** → trường `video` (không
phải `image`) trên `activities.items`. Xử lý ở [video.js](server/media/video.js):

- **Không có ffmpeg → không chuyển mã, không nén.** Chỉ nhận MP4 **H.264**; HEVC (mặc
  định iPhone) và `.mov` bị từ chối 415 kèm hướng dẫn. Trần 40 MB (ảnh vẫn 15 MB) — nginx
  phải `client_max_body_size 41m`.
- **Xoá GPS mà không làm hỏng video:** video điện thoại mang toạ độ nơi quay
  (`moov/udta/©xyz`, `moov/meta`). Xoá hẳn hộp sẽ dịch `mdat` và làm sai `stco`/`co64`;
  vì vậy hộp `udta`/`meta`/`uuid` được ĐỔI TÊN thành `free` và ghi 0 — kích thước giữ
  nguyên. Đã thử: chèn `©xyz` vào cả `moov` lẫn cấp file → file lưu không còn toạ độ,
  Chrome vẫn phát.
- MP4 phân mảnh (MediaRecorder…) ghi `duration` 0 ở `mvhd` → đọc thêm `mvex/mehd`.

**Đường ghi có "khe" (slot):** `slotsOf(section)` trong [mutate.js](server/content/mutate.js)
— `images` và (riêng Hoạt động) `videos`. Lượt lưu nhận `videos` y như `images`; khe ảnh
chỉ nhận ảnh, khe video chỉ nhận video (422 — gắn nhầm thì `<img>` trỏ vào MP4, không ai
báo). `bindings_json` của lịch sử: section chỉ có ảnh **giữ định dạng mảng cũ**; section
nhiều khe ghi object `{ images, videos }`. Đọc mảng = chỉ khe ảnh → khôi phục bản cũ của
Hoạt động giữ nguyên video hiện tại. Dashboard: `ImageField kind="video"`, `MediaPicker`
lọc theo `kind`, bước "đã lên trang công khai" so cả video.

Không có ffmpeg trên máy này thì tự tạo video thử bằng `MediaRecorder` của Chrome
(`video/mp4;codecs=avc1.42E01E`) qua puppeteer — xem `pp/makevideo.cjs` trong scratchpad
(ngoài git). Bài thử trọn đường (tải lên → gắn → công khai → khôi phục) chạy trên máy chủ
bản sao cổng 3999; preview trỏ sang đó bằng một vite config riêng, KHÔNG đụng 3001/5173
người dùng đang chạy.

Kiểm kịch bản ghi thì chạy trên **bản sao** database: `DATA_DIR=<thư mục khác> npm run
server`. Đừng thử trên `data/` thật — lịch sử và `rev` không quay lại được.

### Đăng nhập

Đúng một tài khoản (`CHECK (id = 1)` ở lược đồ, không phải quy ước ai đó phải nhớ).
Tạo bằng `npm run admin:create` — **hỏi trực tiếp, không đọc biến môi trường**:
`.gitignore` của repo này vốn không có mục `.env` nào, nên mật khẩu khởi tạo đặt ở
đó chỉ cách `git add -A` một bước. Cũng cố ý không có trang cài đặt lần đầu trên
web — đó là cuộc đua với con bot nào tìm thấy host trước.

Phiên là token mờ 32 byte; database **chỉ lưu sha256 của token**. Không dùng JWT vì
JWT không thu hồi được, mà "đổi mật khẩu là đăng xuất mọi nơi" chỉ là một câu
`DELETE` khi đã có bảng.

Chống CSRF ba lớp: `SameSite=Lax`, **kiểm `Origin`** (lớp chịu lực), và double-submit
token so bằng thời gian hằng định. Giới hạn đăng nhập hai tầng: theo IP và theo tài
khoản trong database — kẻ đổi IP liên tục đi thẳng qua tầng đầu.

> ⚠️ Sau nginx **bắt buộc** `app.set('trust proxy', 1)` (đã đặt) **và**
> `proxy_set_header X-Forwarded-For`. Thiếu vế thứ hai thì mọi request trông như
> `127.0.0.1`: một lần sai mật khẩu khoá cả thế giới, mà bộ giới hạn thì trông vẫn
> như đang chạy đúng.

## Form đăng ký và thống kê truy cập

Mọi nút "Đăng ký" (navbar, drawer, popup khóa học, FinalCTA) mở **một**
`RegisterDialog` dùng chung qua `RegisterContext`. Máy chủ: route ghi công khai ở
[public.write.js](server/routes/public.write.js), quản trị ở
[registrations.admin.js](server/routes/registrations.admin.js) và
[stats.admin.js](server/routes/stats.admin.js). Hợp đồng đầy đủ ở
[docs/API.md](docs/API.md#12-đăng-ký-khóa-học).

### Hai loại đăng ký: Thành viên FabLab | Khóa học (từ 2026-10-27, API 12)

Form có hai tab ([RegisterForm.jsx](src/components/register/RegisterForm.jsx), mẫu WAI-ARIA
Tabs). Mở từ popup khóa học → tab Khóa học, chọn sẵn khóa; mở từ menu / cuối trang → tab đã
chọn lần trước (lần đầu Khóa học). Mỗi tab một bản nháp riêng trong provider.

- **Thành viên chỉ từ 16 tuổi**, tự điền và tự đồng ý — người dùng chọn vậy để khỏi phải
  hỏi phụ huynh (dữ liệu trẻ em cần cha mẹ đồng ý, Nghị định 13/2023). Năm sinh kiểm ở cả
  hai phía (`birthYearError`, chép hai nơi như `normalizePhone`). Email bắt buộc với thành
  viên, không bắt buộc với khóa học.
- **Cùng bảng `registration`, cột `kind`.** Migration 014 DỰNG LẠI bảng (SQLite không đổi
  được `parent_name NOT NULL`); CHECK giữ luật "khóa học phải có phụ huynh". Quy ước:
  thành viên dùng `student_name` = họ tên, `school` = trường / đơn vị. Đã thử trên bản
  sao: dữ liệu cũ khớp mã băm trước/sau.
- **Mọi chỗ đếm "theo khóa" phải lọc `kind = 'course'`** — thành viên có `course_id`
  NULL, không lọc là cả nhóm dồn vào "chưa chọn — cần tư vấn". Đã chặn ở `byCourse` và
  bộ lọc `course=-`; thống kê ở stats.admin.js vốn đã `course_id IS NOT NULL`.
- **Id đối tượng / lĩnh vực cố định trong mã** (`MEMBER_ROLES` / `MEMBER_INTERESTS`, chép ở
  `server/schema/registration.js` và `validate.js`), nhãn ở `register.memberRoles` /
  `memberInterests`. Schema nội dung là `strictObject` đúng các khoá đó, và bảng nhãn trên
  dashboard dùng `RecordEditor` với `fixed: true` (không nút thêm/xoá).
- `kind` vắng = `course`: bundle cũ trong cache trình duyệt vẫn gửi được.
- Bài thử gửi form bằng puppeteer: chữ trên nút đã qua `tieLastWords` nên có U+00A0 —
  tìm nút bằng `/Đăng\s+ký/`, đừng so chuỗi có dấu cách thường.

### Loại thứ ba: đăng ký sự kiện (từ 2026-11-05, API 22)

`kind: 'event'` — form mở từ nút "Đăng ký cuộc thi / Workshop / hội thảo" của section Hoạt
động (xem "Hai kiểu banner tự chạy"). **Không phải tab**: `KINDS` (danh sách tab) vẫn là
member/course; provider nhớ riêng `tab` lần cuối, nên mở form sự kiện rồi bấm "Đăng ký" ở
navbar vẫn về tab cũ. Tiêu đề form là chính nhãn nút; đầu form là khung tên sự kiện + chip
loại + ngày, không đổi được trong form.

- **Mọi lứa tuổi; dưới 16 tuổi (tính theo năm) thì BẮT BUỘC tên phụ huynh** — người dùng chọn
  vậy (cuộc thi / workshop có học sinh). Ô "Họ tên phụ huynh" chỉ hiện khi năm sinh vừa nhập
  cho ra < 16 (`needsParent` ở validate.js); máy chủ kiểm lại bằng `superRefine` của
  `eventSchema`. Năm sinh: cùng luật năm hợp lệ, KHÔNG chặn tuổi (`eventBirthYearError`, chép
  hai nơi). Tên phụ huynh còn sót trong nháp (gõ 2015 rồi sửa) thì form không gửi.
- **Một câu đồng ý cho cả hai trường hợp** (`register.event.consent`: "Tôi là người tham gia từ
  16 tuổi, hoặc cha mẹ / người giám hộ…") — `consent_text` lưu đúng chữ người gửi đã thấy, nên
  đừng tách hai câu theo tuổi.
- Máy chủ tra hoạt động trong bản VI hiện hành: không có / `registerClosed` / loại không có
  nhãn `registerCta` → `422 event` (form cũng tự báo, khung tên sự kiện hiện lỗi). Lưu
  `event_id` + `event_title` (tên chụp lúc gửi, như `course_title`), `student_name` = người
  tham gia, `school` = đơn vị. Chống trùng thêm cả họ tên — anh chị em cùng số phụ huynh.
- **Migration 024 dựng lại bảng `registration`** (như 014/017/021): CHECK `kind` thêm `event`,
  hai cột mới, luật phụ huynh thành `kind <> 'course' OR parent_name IS NOT NULL`. Cùng file
  chèn `activities.registerCta`, `register.event`, `errors.event` (chốt từng ngôn ngữ, `rev` +2
  mỗi section) và xoá `joinMember`. Sinh bằng máy từ vi.js / en.js. Đã thử trên bản sao
  database thật: 2 dòng đăng ký cũ khớp mã băm, chạy lại không đổi gì.
- Loại đăng ký liệt kê ở: `REGISTRATION_KINDS` (máy chủ), CHECK của bảng, `KIND` +
  `statusLabel` + `registrationTopic` (dashboard), `KIND_LABELS` / `KIND_STATUS_LABELS` (CSV).
  `enrolled` của sự kiện hiển thị "Đã xác nhận".
- Đã thử bằng puppeteer trên bản sao (3999 / 4320): nhãn đúng theo loại trên cả 14 slide, mục
  hợp tác không nút, người lớn → 201, năm 2015 → hiện ô phụ huynh, trống thì báo lỗi, điền thì
  lưu kèm `parent_name`; bật "Đóng đăng ký" → nút mất + POST 422; 320/390/1280 không tràn ngang.

### Thêm section vào database ĐÃ seed: migration có chốt, và chốt theo TỪNG ngôn ngữ

`npm run seed` chỉ chạy trên database trống, nên section `register` vào database đang
dùng qua [004_register_content.sql](server/db/migrations/004_register_content.sql) (JSON
đóng băng, sinh bằng máy từ `vi.register`/`en.register`). Hai chốt, cả hai bắt buộc:

- `WHERE EXISTS (SELECT 1 FROM section)` — trên database trống migration chạy TRƯỚC
  seed (`getDb()` áp migration ngay khi mở); chèn lúc đó thì seed từ chối chạy.
- `NOT EXISTS (… key = 'register' AND locale = '<ngôn ngữ>')` — **bản đầu chốt theo key
  thôi**: dòng `vi` vừa chèn làm câu `en` thấy "đã có", `en` không bao giờ vào, trang
  tiếng Anh sập ở `t.register`. Chỉ lộ ra nhờ thử trên bản sao và thấy `rev` tăng 1
  thay vì 2. **Kiểm `rev` tăng đúng 2 lần số section mới** là cách bắt lỗi này.

Vì sao section riêng mà không nhét vào `courses.modal`: `restoreHistory()` ghi lại bản
cũ **không qua schema**, nên khôi phục một bản `courses` trước ngày có form sẽ xoá mất
khoá mới và trang sập. Section mới không có lịch sử nên không dính.

### Đăng ký và sự kiện KHÔNG BAO GIỜ đổi `rev` nội dung

Không đụng `section`, `content_counter`, không gọi `invalidate()`. Đụng là mỗi lượt đăng
ký phá bộ đệm nội dung của mọi người đang xem. Bài thử trên bản sao so `rev` trước/sau.

### Router ghi công khai mount TRƯỚC `express.json` chung

Mỗi route tự đọc thân với giới hạn nhỏ (8 KB / 2 KB); mount sau thì bộ đọc 2 MB đã nuốt
thân. `/api/events` đọc thân dạng **chuỗi** cho cả `text/plain` lẫn JSON: `sendBeacon`
với thân chuỗi gửi `text/plain`, và JSON hỏng phải là bỏ im lặng chứ không phải 400.

Bộ xử lý lỗi cuối giờ trả đúng 4xx của body-parser (`400 entity.parse.failed`,
`413 entity.too.large`) thay vì gộp thành 500.

### Thống kê: "khách" chỉ duy nhất trong MỘT ngày

`sha256(muối ngày | IP | UA)`, muối cũ bị xoá ([retention.js](server/analytics/retention.js)).
Đó là thứ làm lời hứa "không lưu IP" đúng — đừng "sửa" thành muối cố định để đếm khách
duy nhất trong 30 ngày. Mọi phép đếm khách là `COUNT(DISTINCT day || '|' || visitor)`.
Nhãn giao diện luôn ghi "lượt khách (theo ngày)". `register_submit` chỉ máy chủ ghi —
client gửi lên bị bỏ, để tỉ lệ chuyển đổi không bị bơm.

DNT / GPC được tôn trọng ở cả hai phía ([track.js](src/lib/track.js) và máy chủ). Thấy
thống kê trống khi tự thử: kiểm trình duyệt có bật chống theo dõi không, giống bẫy
`prefers-reduced-motion` ở trên.

### Hai dialog chuyển giao cho nhau trong CÙNG một lượt render

Nút đăng ký trong popup khóa học đóng popup rồi mở form. `RegisterDialog` phải mount
**sau `<Footer />`** trong [App.jsx](src/App.jsx): effect chạy theo thứ tự cây, popup
`close()` trả focus về thẻ khóa học trước, rồi form mới `showModal()` và ghi nhớ đúng thẻ
đó. Khoá cuộn dùng chung [useScrollLock](src/hooks/useScrollLock.js) có **bộ đếm** — hai
khoá độc lập mỗi bên tự nhớ "giá trị trước" thì bên sau nhớ nhầm `hidden` của bên trước.

Form **không** đóng khi bấm ra nền (khác popup khóa học), và bản nháp nằm trong provider
chứ không trong form — lỡ Esc không mất chữ. Nháp không bao giờ ghi xuống localStorage:
dữ liệu cá nhân của trẻ em.

`Button` không đặt `type` mặc định — trong `<form>` mọi nút không phải nút gửi phải khai
`type="button"`.

### Chữ lỗi dùng `alert`, không dùng `ember`

`ember` (#ff613d) chỉ ~3:1 trên nền trắng — không đủ cho chữ lỗi cỡ caption. Token
`--color-alert` (#c43d1f, ~5,2:1) thêm vào `@theme` cho việc này.

### Dữ liệu cá nhân

Đăng ký tự xoá sau `REGISTRATION_RETENTION_DAYS` (365). Câu "lưu tối đa 12 tháng" trong
`register.privacy` là lời hứa với người gửi — đổi số ngày thì đổi câu. Mỗi dòng lưu
nguyên văn chữ đồng ý (`consent_text`) làm bằng chứng; máy chủ tự tra, không nhận từ
client. Thử kịch bản đăng ký thì **chỉ trên bản sao** — đây là bảng có tên trẻ em thật.

## Backend: ảnh, snapshot, và những chỗ dễ sập

Toàn bộ ở [server/](server/). Truy cập database đi qua **đúng một file**
[db/index.js](server/db/index.js) — driver là module biên dịch sẵn, đã phải lùi về
`better-sqlite3@11` vì bản mới **không có nhị phân dựng sẵn cho Node 20 trên
Windows** và máy này không có Visual Studio. Gói vào một file thì đổi driver về sau
chỉ sửa một chỗ. `engines` ghim Node 20; nâng Node major là phải `npm rebuild`.

**Ảnh không còn là ES import.** Chúng nằm ở `data/media/` (tên mang 8 ký tự đầu của
sha256, nên đổi ảnh là đổi URL — chống cache y như Vite đang làm), và nội dung mang
sẵn `image: { url, width, height }` trên từng mục. Bảng `binding` **cố ý không có
cột ngôn ngữ**: một mục một ảnh, nên VI và EN không thể hiện hai ảnh khác nhau, và
bộ kiểm đối xứng không phải đi canh chuyện đó.

**`export-snapshot.js` đồng bộ `data/media/` → `public/media/`** để `vite build`
chép vào `dist/media/`. Đây là thứ giữ cho trang **vẫn chạy offline**: `dist/` mang
đi đâu cũng tự đủ, không phụ thuộc tiến trình Node nào. Bỏ bước này là 60 ảnh biến
thành ảnh vỡ ngay khi máy chủ tắt. Giá phải trả: ảnh admin mới tải lên chưa có mặt
trong bản offline cho tới lần `npm run build` kế tiếp.

**[Logo.jsx](src/assets/icons/Logo.jsx) import THẲNG file ảnh**, không qua
`images/index.js`. Module đó import cả 60 ảnh, nên chỉ cần một component chạm vào là
Rollup phát ra toàn bộ 4,1 MB vào `dist/assets/` — kể cả khi nội dung đã lấy ảnh từ
máy chủ. Đây là chỗ duy nhất còn dùng ảnh đóng gói, và cố ý giữ vậy.

**Kích thước ảnh lấy theo số đo thật, không theo số khai cũ.** `PARTNER_LOGOS` từng
khai 194×120 cho những file thật ra tới 2560×663 — số khai là cỡ hiển thị. Vì
`w-auto` nên sau khi ảnh tải xong trình duyệt vẫn dùng cỡ thật, nên khai đúng là
sửa một lệch lạc đang có. Bảy logo đối tác thuộc diện này, và chúng cũng là 1,9 MB
chưa nén cần xử lý.

**`npm run seed` chỉ chạy được một lần** (từ chối nếu database đã có nội dung). Sau
đó dùng `npm run verify:seed` để chứng minh không mất gì: nó dựng lại `{vi, en}` từ
database rồi so sâu với module gốc, và phải in **`identical`**.

## `npm run check:content` — chạy trước khi tin là xong

Repo không có bộ test. [check-content.js](server/scripts/check-content.js) là thứ
thay thế: nó khẳng định những ràng buộc **không có cảnh báo lúc build** — đối xứng
VI↔EN, `kind`/`icon`/`stage`/`topic` tra được, đúng một `lead`, `stats.items[].value`
là số, mọi `href` trỏ tới neo có thật, id không trùng, trường không dịch bằng nhau giữa
hai bản. Mục thiếu ảnh chỉ còn là cảnh báo.

Luật nằm ở [invariants.js](server/content/invariants.js); script chỉ nạp dữ liệu và in.
**Sửa luật ở đó là sửa cho cả đường ghi của dashboard** — không có bản thứ hai.

Trường dùng chung chỉ so trên **phần tử có `id`**: `courses.filters.stage` là nhãn dịch
("Cấp học" / "School level") trùng tên với trường tra cứu `courses.items[].stage`. Bản
đầu so theo tên khoá và báo lỗi nhầm đúng chỗ này.

Hai chế độ, cùng một bộ ràng buộc: mặc định kiểm **module i18n** (corpus seed), còn
`--snapshot` kiểm **bản dự phòng thật sự được đóng gói**. Bản dự phòng mới là thứ
người xem nhìn thấy lúc API trục trặc, nên đừng tin rằng "seed đúng thì snapshot tất
đúng" — chạy cả hai.

Hai điều về cách viết nó, đừng sửa ngược lại:

- **So VI với EN, tuyệt đối không so với một hằng số.** Thêm một testimonial là số
  đường khoá đổi một cách hợp lệ. Chốt cứng con số sẽ biến mọi lần sửa đúng thành
  lỗi, và bộ kiểm bị tắt đi trong vòng một tuần. Con số chỉ được in ra tham khảo.
- **Bảng icon và tập neo quét ra từ mã nguồn**, không chép tay vào script — chép
  tay là tự tạo thêm một chỗ nữa để lệch.

Nạp được `src/i18n/*.js` bằng Node thuần là nhờ
[import-hook.mjs](server/scripts/import-hook.mjs): các file này dùng specifier
thiếu đuôi (`from './courseDetails.vi'` — lưu ý `extname()` của chuỗi đó là `.vi`,
đừng lọc theo đuôi) và import thẳng file ảnh. Vite lo hai chuyện đó, Node thì không.

## Component phải chịu được dữ liệu lạ

Nguyên tắc: **design token ở lại trong mã, mọi tra cứu có đường lui xác định.**

Bốn chỗ từng tra bảng rồi dùng thẳng kết quả, nay đều có đường lui: `Pillars` và
`Facilities` rơi về vòng lặp theo chỉ số (trước đây tra hụt là **TypeError, trắng
nguyên trang**), `Activities` rơi về khối cuối, `CourseCard` bỏ hẳn nhãn/huy hiệu
thay vì dựng ra ô trống. Thứ tự vòng lặp khớp đúng id hiện có nên hình ảnh không đổi.

**Đừng đưa tên class vào dữ liệu để "cho sửa được từ dashboard".** Tailwind v4 sinh
CSS bằng cách quét văn bản nguồn; một tên class chỉ tồn tại dưới dạng chuỗi trong
database thì **không sinh ra CSS nào cả** — phần tử hiện không style, không cảnh báo.

**`{icon && …}` KHÔNG chặn được gì** khi `icon` là một phần tử JSX: `<CourseIcon />`
luôn truthy dù bên trong nó trả `null`, nên huy hiệu tròn nền trắng vẫn được dựng và
kết quả là một chấm trống trơn. Phải hỏi tập id (`COURSE_ICON_IDS`,
`PILLAR_ICON_IDS`, `FACILITY_ICON_IDS`) trước khi dựng khung bọc.

## Bẫy môi trường (Windows)

- oxlint bắt lỗi `react(set-state-in-effect)`. Cách xử lý đã dùng: **derive lúc
  render** thay vì `setState` trong effect (xem `display` ở StatsBar và `current`
  ở Testimonials).
- **Tailwind quét cả comment.** Viết tên class đầy đủ trong comment sẽ sinh ra CSS
  chết cho class không ai dùng. Diễn đạt vòng khi cần nhắc tới một class.
- **Tailwind quét cả `server/`.** Cơ chế dò nội dung tự động đi từ file có
  `@import 'tailwindcss'` ra toàn cây nguồn, nên một chuỗi trong mã máy chủ đọc
  được thành tên utility sẽ lọt vào stylesheet công khai. Đã kiểm bằng thực nghiệm:
  bỏ `@source not "../server"` ra thì một class đặt trong file `server/` **có** xuất
  hiện trong CSS đã build; thêm vào thì không. Đường dẫn tính tương đối với chính
  file CSS. Thêm entry mới (ví dụ `src/admin/`) thì phải loại trừ y như vậy.
- **`import()` trên Windows không nhận đường dẫn `D:\...`** — bắt buộc `file://`
  URL qua `pathToFileURL()`. Trên Linux đường dẫn tuyệt đối chạy bình thường, nên
  lỗi này chỉ lộ ra ở đúng máy đang dùng để phát triển.
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

**Xem được file ảnh — và CHỤP ĐƯỢC trang đã render** (từ 2026-10-21). Máy có Chrome ở
`C:/Program Files/Google/Chrome/Application/chrome.exe`. Cài `puppeteer-core` vào
**thư mục scratchpad** (không vào repo), chạy `vite build --outDir <scratch>` +
`vite preview`, rồi `page.emulate({ viewport: { width: 390, isMobile: true, hasTouch:
true } })` để giả lập điện thoại thật: đo `innerWidth`/`scrollWidth` (tràn ngang), thử
vuốt bằng `page.touchscreen`, bấm nút, chụp `element.screenshot()` rồi mở bằng Read.

**Bẫy:** `chrome --headless --window-size=390,…` KHÔNG cho khung nhìn 390px — Chrome trên
Windows ép tối thiểu **500px** nhưng ảnh vẫn cắt ở 390, nên trông như trang bị tràn mép
phải trong khi đó là lỗi của công cụ. Luôn đo `innerWidth` trước khi tin ảnh chụp, và
dùng `page.emulate` của puppeteer chứ không dùng cờ `--window-size`.

Chụp được nhưng vẫn là trình duyệt giả lập: cảm giác cuộn, độ mượt animation và Safari
thật trên iPhone vẫn nên nhờ người dùng xem lại.

Ngoài ảnh chụp, các kiểm chứng **cấu trúc** vẫn dùng: grep CSS đã build, đối chiếu id ↔
ảnh, lint, build. Tràn ngang ở 320–768px và navbar còn dính thì giờ tự đo được bằng
puppeteer (xem trên); độ mượt của hover / animation thì vẫn nhờ người dùng nhìn.
