# Bàn giao — EIU FabLab Landing Page

Tài liệu cho **người tiếp quản mã nguồn**: hệ thống chạy thế nào, đang được deploy ra
sao, và làm gì khi cần cập nhật hay sửa lỗi. Viết cho người biết web cơ bản nhưng chưa
từng mở repo này.

Tài liệu này **tóm tắt rồi chỉ đường**, không chép lại chi tiết. Chi tiết nằm ở:

| File | Nội dung |
|---|---|
| [README.md](../README.md) | Tính năng, hệ thiết kế, nguồn gốc nội dung và ảnh |
| [CLAUDE.md](../CLAUDE.md) | Mọi cái bẫy đã gặp, quy ước bắt buộc. **Đọc trước khi sửa code** |
| [DEPLOY.md](DEPLOY.md) | Hướng dẫn deploy tổng quát (VPS tự lo HTTPS), sao lưu, bảng sự cố |
| [API.md](API.md) | Mọi route, xác thực, mã lỗi, phản hồi mẫu |

> **Thông tin máy chủ thật không ghi ở đây** vì repo này công khai. Trong tài liệu,
> `<VPS-IP>`, `<SSH-PORT>`, `<LOGIN-USER>`, `<PROXY-IP>` là chỗ trống. Giá trị thật
> nằm trong **"Phiếu thông tin máy chủ EIU FabLab"**, một tài liệu riêng do người bàn
> giao gửi trực tiếp. Mật khẩu không ghi ở đâu cả, chỉ bàn giao trực tiếp.

---

## 0. Ba điều sửa sai một lần là hỏng

1. **Nội dung KHÔNG nằm trong `src/i18n/*.js`.** Nguồn sự thật là database
   (`fablab.db`), sửa qua dashboard `/admin`. Hai file i18n chỉ còn dùng lúc
   `npm run seed` dựng database mới. Sửa chúng không đổi gì trên trang.
2. **Không thử nghiệm trên database thật.** Database có họ tên học sinh và số điện
   thoại phụ huynh; lịch sử và `rev` không quay lại được. Muốn thử thì chép ra rồi chạy
   `DATA_DIR=<thư-mục-bản-sao> npm run server`.
3. **`npm run build` đụng vào database.** Bước `prebuild` mở database qua `getDb()`,
   và việc đó **tự áp mọi migration mới**. Trên máy dev, khi chỉ muốn thử build, dùng
   `npx vite build --outDir <thư-mục-tạm>`.

---

## 1. Tổng quan

Trang giới thiệu FabLab EIU, song ngữ Việt / Anh, kèm dashboard quản trị để sửa nội
dung, nhận đăng ký và xem thống kê.

| Phần | Công nghệ |
|---|---|
| Giao diện | Vite 8, React 19, Tailwind CSS v4 (cấu hình trong CSS, không có `tailwind.config.js`) |
| Máy chủ | Node.js 20 (≥ 20.19), Express 5 |
| Dữ liệu | SQLite qua `better-sqlite3@11` (ghim bản 11 vì có nhị phân dựng sẵn cho Node 20) |
| Ảnh | `sharp` (xoay, thu nhỏ, bỏ EXIF) |
| Kiểm tra | `oxlint` + ba script `check:*` (repo không có bộ test) |

Vite dựng **hai entry độc lập**:
- `index.html`: trang công khai;
- `admin.html`: dashboard.

Người xem trang không tải byte nào của dashboard. Sau khi build, **một tiến trình Node**
phục vụ cả hai trang, API lẫn ảnh.

---

## 2. Luồng hệ thống

### 2.1 Đường đi của một request ở production

```
 Người xem (Internet)
     │  HTTPS
     ▼
 Proxy của trường  <PROXY-IP>            ← IT quản lý: chứng chỉ HTTPS, tên miền,
     │  HTTP, cổng 80                       giới hạn tải lên, theo dõi Uptime-Kuma
     │  + header X-Forwarded-For
     ▼
 VPS  <VPS-IP>
 ├─ ufw: cổng 80 chỉ nhận từ <PROXY-IP>; cổng <SSH-PORT> mở cho SSH
 ├─ nginx :80   (realip lấy IP thật từ X-Forwarded-For, client_max_body_size 41m)
 │     │  proxy_pass
 │     ▼
 └─ Node / Express  127.0.0.1:3001     (systemd: fablab.service, user fablabweb)
       ├─ /              dist/index.html     trang công khai
       ├─ /admin         dist/admin.html     dashboard
       ├─ /assets/*      dist/assets/        JS/CSS có hash, cache 1 năm, thiếu → 404
       ├─ /api/*         nội dung, đăng nhập, đăng ký, thống kê, quản trị
       └─ /media/*       /var/lib/fablab/media → dist/media, thiếu → 404
             │
             ▼
       /var/lib/fablab/fablab.db   (SQLite, chế độ WAL)
```

