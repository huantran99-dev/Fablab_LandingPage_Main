# API — FabLab EIU

Mô tả toàn bộ HTTP API của máy chủ Express trong [server/](../server/): đọc nội dung
công khai, đăng nhập, sửa 12 section, thư viện ảnh, popup chi tiết khóa học. Viết cho
lập trình viên bảo trì dashboard hoặc tích hợp thêm công cụ.

Mọi phản hồi mẫu dưới đây là **phản hồi thật**, chạy trên một bản sao database (rút
gọn chỗ dài bằng `…`). Deploy thì xem [DEPLOY.md](DEPLOY.md).

> **Nguồn sự thật là mã, không phải tài liệu này.** Route ở
> [server/routes/](../server/routes/), hình dạng dữ liệu ở
> [server/schema/sections.js](../server/schema/sections.js), luật cắt ngang section ở
> [server/content/invariants.js](../server/content/invariants.js). Đổi route hay hợp
> đồng thì tăng `API_VERSION` và sửa file này trong cùng commit.

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Xác thực và chống CSRF](#2-xác-thực-và-chống-csrf)
3. [Mã lỗi chung](#3-mã-lỗi-chung)
4. [Route công khai](#4-route-công-khai)
5. [Đăng nhập — `/api/auth`](#5-đăng-nhập--apiauth)
6. [Nội dung section — `/api/admin`](#6-nội-dung-section--apiadmin)
7. [Hình dạng 12 section](#7-hình-dạng-12-section)
8. [Thư viện ảnh](#8-thư-viện-ảnh)
9. [Popup chi tiết khóa học](#9-popup-chi-tiết-khóa-học)
10. [Meta cho dashboard](#10-meta-cho-dashboard)
11. [Ví dụ trọn luồng bằng curl](#11-ví-dụ-trọn-luồng-bằng-curl)

### Bảng route

| Phương thức | Đường dẫn | Cần đăng nhập | Cần CSRF |
|---|---|---|---|
| GET | [`/api/health`](#get-apihealth) | | |
| GET | [`/api/content`](#get-apicontent) | | |
| GET | [`/api/content/:locale`](#get-apicontentlocale) | | |
| GET | [`/media/:filename`](#get-mediafilename) | | |
| POST | [`/api/auth/login`](#post-apiauthlogin) | | |
| GET | [`/api/auth/session`](#get-apiauthsession) | | |
| POST | [`/api/auth/logout`](#post-apiauthlogout) | ✔ | |
| POST | [`/api/auth/password`](#post-apiauthpassword) | ✔ | ✔ |
| GET | [`/api/admin/sections`](#get-apiadminsections) | ✔ | |
| GET | [`/api/admin/content/:section`](#get-apiadmincontentsection) | ✔ | |
| PUT | [`/api/admin/content/:section`](#put-apiadmincontentsection) | ✔ | ✔ |
| GET | [`/api/admin/history/:section`](#get-apiadminhistorysection) | ✔ | |
| POST | [`/api/admin/history/:id/restore`](#post-apiadminhistoryidrestore) | ✔ | ✔ |
| GET | [`/api/admin/media`](#get-apiadminmedia) | ✔ | |
| POST | [`/api/admin/media`](#post-apiadminmedia) | ✔ | ✔ |
| PATCH | [`/api/admin/media/:id`](#patch-apiadminmediaid) | ✔ | ✔ |
| DELETE | [`/api/admin/media/:id`](#delete-apiadminmediaid) | ✔ | ✔ |
| GET | [`/api/admin/course-details/:id`](#get-apiadmincourse-detailsid) | ✔ | |
| PUT | [`/api/admin/course-details/:id`](#put-apiadmincourse-detailsid) | ✔ | ✔ |
| GET | [`/api/admin/meta`](#get-apiadminmeta) | ✔ | |

"Cần đăng nhập" kéo theo kiểm `Origin` cho mọi phương thức không phải GET (xem mục 2).

---

## 1. Tổng quan

- **Gốc:** cùng tên miền với trang. Máy lập trình: `http://127.0.0.1:3001`, hoặc qua
  Vite `http://localhost:5173` (Vite chuyển tiếp `/api`, `/media`).
- **Định dạng:** JSON UTF-8, trừ `POST /api/admin/media` nhận byte ảnh thô.
- **Không có CORS.** API chỉ dùng được từ chính trang (same-origin). Đây là chủ đích:
  cookie đăng nhập và kiểm `Origin` dựa trên điều đó.
- **Phiên bản:** `GET /api/health` trả `api` (hiện là `2`, hằng `API_VERSION` trong
  [content.public.js](../server/routes/content.public.js)). Dashboard so với
  `EXPECTED_API` trong [src/admin/App.jsx](../src/admin/App.jsx) và hiện băng đỏ nếu máy
  chủ thấp hơn — dấu hiệu máy chủ chưa được khởi động lại sau khi cập nhật.
- **Chuỗi `error` là mã cho máy đọc**, viết không dấu, ổn định để so sánh. Không hiện
  thẳng cho người dùng; dashboard dịch lại ở `describeError` trong
  [src/admin/lib/api.js](../src/admin/lib/api.js). Riêng thông báo lỗi Zod trong
  `vi[].message` / `en[].message` có thể có dấu (bản địa hoá tiếng Việt của Zod).
- **Hai ngôn ngữ luôn đi cùng nhau.** Mọi route ghi nội dung nhận và ghi `vi` + `en`
  trong **một giao dịch**; không có route nào ghi riêng một ngôn ngữ.

---

## 2. Xác thực và chống CSRF

### Cookie

| Cookie | Thuộc tính | Vai trò |
|---|---|---|
| `fablab_admin` | `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` khi `NODE_ENV=production` | Token phiên mờ 32 byte. Database chỉ lưu sha256 của nó |
| `fablab_csrf` | như trên nhưng **không** `HttpOnly` | Token CSRF, JS đọc được |

Phiên sống **7 ngày kể từ lần dùng cuối** (gia hạn trượt), trần cứng **30 ngày** kể từ
lúc đăng nhập. Đổi mật khẩu xoá mọi phiên.

### Ba lớp kiểm cho request ghi

Áp cho mọi request **không phải GET/HEAD/OPTIONS** tới `/api/admin/*`,
`/api/auth/logout`, `/api/auth/password`:

1. **Phiên** — cookie `fablab_admin` hợp lệ, không thì `401 chua dang nhap`.
2. **Gốc request** — header `Origin` phải bằng `SITE_ORIGIN` (hoặc
   `http://127.0.0.1:<PORT>` / `http://localhost:<PORT>`), **hoặc** trình duyệt gửi
   `Sec-Fetch-Site: same-origin`. Không thì `403 goc request khong hop le`.
3. **CSRF** — header `x-csrf-token` phải bằng giá trị cookie `fablab_csrf`. Không thì
   `403 thieu hoac sai CSRF token`. `/api/auth/logout` không đòi lớp này.

Lấy token từ trường `csrfToken` trong phản hồi `POST /api/auth/login` hoặc
`GET /api/auth/session`.

> **Mỗi lần gọi `GET /api/auth/session` là một token CSRF MỚI**, và cookie cũ bị thay.
> Luôn dùng token của lần gọi gần nhất. Hai tab dashboard cùng mở: tab nào tải lại sau
> sẽ làm token của tab kia hết hiệu lực (`403`), tải lại tab đó là xong.

Mọi `/api/admin/*` kiểm phiên **trước** khi xét route, nên dò bằng request chưa đăng
nhập luôn nhận `401` — không phân biệt được route có tồn tại hay không.

### Giới hạn đăng nhập

| Tầng | Luật | Phản hồi |
|---|---|---|
| Theo IP | **5 lượt gọi `/api/auth/login` mỗi 15 phút**, tính cả lượt **thành công** | `429` + header `Retry-After`, `RateLimit`, `RateLimit-Policy: 5;w=900` |
| Theo tài khoản | Từ lần sai thứ 5, khoá 1 s, 2 s, 4 s… gấp đôi mỗi lần, trần 15 phút. Đăng nhập đúng thì về 0 | `401` kèm `lockedSeconds` |

IP lấy từ `X-Forwarded-For` (`trust proxy 1`) — sau nginx bắt buộc đặt header này, xem
[DEPLOY.md](DEPLOY.md#6-deploy-lần-đầu).

### curl: tự đặt `Origin`

curl không gửi `Origin` hay `Sec-Fetch-Site`, nên phải tự thêm. Mẫu dùng trong cả tài
liệu:

```bash
D=http://127.0.0.1:3001          # production: https://ten-mien
JAR=cookies.txt
O="Origin: $D"                   # phai khop SITE_ORIGIN

curl -s -c $JAR -H "$O" -H 'content-type: application/json' \
  -d '{"username":"admin","password":"..."}' $D/api/auth/login

# Token CSRF chinh la gia tri cookie fablab_csrf trong jar:
CSRF=$(awk '$6=="fablab_csrf"{print $7}' $JAR)

# Request ghi: -b gui cookie, them Origin va x-csrf-token
curl -s -b $JAR -H "$O" -H "x-csrf-token: $CSRF" ...
```

Nếu gọi `GET /api/auth/session` giữa chừng thì dùng `-b $JAR -c $JAR` để jar nhận cookie
CSRF mới, rồi đọc lại `CSRF`.

---

## 3. Mã lỗi chung

Mọi lỗi có dạng `{ "error": "<ma>", ...chi tiết }`.

| Mã | Khi nào | `error` |
|---|---|---|
| `400` | Thiếu/sai tham số, section không có schema, gắn ảnh cho section không có ảnh | nhiều loại, xem từng route |
| `401` | Chưa đăng nhập / hết phiên; sai mật khẩu | `chua dang nhap`, `ten dang nhap hoac mat khau khong dung` |
| `403` | Sai gốc request; thiếu/sai CSRF | `goc request khong hop le`, `thieu hoac sai CSRF token` |
| `404` | Không có route / section / ảnh / khóa học / bản lịch sử | `khong co route nay`, `khong co section nay`, … |
| `409` | `rev` lệch (người khác đã sửa); xoá ảnh đang dùng | `noi dung da bi nguoi khac sua`, `anh dang duoc dung, go khoi cac muc truoc` |
| `415` | Tải lên thứ không phải JPEG/PNG/WebP | `chi nhan anh JPEG, PNG, WebP ...`, `file khong phai anh hop le ...` |
| `422` | Nội dung sai — ba dạng, xem [PUT section](#put-apiadmincontentsection) | `noi dung khong hop le`, `hai ngon ngu khong cung cau truc`, `noi dung vi pham rang buoc cua trang` |
| `429` | Quá giới hạn đăng nhập | `thu qua nhieu lan, doi mot lat` |
| `500` | Lỗi máy chủ — **và ba trường hợp đáng lẽ là 4xx**, xem dưới | `loi may chu` |

> ⚠️ **Hạn chế hiện tại:** bộ xử lý lỗi cuối trong [app.js](../server/app.js) luôn trả
> `500`, bỏ qua mã của lỗi. Nên ba trường hợp sau nhận `500 loi may chu` thay vì mã đúng:
>
> | Trường hợp | Đáng lẽ |
> |---|---|
> | Thân JSON hỏng cú pháp | `400` |
> | Thân JSON lớn hơn 2 MB | `413` |
> | Ảnh tải lên lớn hơn 15 MB | `413` |
>
> Client đừng coi mọi `500` là máy chủ sập. Nếu nginx đứng trước với
> `client_max_body_size 16m` thì file trên 16 MB nhận `413` **dạng HTML** từ nginx,
> không phải JSON.

---

## 4. Route công khai

Không cần đăng nhập. Trang công khai chỉ gọi `GET /api/content`.

### `GET /api/health`

Máy chủ còn sống không, đang ở bản nội dung nào, phiên bản API nào.

```json
{"ok":true,"rev":36,"updatedAt":"2026-09-14T08:57:52.474Z","api":2}
```

| Trường | Ý nghĩa |
|---|---|
| `rev` | Số hiệu bản nội dung toàn trang = tổng `rev` các section + bộ đếm chi tiết khóa học. Đổi mỗi khi có bất cứ thứ gì hiển thị trên trang được ghi |
| `updatedAt` | Thời điểm ghi gần nhất (ISO 8601, UTC) |
| `api` | Phiên bản hợp đồng API |

### `GET /api/content`

Toàn bộ nội dung cả hai ngôn ngữ, đúng hình dạng mà component React đọc.

```json
{
  "rev": 36,
  "generatedAt": "2026-09-15T04:33:22.698Z",
  "updatedAt": "2026-09-14T08:57:52.474Z",
  "vi": { "nav": {…}, "hero": {…}, "pillars": {…}, "stats": {…}, "courses": {…},
          "facilities": {…}, "partners": {…}, "activities": {…}, "team": {…},
          "testimonials": {…}, "finalCta": {…}, "footer": {…} },
  "en": { … cùng khoá … }
}
```

**Header cache:**

```
ETag: W/"content-36"
Cache-Control: public, max-age=60, stale-while-revalidate=600
```

Gửi `If-None-Match: W/"content-36"` → `304 Not Modified`, không thân. ETag chỉ đổi khi
`rev` đổi. Admin lưu xong, trình duyệt có thể còn giữ bản cũ tối đa 60 giây.

**So với dữ liệu trong `PUT` section**, bản ráp này có thêm:

- `image: { url, width, height }` trên từng mục của `courses.items`, `facilities.items`,
  `activities.items`, `partners.items`, `team.members`, và trên chính `hero`. Mục chưa
  gắn ảnh thì **không có** khoá `image`.
- `courses.details`: object `{ idKhoaHoc: { overview?, knowledge?, skills?, curriculum?, audience?, sourceUrl?, viOnly? } }`.
  **Cố ý không đối xứng** giữa `vi` và `en` — khóa không có trang tiếng Anh thì thiếu
  hẳn mục hoặc mang `viOnly: true`.

### `GET /api/content/:locale`

Một ngôn ngữ. `:locale` là `vi` hoặc `en`.

```json
{"rev":36,"generatedAt":"2026-09-15T04:33:22.698Z","locale":"vi","content":{"nav":{"brandTagline":"Xưởng chế tạo số",…},…}}
```

ETag mang hậu tố ngôn ngữ (`W/"content-36-vi"`), `304` như trên. Ngôn ngữ lạ:

```json
{"error":"locale khong ton tai","locale":"fr"}          // 404
```

### `GET /media/:filename`

File ảnh. Tên file mang 8 ký tự đầu của sha256 nội dung (`team-hien.b0c6ac72.jpg`), nên
đổi ảnh là đổi URL:

```
Cache-Control: public, max-age=31536000, immutable
```

Tìm ở `DATA_DIR/media/` trước, rồi `dist/media/`. Không có thì **`404` thật** (không
rơi về trang HTML).

---

## 5. Đăng nhập — `/api/auth`

Chỉ có **một** tài khoản admin, tạo bằng `npm run admin:create`. Không có route tạo
tài khoản.

### `POST /api/auth/login`

Không kiểm `Origin`/CSRF (chưa có phiên để chống giả mạo). Bị giới hạn theo IP.

```json
{ "username": "admin", "password": "..." }
```

**200** — đặt cookie `fablab_admin` + `fablab_csrf`:

```json
{"authenticated":true,"username":"doc-test","csrfToken":"T3n6V-CUXzeQ5G4JX7jApUG5o1AgZhdq"}
```

| Mã | Thân |
|---|---|
| `400` | `{"error":"thieu ten dang nhap hoac mat khau"}` |
| `401` | `{"error":"ten dang nhap hoac mat khau khong dung"}` — cố ý không nói sai tên hay sai mật khẩu. Đang bị khoá thì thêm `"lockedSeconds": 8` |
| `429` | `{"error":"thu qua nhieu lan, doi mot lat"}` |

### `GET /api/auth/session`

Không yêu cầu đăng nhập — `authenticated: false` là câu trả lời hợp lệ.

```json
{"authenticated":false}
```

```json
{"authenticated":true,"username":"doc-test","csrfToken":"czyX5sPwms-ypV_6-QvYar6HLMgwRUoz"}
```

Khi đã đăng nhập: **cấp token CSRF mới** và thay cookie `fablab_csrf`. Đồng thời gia
hạn phiên.

### `POST /api/auth/logout`

Cần phiên + `Origin`. Không cần CSRF. Xoá phiên trong database và cả hai cookie.

```json
{"authenticated":false}
```

### `POST /api/auth/password`

Cần phiên + `Origin` + CSRF.

```json
{ "current": "mat khau hien tai", "next": "mat khau moi it nhat 12 ky tu" }
```

**200** — **đăng xuất mọi nơi**, kể cả phiên đang gọi:

```json
{"ok":true,"message":"da doi mat khau, dang nhap lai"}
```

| Mã | Thân |
|---|---|
| `400` | `{"error":"thieu mat khau hien tai hoac mat khau moi"}` |
| `400` | `{"error":"mat khau moi phai it nhat 12 ky tu"}` |
| `401` | `{"error":"mat khau hien tai khong dung"}` — **tính vào bộ đếm khoá tài khoản** |

---

## 6. Nội dung section — `/api/admin`

Mọi route trong mục này cần phiên; route ghi cần thêm `Origin` + CSRF.

### `GET /api/admin/sections`

Các section sửa được, **theo thứ tự xuất hiện trên trang**.

```json
{"editable":["nav","hero","pillars","stats","courses","facilities","partners","activities","team","testimonials","finalCta","footer"]}
```

### `GET /api/admin/content/:section`

Cặp hai ngôn ngữ của một section, kèm `rev` để gửi lại khi lưu.

```json
{
  "section": "team",
  "vi": { "eyebrow": "…", "title": "…", "members": [ { "id": "hien", "name": "…", … }, … ] },
  "en": { … },
  "rev": 10,
  "images": {
    "hien": { "mediaId": 44, "url": "/media/team-hien.b0c6ac72.jpg", "width": 240, "height": 240, "note": null },
    "huan": { "mediaId": 45, "url": "/media/team-huan.a8914598.jpg", "width": 240, "height": 240, "note": null }
  }
}
```

| Trường | Ý nghĩa |
|---|---|
| `vi`, `en` | Dữ liệu thô của section — **không** có khoá `image` (ảnh nằm ở `images`) |
| `rev` | Tổng `rev` của hai dòng VI + EN. **Mỗi lượt lưu tăng 2** |
| `images` | `null` nếu section không mang ảnh. Ngược lại là map `idMục → ảnh`; `hero` dùng khoá `"hero"`. `note` là ghi chú nguồn (`~` ảnh gần đúng, `↺` ảnh dùng lại) |

Section có ảnh: `hero`, `courses`, `facilities`, `activities`, `partners`, `team`.

Section không tồn tại: `404 {"error":"khong co section nay","section":"khong-co"}`.

### `PUT /api/admin/content/:section`

Ghi **cả hai ngôn ngữ** của một section, tuỳ chọn thay ảnh, trong một giao dịch.

```json
{
  "vi":  { …toàn bộ section tiếng Việt… },
  "en":  { …toàn bộ section tiếng Anh, CÙNG CẤU TRÚC… },
  "rev": 10,
  "note": "sửa chức danh",
  "images": { "tuan": 60, "hien": null }
}
```

| Trường | Bắt buộc | Ý nghĩa |
|---|---|---|
| `vi`, `en` | ✔ | Toàn bộ section (ghi đè, không phải vá từng phần). Hình dạng ở [mục 7](#7-hình-dạng-12-section) |
| `rev` | nên có | `rev` nhận từ `GET`. **Bỏ trống thì KHÔNG kiểm xung đột** — lượt lưu đè lên bất cứ thay đổi nào của người khác |
| `note` | | Ghi chú lịch sử, cắt ở 200 ký tự |
| `images` | | `{ idMục: idẢnh }` để gắn/thay, `{ idMục: null }` để gỡ. Mục không nhắc tới giữ nguyên ảnh. Chỉ dùng cho section có ảnh |

**Máy chủ xử lý theo đúng thứ tự**, dừng ở bước hỏng đầu tiên:

1. Section có schema không → `400`
2. `images` là object → `400`
3. `vi` và `en` đúng schema → `422` dạng *schema*
4. `vi` và `en` cùng cấu trúc khoá → `422` dạng *đối xứng*
5. Gửi `images` cho section không mang ảnh → `400`
6. `rev` khớp → `409`
6. Chép bản hiện tại (kèm ảnh) sang lịch sử
7. Ghi hai ngôn ngữ, áp `images` → `422` nếu mục/ảnh không tồn tại
8. **Mục vừa bị xoá trong lượt này** thì gỡ ảnh của nó (ảnh "mồ côi" có sẵn từ trước
   được giữ nguyên, có chủ đích)
9. Ráp lại toàn trang, chạy bộ ràng buộc, so với **kết quả chạy trước khi ghi** — chỉ
   **lỗi mới** mới chặn (`422` dạng *ràng buộc*, rollback toàn bộ), chỉ **cảnh báo
   mới** mới trả về

**200:**

```json
{"ok":true,"section":"testimonials","rev":4,"warnings":[]}
```

`warnings` là mảng chuỗi — ví dụ mục mới chưa có ảnh. Lượt lưu **đã thành công**;
cảnh báo chỉ để hiện cho người sửa.

**Lỗi:**

```json
// 400 — section không có schema
{"error":"section nay chua mo cho sua","section":"khong-co","editable":["nav","hero",…]}

// 400
{"error":"images phai la object { idMuc: idAnh | null }"}
{"error":"section nay khong co anh","section":"finalCta"}

// 409 — người khác (hoặc tab khác) đã lưu trước. GET lại rồi áp thay đổi lên bản mới.
{"error":"noi dung da bi nguoi khac sua","expectedRev":1,"currentRev":2}

// 422 dạng schema — mảng lỗi riêng cho từng ngôn ngữ, `path` tính từ gốc section
{"error":"noi dung khong hop le",
 "vi":[{"path":"items.0","message":"Khóa không được nhận dạng: \"extra\""}],
 "en":[{"path":"items.0.quote","message":"khong duoc de trong"}]}

// 422 dạng đối xứng — đường khoá có ở ngôn ngữ này mà thiếu ở ngôn ngữ kia
{"error":"hai ngon ngu khong cung cau truc",
 "missingInEn":["testimonials.items[id=t3].id","testimonials.items[id=t3].name",…],
 "missingInVi":[]}

// 422 dạng ràng buộc — luật cắt ngang section, kiểm trên toàn trang sau khi ghi
{"error":"noi dung vi pham rang buoc cua trang",
 "invariants":["vi activities.items[drone-soccer]: kind 'khong-co' khong co nhan trong activities.kinds",
               "vi activities.items[drone-soccer]: kind 'khong-co' khong khoi nao nhan -> roi vao khoi cuoi, sai cho",
               …]}

// 422 — ảnh
{"error":"gan anh cho muc khong ton tai","itemId":"x"}
{"error":"anh khong co trong thu vien","itemId":"tuan","mediaId":999}
```

### `GET /api/admin/history/:section`

20 dòng lịch sử gần nhất. **Mỗi lượt lưu sinh hai dòng** (một `vi`, một `en`) cùng
`saved_at` — tức khoảng 10 lượt lưu.

```json
{"section":"testimonials","entries":[
  {"id":14,"locale":"en","rev":1,"saved_at":"2026-09-15T04:33:24.208Z","note":"thu tai lieu API"},
  {"id":13,"locale":"vi","rev":1,"saved_at":"2026-09-15T04:33:24.208Z","note":"thu tai lieu API"}
]}
```

Mỗi dòng là **bản TRƯỚC khi lượt lưu đó ghi đè**; `rev` là `rev` của riêng ngôn ngữ đó
lúc ấy. Section không tồn tại thì `entries` rỗng (không `404`).

### `POST /api/admin/history/:id/restore`

Khôi phục bản lịch sử `:id` — dùng id của dòng `vi` hay `en` đều được, máy chủ luôn lấy
**cả hai ngôn ngữ** cùng thời điểm, và **cả ảnh** của section lúc đó. Không có thân,
không cần `rev`.

Khôi phục là một lượt lưu bình thường: tự tạo dòng lịch sử mới (ghi chú
`khoi phuc tu <thời điểm>`), chạy đủ bộ ràng buộc, có thể nhận `422`.

```json
{"ok":true,"rev":12,"warnings":[]}
```

| Mã | Thân |
|---|---|
| `404` | `{"error":"khong co ban ghi lich su nay"}` |
| `409` | `{"error":"ban lich su nay thieu mot ngon ngu, khong khoi phuc duoc"}` |

Ảnh đã bị xoá khỏi thư viện kể từ lúc đó thì mục đó để trống ảnh và có một dòng trong
`warnings`. Bản lịch sử có từ trước migration 002 không lưu ảnh → giữ ảnh hiện tại.

---

## 7. Hình dạng 12 section

Tóm tắt [server/schema/sections.js](../server/schema/sections.js). Luật chung:

- **Strict ở mọi cấp:** khoá thừa → `422` (`Khóa không được nhận dạng`). Khoá `image`
  **không được** gửi trong `vi`/`en` — ảnh đi qua trường `images`.
- **Chữ** (ký hiệu `chữ(N)` dưới đây): chuỗi, tự cắt khoảng trắng hai đầu, không rỗng,
  tối đa N ký tự.
- **`id`:** `^[a-z0-9][a-z0-9-]*$`. Là khoá tra ảnh, icon, neo menu — **không đổi sau
  khi tạo**, và phải giống hệt nhau giữa `vi` và `en`.
- **`href`:** `#`, `#neo`, `http(s)://…`, `mailto:…`, hoặc `tel:…`. Neo phải có thật trên
  trang (kiểm ở bước ràng buộc).
- Thứ tự phần tử mảng **là thứ tự hiển thị**.

### Trường dùng chung — phải bằng nhau giữa VI và EN

Trên mọi phần tử mảng có `id`, các trường sau không được dịch:
`group`, `level`, `stage`, `topic`, `icon`, `kind`, `kinds`, `value`, `suffix`, `lead`,
`href`, `filterable` — cộng thêm `team.members[].name`. Lệch → `422` dạng ràng buộc
(`truong khong dich nhung khac nhau`).

### nav

| Trường | Kiểu |
|---|---|
| `brandTagline` | chữ(80) |
| `cta`, `openMenu`, `closeMenu`, `switchLanguage` | chữ(40) |
| `links[]` (≥ 1) | **hoặc** link `{ id, label: chữ(60), href }` **hoặc** nhánh `{ id, label: chữ(60), children: [{ id, label: chữ(80), href }] (≥ 1) }` — không bao giờ có cả `href` lẫn `children` |

### hero *(có ảnh: khoá `"hero"`)*

| Trường | Kiểu |
|---|---|
| `eyebrow` | chữ(80) |
| `title` | chữ(120) |
| `description` | chữ(400) |
| `primaryCta`, `secondaryCta` | chữ(40) |
| `imageAlt` | chữ(200) |
| `floatingBadges[]` (≤ 4) | `{ id, label: chữ(40) }` |

### pillars

`eyebrow` chữ(80) · `title` chữ(120) · `description` chữ(400) ·
`items[]`: `{ id, title: chữ(80), description: chữ(400) }`.
`id` của mục tra icon; id không có icon thì component dùng icon theo vị trí.

### stats

`items[]` (≥ 1): `{ id, label: chữ(80), value, suffix }`

- `value`: **số nguyên** ≥ 0, ≤ 10⁹ — gửi chuỗi `"2400"` là `422`.
- `suffix`: chuỗi ≤ 4 ký tự, **được rỗng** (`"+"`, `"%"`, `""`).

### courses *(có ảnh: theo `items[].id`)*

| Trường | Kiểu |
|---|---|
| `eyebrow` | chữ(80) |
| `title` | chữ(120) |
| `description` | chữ(400) |
| `imageAlt` | chữ(200) |
| `cardCta`, `ageLabel`, `showMore`, `showLess` | chữ(40) |
| `emptyState` | chữ(200) |
| `filters` | `{ all: chữ(40), empty: chữ(200), stage: chữ(40), topic: chữ(40) }` |
| `modal` | `{ overview, knowledge, skills, curriculum, audience, register: chữ(60); source: chữ(80); close: chữ(40); empty, viOnly: chữ(200) }` |
| `levels` | object `{ idCapDo: chữ(40) }` |
| `groups[]` (≥ 1) | `{ id, title: chữ(120), description: chữ(400), filterable?: boolean }` |
| `stages[]` | `{ id, label: chữ(80), short: chữ(20) }` |
| `topics[]` | `{ id, label: chữ(80) }` |
| `items[]` | **một trong hai kiểu thẻ** (bảng dưới) |

| Kiểu thẻ | Trường |
|---|---|
| Cấp độ (nhóm `stem`) | `id`, `group`, `title: chữ(200)`, `description: chữ(600)`, `level`, `duration: chữ(80)`, `age: chữ(40)` |
| Cấp học (nhóm `experience`) | `id`, `group`, `title: chữ(200)`, `description: chữ(600)`, `stage`, `topic`, `icon` |

Không trộn trường của hai kiểu. `courses.details` **không** ghi qua route này — dùng
[mục 9](#9-popup-chi-tiết-khóa-học).

Ràng buộc: `group` phải có trong `groups`, `level` trong `levels`, `stage` trong
`stages`, `topic` trong `topics`, `icon` trong bảng icon khóa học (lấy danh sách ở
[`/meta`](#get-apiadminmeta) → `icons.course`).

### facilities *(có ảnh)*

`eyebrow` chữ(80) · `title` chữ(120) · `description` chữ(400) · `imageAlt` chữ(200) ·
`items[]`: `{ id, title: chữ(80), description: chữ(400) }`.

### partners *(có ảnh — không bắt buộc, thiếu thì hiện tên)*

`eyebrow` chữ(80) · `title` chữ(120) · `description` chữ(400) · `logoAlt` chữ(200) ·
`items[]`: `{ id, name: chữ(160) }`.

### activities *(có ảnh)*

| Trường | Kiểu |
|---|---|
| `eyebrow` | chữ(80) |
| `title` | chữ(120) |
| `description` | chữ(400) |
| `imageAlt` | chữ(200) |
| `previous`, `next`, `goTo` | chữ(60) |
| `kinds` | object `{ idLoai: chữ(40) }` — nhãn của từng loại |
| `groups[]` (≥ 1) | `{ id, title: chữ(120), description: chữ(400), kinds: [idLoai] }` |
| `items[]` | `{ id, title: chữ(200), description: chữ(600), date, kind }` |

- `date`: chuỗi ≤ 60 ký tự, **được rỗng** (vài hoạt động thật không có ngày).
- Khối chứa hoạt động suy từ `kind`: `kind` phải có nhãn trong `kinds` **và** phải nằm
  trong `kinds` của một khối nào đó.
- `groups[].id` sinh ra neo (`#competitions`, `#events`) mà menu trỏ tới — xoá khối đang
  được menu dùng là `422`.

### team *(có ảnh — thiếu thì hiện chữ cái đầu)*

`eyebrow` chữ(80) · `title` chữ(120) · `description` chữ(400) · `photoAlt` chữ(200) ·
`members[]` (≥ 1): `{ id, name: chữ(120), role: chữ(120), education: chữ(160), lead?: true }`

- `lead`: chỉ `true` hoặc **vắng hẳn** (gửi `false` là `422`). **Đúng một** người có `lead`.
- `name` giống hệt nhau giữa VI và EN.

### testimonials

`eyebrow` chữ(80) · `title` chữ(200) · `previous`, `next`, `goTo` chữ(80) ·
`items[]` (≥ 1): `{ id, quote: chữ(600), name: chữ(120), role: chữ(160) }`.

### finalCta

`title` chữ(120) · `description` chữ(400) · `primaryCta`, `secondaryCta` chữ(40).

### footer

| Trường | Kiểu |
|---|---|
| `description` | chữ(400) |
| `copyright` | chữ(200) |
| `columns[]` | `{ id, title: chữ(60), links: [{ id, label: chữ(80), href }] }` |
| `contact` | `{ title: chữ(60), address: chữ(200), email: chữ(120), phone: chữ(60) }` |
| `social` | `{ title: chữ(60), items: [{ id, label: chữ(80), href }] }` |

### Ràng buộc toàn trang (bước 9)

Kiểm trên bản đã ráp của **cả trang**, nên bắt được lỗi mà schema một section không
thấy. Danh sách đầy đủ ở [invariants.js](../server/content/invariants.js).

| Loại | Luật |
|---|---|
| Lỗi (chặn) | `id` trùng trong cùng mảng |
| Lỗi | Trường dùng chung khác nhau giữa VI/EN; tên thành viên khác nhau |
| Lỗi | `group` / `level` / `stage` / `topic` / `icon` của khóa học không tra được |
| Lỗi | `kind` hoạt động không có nhãn, hoặc không khối nào nhận |
| Lỗi | Không đúng một `lead` |
| Lỗi | `stats.items[].value` không phải số |
| Lỗi | `href` `#neo` trỏ tới neo không có trên trang (menu, footer) |
| Lỗi | Mục menu có cả `href` lẫn `children`, hoặc không có cả hai |
| Cảnh báo | Khóa học / thiết bị / hoạt động / hero chưa có ảnh (khung ảnh trống) |
| *(không báo)* | Đối tác / thành viên chưa có ảnh — trang có bản dự phòng (tên bằng chữ, chữ cái đầu) |
| Cảnh báo | Khóa học kiểu cấp độ không có icon tra theo `id` |

---

## 8. Thư viện ảnh

### `GET /api/admin/media`

Mọi ảnh, mới nhất trước, kèm nơi đang dùng.

```json
{"items":[
  {"id":60,"url":"/media/anh-thu.b31f757e.jpg","filename":"anh-thu.b31f757e.jpg",
   "mime":"image/jpeg","bytes":4077,"width":1600,"height":800,"origin":"upload",
   "sourceNote":"anh thu nghiem","createdAt":"2026-09-15T04:33:25.188Z",
   "usages":[{"scope":"team","itemId":"tuan","section":"team","label":"Đỗ Nguyễn Anh Tuấn"}]},
  …
]}
```

`origin`: `seed` (nạp lúc `npm run seed`) hoặc `upload`. `usages` rỗng = ảnh không ai
dùng, xoá được. `scope` `singleton` với `itemId` `logo` là logo trang, không thuộc
section nào.

### `POST /api/admin/media`

Tải **một** ảnh. Thân là **byte thô của file**, không phải `multipart/form-data`.

| Header | Giá trị |
|---|---|
| `Content-Type` | `image/jpeg`, `image/png` hoặc `image/webp` — phải đúng, máy chủ không đoán |
| `x-filename` | Tên file gốc, **đã `encodeURIComponent`** (chỉ để đặt tên file dễ đọc) |
| `x-csrf-token`, `Origin` | như mọi route ghi |

Tối đa **15 MB**, **50 triệu điểm ảnh**.

```bash
curl -s -b $JAR -H "$O" -H "x-csrf-token: $CSRF" \
  -H 'content-type: image/jpeg' \
  -H 'x-filename: anh%20th%E1%BB%AD.jpg' \
  --data-binary @anh-thu.jpg \
  $D/api/admin/media
```

Máy chủ xử lý trước khi lưu:

1. Xoay theo hướng EXIF.
2. Thu cạnh dài về **tối đa 1600 px** (không phóng to ảnh nhỏ).
3. **Xoá toàn bộ metadata** — EXIF, toạ độ GPS. Đã kiểm: ảnh gốc có EXIF, file lưu không còn.
4. PNG, và WebP có kênh trong suốt → **PNG**; còn lại → **JPEG** chất lượng 82.
5. Băm sha256 **bản đã xử lý**; tên file `<ten-khong-dau>.<8 ky tu bam>.<jpg|png>`.

**201** — ảnh mới:

```json
{"created":true,
 "item":{"id":60,"url":"/media/anh-thu.b31f757e.jpg","filename":"anh-thu.b31f757e.jpg","mime":"image/jpeg",
         "bytes":4077,"width":1600,"height":800,"origin":"upload","sourceNote":null,
         "createdAt":"2026-09-15T04:33:25.188Z","usages":[]},
 "original":{"bytes":17844}}
```

**200** — cùng nội dung đã có trong thư viện: trả **ảnh cũ**, `"created": false`, không
tạo bản sao.

| Mã | Thân |
|---|---|
| `415` | `{"error":"chi nhan anh JPEG, PNG, WebP (dat Content-Type dung kieu anh)"}` — sai `Content-Type` hoặc thân rỗng |
| `415` | `{"error":"file khong phai anh hop le, hoac qua nhieu diem anh"}` — đúng header nhưng byte không phải ảnh |
| `500` | `{"error":"loi may chu"}` — file lớn hơn 15 MB (xem [hạn chế](#3-mã-lỗi-chung)) |

Tải lên chỉ thêm ảnh vào thư viện. Muốn nó hiện trên trang thì gắn qua trường `images`
của [`PUT` section](#put-apiadmincontentsection).

### `PATCH /api/admin/media/:id`

Sửa ghi chú nguồn.

```json
{ "sourceNote": "Ảnh chụp tại FabLab, 03/2026" }
```

Chuỗi được cắt khoảng trắng, tối đa 300 ký tự; chuỗi rỗng hoặc `null` = xoá ghi chú.
Trả `{ "item": {…} }` như trên.

| Mã | Thân |
|---|---|
| `400` | `{"error":"can id anh va sourceNote (chuoi hoac null)"}` |
| `404` | `{"error":"khong co anh nay"}` |

### `DELETE /api/admin/media/:id`

Chỉ xoá được ảnh **không mục nào đang dùng**.

```json
{"ok":true}
```

```json
// 409 — gỡ ảnh khỏi các mục này trước
{"error":"anh dang duoc dung, go khoi cac muc truoc",
 "usages":[{"scope":"team","itemId":"tuan","section":"team","label":"Đỗ Nguyễn Anh Tuấn"}]}

// 404
{"error":"khong co anh nay"}
```

Xoá file ở `DATA_DIR/media/`; bản đã chép vào `public/media/` từ lần build trước được
giữ lại cho bản chạy offline.

---

## 9. Popup chi tiết khóa học

Nội dung popup (`courses.details`) lưu riêng, mỗi (khóa học, ngôn ngữ) có tới ba bản,
bản sau đè bản trước:

| Bản | Nguồn | Ghi qua API? |
|---|---|---|
| `scraped` | bóc từ trang khóa học của trường | không |
| `handwritten` | viết tay từ catalogue chính thức | không |
| `overridden` | admin sửa từ dashboard | **có — chỉ bản này** |

Nhờ vậy sửa từ dashboard không phá bản gốc; gỡ bản sửa là trang quay về bản gốc.

### `GET /api/admin/course-details/:id`

```json
{
  "courseId": "cnc",
  "exists": true,
  "vi": {
    "scraped": { "audience": "học sinh từ 16 – 18 tuổi", "overview": ["…"], "knowledge": ["…"], … },
    "handwritten": { "curriculum": ["…", "…", "…", "…"] },
    "overridden": null,
    "effective": { "curriculum": ["…"] },
    "overriddenAt": null
  },
  "en": { … cùng dạng … }
}
```

| Trường | Ý nghĩa |
|---|---|
| `exists` | Khóa học có trên trang không (có thể còn bản gốc của khóa đã xoá) |
| `effective` | Bản đang hiện trên trang = bản có thứ tự cao nhất đang có |
| `overriddenAt` | Thời điểm sửa gần nhất, `null` nếu chưa sửa |

`400 {"error":"id khoa hoc khong hop le"}` nếu id sai định dạng.

### `PUT /api/admin/course-details/:id`

**Bắt buộc gửi cả `vi` và `en`**. Mỗi khoá là object bản sửa, hoặc `null` để **gỡ bản
sửa** của ngôn ngữ đó.

```json
{
  "vi": { "curriculum": ["Buổi 1: giới thiệu", "Buổi 2: …"] },
  "en": null
}
```

Object bản sửa (strict, mọi trường tuỳ chọn):

| Trường | Kiểu |
|---|---|
| `overview`, `knowledge`, `skills`, `curriculum` | mảng ≤ 60 dòng, mỗi dòng chuỗi không rỗng ≤ 1000 ký tự |
| `audience` | chuỗi không rỗng ≤ 300 ký tự |
| `sourceUrl` | URL `http(s)` |
| `viOnly` | chỉ `true` |

Bản sửa **thay nguyên** bản gốc, không trộn từng trường: gửi `{ "curriculum": [...] }`
thì popup chỉ còn mục "Nội dung khóa học".

**200** — trả lại cấu trúc như `GET` cùng `rev` công khai mới:

```json
{"ok":true,"rev":43,"courseId":"cnc","vi":{…},"en":{…}}
```

| Mã | Thân |
|---|---|
| `400` | `{"error":"id khoa hoc khong hop le"}` |
| `400` | `{"error":"phai gui ca vi va en (null = go ban sua, quay ve ban goc)"}` |
| `404` | `{"error":"khong co khoa hoc nay tren trang","courseId":"khong-co"}` |
| `422` | `{"error":"noi dung khong hop le","vi":[{path,message}],"en":[…]}` |

Khác với `PUT` section, **có chủ đích**: không kiểm đối xứng VI/EN, không có `rev` gửi
lên, **không có lịch sử** (bản gốc luôn còn nên "khôi phục" là gửi `null`).

---

## 10. Meta cho dashboard

### `GET /api/admin/meta`

Số liệu trang Tổng quan và danh sách cho các ô chọn.

```json
{
  "rev": 44,
  "updatedAt": "2026-09-15T04:33:25.986Z",
  "sections": [
    {"key":"nav","updatedAt":"2026-09-10T17:19:01.625Z","counts":{"links":4},"hasImages":false},
    {"key":"hero","updatedAt":"2026-09-10T17:19:01.625Z","counts":{"floatingBadges":2},"hasImages":true},
    …
  ],
  "anchors": ["about","activities","competitions","contact", …],
  "icons": { "course": ["automation","plastics","process", …], "pillar": [ … ], "facility": [ … ] },
  "media": {"total":59,"bytes":4554327,"unused":0},
  "overriddenDetails": 0,
  "recent": [{"id":17,"key":"team","savedAt":"2026-09-15T04:33:25.986Z","note":"khoi phuc tu 2026-09-15T04:33:25.630Z"}, …],
  "warnings": []
}
```

| Trường | Ý nghĩa |
|---|---|
| `sections[].counts` | Số phần tử mỗi mảng cấp một (và `social.items`) |
| `anchors` | Mọi neo `#…` có thật trên trang — giá trị hợp lệ cho `href`. `null` nếu máy chủ không quét được mã nguồn |
| `icons` | Id icon có trong mã nguồn — giá trị hợp lệ cho `courses.items[].icon` |
| `media.unused` | Số ảnh không mục nào dùng |
| `overriddenDetails` | Số khóa học đang có bản sửa popup |
| `recent` | 10 lượt lưu gần nhất (mọi section) |
| `warnings` | Khác rỗng nghĩa là máy chủ **không quét được** `src/` — bộ kiểm href/icon đang tắt. Xem [DEPLOY.md](DEPLOY.md#3-vì-sao-cần-cả-repo-trên-máy-chủ-không-chỉ-dist) |

Neo và icon quét từ **cùng nguồn** với bộ ràng buộc chặn lượt lưu, nên giá trị lấy từ
đây không bao giờ bị máy chủ từ chối.

---

## 11. Ví dụ trọn luồng bằng curl

Sửa một cảm nhận, tải ảnh, gắn cho một thành viên, rồi xác nhận trang công khai đổi.
Cần [`jq`](https://jqlang.org/) (`sudo apt install jq`).

> **Chạy thử trên bản sao database**, đừng chạy trên dữ liệu thật — lịch sử và `rev`
> không quay lại được:
>
> ```bash
> sqlite3 data/fablab.db ".backup /tmp/fablab-thu/fablab.db"
> cp -r data/media /tmp/fablab-thu/media
> DATA_DIR=/tmp/fablab-thu PORT=3101 SITE_ORIGIN=http://127.0.0.1:3101 npm run server
> ```
>
> Nhớ rằng mỗi lần đăng nhập tính vào giới hạn **5 lượt / 15 phút**.

```bash
D=http://127.0.0.1:3101
O="Origin: $D"
JAR=cookies.txt

# 1. Dang nhap, lay CSRF
curl -s -c $JAR -H "$O" -H 'content-type: application/json' \
  -d '{"username":"admin","password":"..."}' $D/api/auth/login
CSRF=$(awk '$6=="fablab_csrf"{print $7}' $JAR)

# 2. Doc section va rev hien tai
curl -s -b $JAR $D/api/admin/content/testimonials > t.json
jq '.rev' t.json

# 3. Sua cam nhan dau tien o CA HAI ngon ngu, giu nguyen rev de chong ghi de
jq '{vi, en, rev, note: "sua cam nhan dau"}
    | .vi.items[0].quote += " (đã sửa)"
    | .en.items[0].quote += " (edited)"' t.json > put.json

curl -s -b $JAR -H "$O" -H "x-csrf-token: $CSRF" -X PUT \
  -H 'content-type: application/json' --data-binary @put.json \
  $D/api/admin/content/testimonials
# {"ok":true,"section":"testimonials","rev":4,"warnings":[]}

# 4. Tai anh len thu vien
MID=$(curl -s -b $JAR -H "$O" -H "x-csrf-token: $CSRF" \
  -H 'content-type: image/jpeg' -H 'x-filename: chan-dung.jpg' \
  --data-binary @chan-dung.jpg $D/api/admin/media | jq '.item.id')

# 5. Gan anh cho thanh vien 'tuan' — gui lai nguyen section team kem images
curl -s -b $JAR $D/api/admin/content/team \
  | jq --argjson m "$MID" '{vi, en, rev, images: {tuan: $m}}' > team.json
curl -s -b $JAR -H "$O" -H "x-csrf-token: $CSRF" -X PUT \
  -H 'content-type: application/json' --data-binary @team.json \
  $D/api/admin/content/team
# {"ok":true,"section":"team","rev":10,"warnings":[]}

# 6. Trang cong khai da thay doi
curl -s $D/api/content/vi | jq '.content.team.members[] | select(.id=="tuan") | .image'
# {"url":"/media/chan-dung.xxxxxxxx.jpg","width":…,"height":…}

# 7. Hoan tac lan gan anh bang lich su
HID=$(curl -s -b $JAR $D/api/admin/history/team | jq '.entries[0].id')
curl -s -b $JAR -H "$O" -H "x-csrf-token: $CSRF" -X POST $D/api/admin/history/$HID/restore
# {"ok":true,"rev":12,"warnings":[]}

# 8. Dang xuat
curl -s -b $JAR -H "$O" -X POST $D/api/auth/logout
```