**Vì sao IP thật quan trọng.** Express dùng `trust proxy 1`
([server/app.js](../server/app.js)) để lấy IP người xem. Ba tính năng dựa vào IP này:
- giới hạn số lần đăng nhập sai;
- chống spam form đăng ký;
- đếm khách trong thống kê.

Nếu IP bị mất, mọi người xem trông như một người, và một người gõ sai mật khẩu vài lần
là khoá đăng nhập của tất cả.

Chuỗi đi như sau:
1. Proxy gửi `X-Forwarded-For: <IP người xem>`.
2. Module `realip` của nginx tin header đó **chỉ khi** request đến từ `<PROXY-IP>`, rồi
   đổi `$remote_addr` thành IP người xem.
3. `proxy_add_x_forwarded_for` gửi tiếp vào Node.
4. Express lấy giá trị **cuối cùng** trong header. Vì vậy một giá trị giả do người xem
   tự chèn vào đầu header bị bỏ qua.

Kiểm nhanh: `sudo tail /var/log/nginx/access.log` phải thấy IP người xem, không phải
`<PROXY-IP>`. Riêng các dòng có user agent `Uptime-Kuma` mang IP proxy: đó là IT đang
theo dõi trang mỗi phút.

### 2.2 Luồng nội dung (đọc)

```
 fablab.db ──▶ GET /api/content ──▶ contentStore ──▶ useT() trong component
                (ETag theo rev,       vẽ NGAY bằng snapshot.json đóng gói sẵn,
                 Cache-Control:       rồi thay nóng khi API trả về
                 no-cache)
```

- Trang **không bao giờ trắng**. Nếu API chết, nó vẫn vẽ bằng
  [snapshot.json](../src/content/snapshot.json), tức bản của lần build gần nhất.
- [contentStore.js](../src/lib/contentStore.js) bỏ qua phản hồi có cùng `rev` với bản
  đang có. Trang cũng tự hỏi lại khi người xem quay lại tab.
- Lúc nạp, `tieLastWords` ([typography.js](../src/lib/typography.js)) nối hai chữ cuối
  bằng dấu cách không ngắt, để dòng cuối không còn một chữ lẻ. Không chèn `&nbsp;` vào
  database.
- `rev` công khai bằng tổng `rev` của mọi section cộng với `content_counter`. Thêm
  bảng nội dung mới thì phải tăng bộ đếm này khi ghi, nếu không bản sửa không bao giờ
  lên trang.

### 2.3 Luồng ghi của dashboard

```
 Bản nháp trong trình duyệt (VI + EN + trường dùng chung)
   │  bấm Lưu (Ctrl S)
   ▼
 PUT /api/admin/content/:section   kèm rev đang có  ──(rev lệch)──▶ 409
   │
   ├─ kiểm phiên đăng nhập, Origin, CSRF token
   ├─ schema Zod strict ......................... server/schema/sections.js
   ├─ chép bản cũ vào lịch sử (kèm ảnh)
   ├─ ghi CẢ HAI ngôn ngữ trong MỘT giao dịch → rev +2
   ├─ ráp lại toàn bộ nội dung rồi chạy invariants  server/content/invariants.js
   │    chỉ LỖI MỚI so với trước lượt ghi mới chặn (rollback, 422)
   └─ commit
   ▼
 Dashboard đọc /api/content như người xem để xác nhận "Đã lên trang công khai"
 (src/admin/lib/publish.js)
```

- **Không có lượt ghi nào chỉ đụng một ngôn ngữ.** Nhờ vậy hai bản không thể lệch cấu
  trúc.
- Form của dashboard dựng từ dữ liệu mô tả
  ([descriptors.js](../src/admin/sections/descriptors.js)). Một khoá nội dung không có
  trong descriptor sẽ **mất ở lượt lưu sau**. `npm run check:admin` bắt lỗi này.
- Khôi phục từ lịch sử luôn lấy cả hai ngôn ngữ cùng thời điểm, và cả ảnh.

### 2.4 Luồng ảnh và video

```
 Tải lên (dashboard) ──▶ express.raw ──▶ ảnh: sharp xoay đúng chiều, cạnh dài 1600px,
                                              KHÔNG chép metadata (xoá GPS)
                                         video: chỉ MP4 H.264 ≤ 40 MB; hộp chứa GPS
                                              đổi tên thành `free` (server/media/video.js)
   ▼
 /var/lib/fablab/media/<băm>.jpg   + dòng trong bảng media
   ▼
 bảng binding (scope + id mục → ảnh)  ──▶  nội dung mang sẵn image: { url, width, height }
   ▼
 npm run build → prebuild chép media sang public/media → dist/media (bản offline tự đủ)
```

- Tên file mang mã băm, nên đổi ảnh là đổi URL và cache 1 năm vẫn an toàn.
- Giới hạn tải lên cộng dồn qua ba lớp: **proxy của trường**, nginx `41m`, và Express
  (ảnh 15 MB, video 40 MB). Lớp nhỏ nhất quyết định.

### 2.5 Đăng ký, form và thống kê

- Mọi nút "Đăng ký" mở chung một form. Có ba loại: thành viên (từ 16 tuổi), khóa học
  (cần phụ huynh), sự kiện (dưới 16 tuổi thì cần phụ huynh). Ngoài ra có form do admin
  tự tạo. Route ở [public.write.js](../server/routes/public.write.js).
- Route ghi công khai mount **trước** bộ đọc JSON chung và tự giới hạn cỡ thân. Chống
  spam bằng giới hạn theo IP, ô bẫy bot, thời gian điền tối thiểu, bỏ bản trùng và trần
  `REG_DAILY_CAP` mỗi ngày.
- **Dữ liệu cá nhân tự xoá sau 365 ngày** ([retention.js](../server/analytics/retention.js)).
  Đây là lời hứa "lưu tối đa 12 tháng" trên form. Mỗi đăng ký lưu nguyên văn câu đồng ý
  người gửi đã thấy.
- Thống kê **không lưu IP**. Khách được nhận diện bằng `sha256(muối của ngày | IP | UA)`,
  và muối cũ bị xoá, nên "khách" chỉ duy nhất trong một ngày. nginx tắt access log riêng
  cho `/api/events`. Trình duyệt bật DNT / GPC thì không bị đếm.
- Đăng ký và thống kê **không bao giờ đổi `rev` nội dung**.

### 2.6 Luồng build

```
 npm run build
   ├─ prebuild: server/scripts/export-snapshot.js --if-available
   │     mở DB (tự áp migration) → ghi src/content/snapshot.json → chép media → public/media
   └─ vite build → dist/index.html, dist/admin.html, dist/assets/*, dist/media/*
```

- Migration (`server/db/migrations/NNN_*.sql`) **tự chạy mỗi lần mở database**, cả lúc
  máy chủ khởi động lẫn lúc build.
- Nếu không thấy database (thiếu `DATA_DIR`), `prebuild` chỉ cảnh báo và **giữ snapshot
  cũ**. Build vẫn "thành công" nhưng không mang nội dung thật. Log đúng phải có dòng
  `snapshot -> rev ...` hoặc `snapshot khong doi`.
- Node chỉ gắn phần phục vụ `dist/` nếu thư mục đó **có sẵn lúc khởi động**. Vì vậy
  luôn build trước, restart sau.

---

## 3. Bản đồ mã nguồn

```
src/
├── components/      mỗi section một file; ui/ = Button · Pill · Section · Reveal (chốt chặn style)
├── admin/           dashboard: pages/, editor/ (bộ soạn chung), sections/descriptors.js
├── lib/             contentStore, pageSections (thứ tự + bật/tắt section), season, actions…
├── hooks/           useInView, useSlideshow, useActiveSection, useScrollLock…
├── i18n/            vi.js / en.js — CHỈ là corpus cho seed
├── content/         snapshot.json — sinh ra nhưng CÓ commit
└── assets/          icon SVG, ảnh nguồn của seed, logo
server/
├── index.js         file DUY NHẤT mở cổng (127.0.0.1)
├── app.js           lắp Express: helmet/CSP, thứ tự router, phục vụ dist
├── config.js        mọi biến môi trường
├── routes/          *.public.js · public.write.js · *.admin.js
├── schema/          Zod: nội dung (sections.js), đăng ký, bài gửi form
├── content/         ráp nội dung, invariants, ghi (mutate.js), cache
├── db/              index.js (MỌI truy cập DB đi qua đây) + migrations/
├── auth/            phiên (chỉ lưu sha256 token), mật khẩu, middleware CSRF/Origin
├── media/           xử lý ảnh, video
├── analytics/       ghi sự kiện, dọn dữ liệu quá hạn
└── scripts/         seed, check, snapshot, admin:create, images:*
docs/                DEPLOY.md · API.md · HANDOVER.md
```

| Lệnh | Khi nào dùng |
|---|---|
| `npm run dev` | Máy dev: trang + dashboard ở `localhost:5173`, chuyển `/api` sang 3001 |
| `npm run server` | Máy dev: API ở `127.0.0.1:3001`. Chạy song song với `dev` |
| `npm run build` | Dựng `dist/`, kèm `prebuild` (xem 2.6). Trên VPS: nạp env trước |
| `npm run lint` | oxlint |
| `npm run check:content` | Bất biến trên corpus seed: đối xứng VI/EN, href, icon, id… |
| `npm run check:snapshot` | Cùng bộ luật đó trên `snapshot.json` đã đóng gói |
| `npm run check:admin` | Form dashboard không làm rơi khoá nào của nội dung |
| `npm run seed` | Dựng database mới từ `src/i18n` (từ chối nếu đã có nội dung) |
| `npm run verify:seed` | Sau seed: phải in `identical` |
| `npm run seed:images` | Gắn ảnh cho scope **chưa có ảnh nào** (an toàn khi chạy lại) |
| `npm run images:replace -- <scope> [--missing]` | Thay ảnh của scope đã có ảnh, có lịch sử |
| `npm run admin:create [-- --force]` | Tạo / đặt lại tài khoản admin duy nhất (hỏi trực tiếp) |
| `npm run snapshot` | Chỉ xuất lại `snapshot.json` |

---

## 4. Môi trường production đang chạy

Deploy lần đầu ngày **2026-11-12**, thay trang WordPress cũ ở cùng tên miền. Trang cũ do
IT sao lưu và giữ.

### 4.1 Máy và tài khoản

| Thứ | Giá trị |
|---|---|
| Hệ điều hành | Ubuntu 24.04 LTS |
| Địa chỉ / cổng SSH | `<VPS-IP>` / `<SSH-PORT>` (mạng nội bộ trường) |
| Tài khoản đăng nhập | `<LOGIN-USER>`, có quyền `sudo` |
| Tài khoản chạy dịch vụ | `fablabweb`: system user, không đăng nhập được, home `/home/fablabweb` |
| Tên miền | `https://fablab.eiu.edu.vn` (HTTPS ở proxy của trường) |

Vào máy: `ssh -p <SSH-PORT> <LOGIN-USER>@<VPS-IP>`.

### 4.2 Thư mục và file cấu hình

| Thứ | Vị trí | Sao lưu? |
|---|---|---|
| Mã nguồn (cả repo, chủ `fablabweb`) | `/srv/fablab` | không (đã có git) |
| **Database** | `/var/lib/fablab/fablab.db` | **CÓ** |
| **Ảnh / video tải lên** | `/var/lib/fablab/media/` | **CÓ** |
| Biến môi trường | `/etc/fablab.env` | nên |
| Dịch vụ | `/etc/systemd/system/fablab.service` | — |
| nginx | `/etc/nginx/sites-available/fablab` (bật qua `sites-enabled/`; site `default` đã gỡ) | — |
| nginx realip | `/etc/nginx/conf.d/fablab-realip.conf` | — |
| Script sao lưu | `/usr/local/bin/fablab-backup`, cron ở `/etc/cron.d/fablab-backup` (02:30) | — |
| Bản sao lưu | `/var/backups/fablab/{db,media}` (chmod 700, giữ 30 ngày) | chép ra ngoài |

`/etc/fablab.env`:

```
NODE_ENV=production
PORT=3001
DATA_DIR=/var/lib/fablab
SITE_ORIGIN=https://fablab.eiu.edu.vn
```

Không biến nào là bí mật. Mật khẩu admin nằm trong database. Ý nghĩa từng biến và hậu
quả khi đặt sai: [DEPLOY.md mục 4](DEPLOY.md#4-biến-môi-trường).

### 4.3 Khác với DEPLOY.md ở đâu

[DEPLOY.md](DEPLOY.md) viết cho VPS **tự nhận HTTPS** từ Internet. Máy này đứng sau proxy,
nên có các điểm khác sau:

| | DEPLOY.md | Đang chạy |
|---|---|---|
| User dịch vụ | `fablab` | `fablabweb` (`fablab` trùng tên tài khoản đăng nhập) |
| HTTPS | certbot trên VPS | proxy của trường lo, **không có certbot** |
| `server_name` | tên miền | `_` (proxy gọi bằng IP) |
| IP người xem | lấy thẳng từ kết nối | `realip` tin `X-Forwarded-For` từ `<PROXY-IP>` |
| Tường lửa | không nói | `ufw`: cổng SSH + cổng 80 **chỉ từ `<PROXY-IP>`** |

Phần còn lại giống hệt DEPLOY.md: systemd unit (đổi `User` / `Group` thành
`fablabweb`), khối `location` của nginx, `client_max_body_size 41m`, tắt log
`/api/events`, script sao lưu.

`/etc/nginx/conf.d/fablab-realip.conf`:

```nginx
set_real_ip_from <PROXY-IP>;
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

Luật `ufw`, xem bằng `sudo ufw status`:

```
<SSH-PORT>/tcp   ALLOW   Anywhere
80/tcp           ALLOW   <PROXY-IP>
```

### 4.4 Ai lo việc gì

| Việc | Người lo |
|---|---|
| Chứng chỉ HTTPS, chuyển `http` → `https` | IT |
| Proxy, trỏ tên miền, giới hạn cỡ tải lên ở proxy | IT |
| Theo dõi trang sống / chết (Uptime-Kuma, mỗi phút) | IT |
| Cập nhật hệ điều hành, khởi động lại VPS, tường lửa | người phụ trách web (IT đã giao toàn quyền) |
| Mã nguồn, deploy, database, sao lưu | người phụ trách web |
| Nội dung trên trang | admin, qua dashboard |

**IT đổi IP proxy** thì phải sửa **hai chỗ**: `fablab-realip.conf` và luật `ufw` cổng 80.
Sửa thiếu `ufw` thì trang chết. Sửa thiếu `realip` thì mọi người xem thành một IP.

---

## 5. Deploy lần đầu trên một máy mới

Đây là đúng các bước đã chạy ngày 2026-11-12, rút gọn. Mỗi bước có giải thích ở
[DEPLOY.md](DEPLOY.md). Lệnh trên VPS chạy bằng tài khoản đăng nhập có `sudo`.

**1. Cập nhật máy và cài phần mềm**

```bash
sudo apt update && sudo apt upgrade -y && sudo reboot
sudo apt install -y nginx git sqlite3 rsync build-essential python3
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v          # phai la v20.19 tro len
```

Không dùng gói `nodejs` có sẵn của Ubuntu (quá cũ cho Vite 8). Không chạy
`do-release-upgrade`.

**2. User dịch vụ, thư mục, mã nguồn, thư viện**

```bash
sudo useradd --system --create-home --home-dir /home/fablabweb --shell /usr/sbin/nologin fablabweb
sudo mkdir -p /srv/fablab /var/lib/fablab
sudo chown fablabweb:fablabweb /srv/fablab /var/lib/fablab
sudo -u fablabweb git clone https://github.com/huantran99-dev/Fablab_LandingPage_Main.git /srv/fablab
cd /srv/fablab
sudo -u fablabweb npm ci          # KHONG nap /etc/fablab.env truoc lenh nay
```

Nếu nạp env trước `npm ci`, `NODE_ENV=production` khiến npm bỏ qua devDependencies,
và bước build sau đó báo `vite: not found`.

**3. Dữ liệu.** Chép database đang dùng, đừng seed mới (seed mới mất mọi thứ đã sửa
qua dashboard). Trên máy đang giữ dữ liệu (PowerShell, trong thư mục repo):

```powershell
node -e "const D=require('better-sqlite3');new D('data/fablab.db',{readonly:true}).backup('../fablab-deploy.db').then(()=>console.log('xong'))"
scp -P <SSH-PORT> ..\fablab-deploy.db <LOGIN-USER>@<VPS-IP>:/tmp/fablab.db
scp -P <SSH-PORT> -r data\media <LOGIN-USER>@<VPS-IP>:/tmp/media
Remove-Item ..\fablab-deploy.db   # co du lieu ca nhan
```

Trên VPS:

```bash
sudo mv /tmp/fablab.db /var/lib/fablab/fablab.db
sudo mv /tmp/media /var/lib/fablab/media
sudo chown -R fablabweb:fablabweb /var/lib/fablab
```

Lưu ý ba điều:
- Dùng `.backup`, không chép file `.db` trực tiếp. Database chạy chế độ WAL, chép thẳng
  có thể mất phần ghi gần nhất.
- Chỉ chép hai thứ trên. **Không** chép cả `data/`: trong đó còn `fablab.before-014.db`
  và các file `-wal` / `-shm`.
- `scp` nhận cổng bằng `-P` viết hoa.

Muốn chuyển từ một VPS cũ sang VPS mới thì làm y như vậy, lấy bản sao lưu mới nhất ở
`/var/backups/fablab` của máy cũ.

**4. Cấu hình và build**

```bash
sudo tee /etc/fablab.env >/dev/null <<'EOF'
NODE_ENV=production
PORT=3001
DATA_DIR=/var/lib/fablab
SITE_ORIGIN=https://fablab.eiu.edu.vn
EOF
sudo -u fablabweb bash -c 'set -a; . /etc/fablab.env; set +a; npm run build'
sudo -u fablabweb npm run check:content     # phai: KET QUA: DAT
sudo -u fablabweb npm run check:snapshot    # phai: KET QUA: DAT
```

**5. Dịch vụ systemd.** Dùng unit ở [DEPLOY.md mục 6 bước 7](DEPLOY.md#6-deploy-lần-đầu),
với `User=fablabweb` và `Group=fablabweb`.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now fablab
curl -s http://127.0.0.1:3001/api/health     # {"ok":true,...,"api":24}
```

Chỉ chạy **một** tiến trình, không chạy cluster: SQLite chỉ có một người ghi, và bộ giới
hạn đăng nhập nằm trong RAM của tiến trình.

**6. nginx.** Dùng cấu hình ở [DEPLOY.md mục 6 bước 8](DEPLOY.md#6-deploy-lần-đầu), với
`server_name _;`. Tạo `fablab-realip.conf` như mục 4.3 ở trên, rồi:

```bash
sudo ln -s /etc/nginx/sites-available/fablab /etc/nginx/sites-enabled/fablab
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Mở `http://<VPS-IP>/api/health` từ máy trong mạng trường phải thấy `{"ok":true`.
**Đừng thử trang chính hay đăng nhập qua `http://`**:
- CSP có `upgrade-insecure-requests`, nên giao diện vỡ;
- cookie phiên mang cờ `Secure`, nên đăng nhập không giữ được.

Đó là hành vi đúng, không phải lỗi.

**7. Nhờ IT nối proxy.** Gửi IT các yêu cầu sau:
- chuyển tiếp tên miền tới `http://<VPS-IP>:80`;
- gửi kèm `X-Forwarded-For`;
- cho tải lên tối đa 41 MB;
- chuyển `http` → `https`;
- không cache, không sửa header của trang;
- cho biết IP nội bộ của proxy.

**8. Tường lửa.** Phải mở cổng SSH **trước** khi bật:

```bash
sudo ufw allow <SSH-PORT>/tcp
sudo ufw allow from <PROXY-IP> to any port 80 proto tcp
sudo ufw enable
```

Giữ cửa sổ SSH đang mở, mở thêm một phiên SSH mới để thử. Vào không được thì chạy
`sudo ufw disable` ở cửa sổ cũ.

**9. Sao lưu hằng đêm.** Dùng script ở [DEPLOY.md mục 9](DEPLOY.md#9-sao-lưu-và-khôi-phục),
rồi chạy:

```bash
sudo chmod +x /usr/local/bin/fablab-backup
sudo mkdir -p /var/backups/fablab && sudo chmod 700 /var/backups/fablab
echo '30 2 * * * root /usr/local/bin/fablab-backup' | sudo tee /etc/cron.d/fablab-backup
sudo /usr/local/bin/fablab-backup && sudo ls /var/backups/fablab/db
```

**10. Kiểm sau deploy.** Làm hết danh sách ở [DEPLOY.md mục 8](DEPLOY.md#8-kiểm-tra-sau-deploy),
cộng thêm bốn điểm riêng của mô hình proxy:

- [ ] `access.log` ghi IP người xem, không phải `<PROXY-IP>` (thử bằng điện thoại 4G).
- [ ] `/admin` đăng nhập xong, tải lại trang vẫn còn đăng nhập.
- [ ] Tải lên một ảnh khoảng 5 MB và một video MP4 khoảng 20 MB. Báo `413` thì giới hạn
      của proxy đang nhỏ hơn 41 MB: nhờ IT nâng.
- [ ] Từ một máy khác trong mạng trường (không phải proxy), `http://<VPS-IP>` **không**
      vào được. Đó là dấu hiệu `ufw` đang chặn đúng.

---

## 6. Cập nhật phiên bản

Chỉ cần khi **mã nguồn** đổi. Sửa nội dung qua dashboard thì không phải làm gì.

```bash
cd /srv/fablab
sudo /usr/local/bin/fablab-backup
sudo -u fablabweb git checkout -- src/content/snapshot.json   # build tren VPS da sua file nay
sudo -u fablabweb git pull
sudo -u fablabweb npm ci
sudo -u fablabweb bash -c 'set -a; . /etc/fablab.env; set +a; npm run seed:images'
sudo -u fablabweb bash -c 'set -a; . /etc/fablab.env; set +a; npm run build'
sudo -u fablabweb npm run check:content
sudo -u fablabweb npm run check:snapshot
sudo systemctl restart fablab
curl -s http://127.0.0.1:3001/api/health
```

Trước khi pull, **đọc các commit và migration mới**
(`git log HEAD..origin/main`, rồi xem `server/db/migrations/`).
- Migration tự chạy ở bước build, trên database thật, và không có nút hoàn tác. Bản sao
  lưu ở dòng thứ hai của khối lệnh là đường lui duy nhất.
- Có commit yêu cầu thêm lệnh, ví dụ `images:replace -- activity --missing`. Lệnh đó
  luôn được ghi trong CLAUDE.md hoặc mô tả PR.

Quy tắc:
- **Build trước, restart sau.**
- **Luôn restart sau khi pull**, vì Node không tự nạp mã mới. Nếu quên, dashboard hiện
  băng đỏ "Máy chủ đang chạy bản cũ": `API_VERSION`
  ([content.public.js](../server/routes/content.public.js)) thấp hơn `EXPECTED_API`
  ([src/admin/App.jsx](../src/admin/App.jsx)).
- Đổi hợp đồng API mà dashboard dựa vào thì **tăng cả hai số** và sửa
  [API.md](API.md) trong cùng commit.

---

## 7. Vận hành

**Xem log**

```bash
sudo systemctl status fablab
sudo journalctl -u fablab -n 50 --no-pager      # log cua Node
sudo tail -n 30 /var/log/nginx/error.log
sudo grep -v Uptime-Kuma /var/log/nginx/access.log | tail -n 20
```

Bot thường xuyên gọi các đường dẫn cũ của WordPress (`/en/courses/...`, `/wp-login.php`…).
Những đường dẫn đó rơi về trang chủ mới với mã 200. Không có gì để lo.

**Hằng tháng:** chạy `sudo /usr/local/bin/fablab-backup`, rồi
`sudo apt update && sudo apt upgrade -y`. Khi đăng nhập thấy
`*** System restart required ***` thì `sudo reboot`. Trang tự chạy lại nhờ systemd.

**Sao lưu ra khỏi VPS.** Bản sao lưu trên VPS chỉ chống lỗi thao tác. Hỏng cả máy là mất
hết. Nên định kỳ chép `/var/backups/fablab` về một nơi khác, có hạn chế quyền, vì bản
sao lưu chứa dữ liệu cá nhân. Lệnh khôi phục:
[DEPLOY.md mục 9](DEPLOY.md#9-sao-lưu-và-khôi-phục). Phải xoá `fablab.db-wal` /
`fablab.db-shm` trước khi khởi động lại.

**Tài khoản admin.** Hệ thống chỉ có đúng một tài khoản.
- Đổi mật khẩu trong dashboard (màn Tài khoản). Việc này đăng xuất mọi nơi.
- Quên mật khẩu thì chạy
  `sudo -u fablabweb bash -c 'set -a; . /etc/fablab.env; set +a; npm run admin:create -- --force'`.

**Khi đổi người phụ trách:**
- đổi mật khẩu SSH (`passwd`) và mật khẩu admin;
- gỡ khoá SSH cũ khỏi `~/.ssh/authorized_keys`;
- cập nhật Phiếu thông tin máy chủ.

**Dữ liệu cá nhân:**
- Người gửi yêu cầu xoá thì xoá trong dashboard. Bản ghi vẫn còn trong các bản sao lưu
  cũ tới khi chúng hết hạn (30 ngày).
- Đổi `REGISTRATION_RETENTION_DAYS` thì phải sửa câu "lưu tối đa 12 tháng" trên form.

---

## 8. Phát triển tiếp

**Máy dev:**
- `npm install`, rồi chép một bản database về `data/` (hoặc `npm run seed` +
  `npm run admin:create`).
- Mở hai terminal: `npm run server` và `npm run dev`.

**Trước khi commit**, chạy bốn lệnh sau. Repo không có bộ test, nên chúng là thứ thay
thế:

```bash
npm run lint && npm run check:content && npm run check:snapshot && npm run check:admin
```

**Quy ước bắt buộc.** Danh sách đầy đủ và lý do nằm trong [CLAUDE.md](../CLAUDE.md).
Năm điều hay vấp nhất:
- Chữ hiển thị đi qua `useT()`, không viết cứng trong component.
- Mọi nút đi qua `ui/Button.jsx`, mọi nhãn qua `ui/Pill.jsx`, mọi section qua
  `ui/Section.jsx`. Nút không bao giờ có shadow.
- Không đưa tên class Tailwind vào dữ liệu: Tailwind chỉ sinh CSS cho chữ có trong mã
  nguồn.
- `body` dùng `overflow-x: clip`, không dùng `hidden`: `hidden` làm hỏng navbar sticky.
- Mọi truy cập `localStorage` bọc `try/catch`.

**Thêm hoặc đổi nội dung có cấu trúc (khoá mới, section mới):**
1. Schema Zod ở [server/schema/sections.js](../server/schema/sections.js). Không có
   schema thì không ghi được.
2. Descriptor của dashboard ở [descriptors.js](../src/admin/sections/descriptors.js).
   Trường dịch hay trường dùng chung phải khớp `SHARED_FIELDS` trong
   [invariants.js](../server/content/invariants.js).
3. Corpus seed `src/i18n/vi.js` và `en.js`, cùng cấu trúc.
4. **Migration** đưa dữ liệu vào database đang chạy (`server/db/migrations/NNN_*.sql`):
   - chốt `WHERE EXISTS (SELECT 1 FROM section)`;
   - chốt **theo từng ngôn ngữ**;
   - không sửa migration cũ;
   - thử trên bản sao database: `rev` phải tăng đúng 2 cho mỗi section bị sửa, và chạy
     lại lần hai không đổi gì.
5. Thêm section vào trang thì sửa cả `PAGE_SECTIONS`
   ([pageSections.js](../src/lib/pageSections.js)), `COMPONENTS` trong
   [App.jsx](../src/App.jsx), `TOGGLEABLE_SECTIONS` ở
   [server/schema/sections.js](../server/schema/sections.js), `sectionAnchors`. Chi
   tiết ở CLAUDE.md, mục "Hướng trượt hiện tại".
6. Ảnh không vào được bằng migration SQL. Dùng `seed:images` hoặc `images:replace`
   ([image-sources.js](../server/scripts/image-sources.js)).

**Thử trên máy dev mà không đụng dữ liệu thật:**
- Chép `data/fablab.db` (dùng `.backup`) và `data/media` sang một thư mục tạm.
- Chạy `DATA_DIR=<thư-mục-tạm> PORT=3999 npm run server`.
- Dùng một vite config riêng trỏ proxy sang cổng 3999.

Chụp ảnh và đo trang bằng puppeteer: xem CLAUDE.md, mục "Giới hạn của agent".

---

## 9. Sự cố thường gặp

Bảng đầy đủ ở [DEPLOY.md mục 11](DEPLOY.md#11-xử-lý-sự-cố). Các dòng dưới đây là riêng
của mô hình proxy, hoặc hay gặp nhất:

| Triệu chứng | Nguyên nhân | Cách sửa |
|---|---|---|
| Trang báo `502 Bad Gateway` | Node chết hoặc đang khởi động | `sudo systemctl restart fablab`, xem `journalctl` |
| Băng đỏ "Máy chủ đang chạy bản cũ" | Pull + build nhưng chưa restart | `sudo systemctl restart fablab` |
| Trang không vào được sau khi bật `ufw` / IT đổi proxy | Luật cổng 80 không khớp IP proxy | `sudo ufw status`; thêm luật cho IP mới |
| `access.log` chỉ còn IP proxy; đăng nhập bị khoá `429` dù chỉ sai vài lần | `realip` sai IP proxy, hoặc proxy không gửi `X-Forwarded-For` | Sửa `fablab-realip.conf`, `nginx -t`, reload; hỏi IT về header |
| Tải ảnh / video báo "File quá lớn" (`413`) dưới 41 MB | Giới hạn ở proxy của trường | Nhờ IT nâng lên 41 MB |
| Đăng nhập thành công rồi bị đá ra | Đang mở bằng `http://` (cookie `Secure`) | Dùng `https://fablab.eiu.edu.vn` |
| Lưu báo `403 goc request khong hop le` | `SITE_ORIGIN` sai | Sửa `/etc/fablab.env`, restart |
| Dịch vụ thoát ngay: `Database chua co noi dung` | `DATA_DIR` sai hoặc chưa chép database | Kiểm env, mục 5 bước 3 |
| `SQLITE_READONLY` / `EACCES` | `/var/lib/fablab` không thuộc `fablabweb` | `sudo chown -R fablabweb:fablabweb /var/lib/fablab` |
| `npm run build` báo `vite: not found` | `npm ci` chạy khi đã nạp env | Chạy lại `sudo -u fablabweb npm ci` không nạp env |
| Animation không chạy trên một máy | Máy đó bật giảm chuyển động | Không phải lỗi |

Khi cần nhờ người khác xem, gửi kết quả của `journalctl -u fablab -n 50` và
`tail /var/log/nginx/error.log`. **Không bao giờ gửi mật khẩu, file `.db` hay bản sao lưu**.

---

## 10. Việc còn mở và nợ kỹ thuật

Tình trạng lúc bàn giao (2026-11-12).

**Nội dung, sửa bằng dashboard:**
- [ ] Footer: link YouTube và "Website EIU" vẫn là `#`.
- [ ] Số liệu (20.000+ · 30+ · 12.000+ · 20+), email, điện thoại, địa chỉ: chưa xác nhận
      với FabLab.
- [ ] 3 cảm nhận học viên là nội dung hư cấu, đang ẩn. Giữ ẩn tới khi có cảm nhận thật.
- [ ] Sự kiện mùa Noel 2026 có bật "Hiện ngay" để thử. Tắt nếu chưa tới mùa.
- [ ] Bản tiếng Anh của 30 chương trình trải nghiệm là bản dịch của dự án. Nên nhờ trường
      duyệt.
- [ ] Xác nhận quyền dùng ảnh có người, nhất là ảnh có trẻ em.

**Kỹ thuật:**
- [ ] **Node 20 đã hết hạn hỗ trợ (04/2026).** Nâng lên Node 22 thành một việc riêng:
      sửa `engines`, `npm ci` lại để có nhị phân `better-sqlite3` mới, chạy đủ bộ kiểm.
- [ ] Chưa đo giới hạn tải lên của proxy với video khoảng 20 MB.
- [ ] Thiếu ảnh chân dung của một thành viên (`phuong`), đang hiện avatar chữ cái.
      Không lấp bằng ảnh người khác.
- [ ] 7 logo đối tác chưa nén (khoảng 1,9 MB).
- [ ] `courseDetails.*.js` còn 15 mục mồ côi (file sinh ra, đừng sửa tay).
- [ ] Sao lưu mới chỉ nằm trên VPS. Cần một nơi lưu ngoài máy.
