# Deploy FabLab EIU — Frontend + Backend

Hướng dẫn đưa trang công khai, dashboard quản trị và API lên **một VPS Linux chạy
nginx**. Viết cho người phụ trách máy chủ; chạy dự án trên máy lập trình thì xem
[README.md](../README.md), còn API thì xem [API.md](API.md).

> Mẫu cấu hình systemd và nginx dưới đây được soát theo đúng mã nguồn
> ([server/config.js](../server/config.js), [server/app.js](../server/app.js)), nhưng
> **chưa được chạy thử trên một VPS thật**. Lần đầu làm theo, hãy đi hết mục
> [8. Kiểm tra sau deploy](#8-kiểm-tra-sau-deploy) trước khi báo xong.

Trong tài liệu, `fablab.example.vn` là tên miền giả định — thay bằng tên miền thật.

---

## 1. Kiến trúc lúc chạy

```
 Trình duyệt ──HTTPS──▶ nginx :443 ──HTTP──▶ Node (Express) 127.0.0.1:3001
                        TLS, gzip,           ├─ /            dist/index.html  (trang công khai)
                        chuyển tiếp          ├─ /admin       dist/admin.html  (dashboard)
                                             ├─ /assets/*    dist/assets/     (JS/CSS có hash)
                                             ├─ /api/*       API nội dung, đăng nhập, ảnh
                                             └─ /media/*     DATA_DIR/media → dist/media
                                                  │
                                                  ▼
                                             DATA_DIR/fablab.db  (SQLite)
```

**Một tiến trình Node phục vụ tất cả**, nginx chỉ lo TLS và chuyển tiếp. Không để
nginx tự phục vụ `dist/`: header bảo mật (CSP, HSTS, `frame-ancestors`…) do `helmet`
đặt **trong Express**, nginx phục vụ tĩnh thì trang mất hết các header đó.

Frontend và backend **phải cùng một tên miền**. API không bật CORS, cookie đăng nhập
là `SameSite=Lax` và mọi request ghi bị kiểm `Origin` — tách dashboard sang tên miền
khác là không đăng nhập được. Xem thêm [mục 10](#10-chỉ-deploy-frontend).

### Cái gì nằm ở đâu

| Thứ | Vị trí khuyên dùng | Nguồn | Sao lưu? |
|---|---|---|---|
| Mã nguồn (cả repo) | `/srv/fablab` | `git clone` | không — đã có git |
| `dist/` | `/srv/fablab/dist` | `npm run build` sinh ra | không |
| `public/media/` | `/srv/fablab/public/media` | `prebuild` chép từ `DATA_DIR/media` | không |
| `src/content/snapshot.json` | trong repo | `prebuild` sinh ra, **có commit** | không |
| **Database** | `/var/lib/fablab/fablab.db` | nguồn sự thật, dashboard ghi vào | **CÓ** |
| **Ảnh tải lên** | `/var/lib/fablab/media/` | dashboard ghi vào | **CÓ** |
| Biến môi trường | `/etc/fablab.env` | tự tạo | nên |

Đặt dữ liệu **ngoài** thư mục mã: xoá repo, `git clean -fdx` hay clone lại sẽ không
kéo theo database.

---

## 2. Yêu cầu máy chủ

- Ubuntu 22.04 hoặc 24.04, tối thiểu 1 vCPU / 1 GB RAM (build Vite là bước nặng nhất).
- **Node.js 20** — `package.json` ghim `"engines": { "node": ">=20 <21" }`.
- nginx, certbot, git, và `sqlite3` (CLI, dùng để sao lưu).

```bash
sudo apt update
sudo apt install -y nginx git sqlite3 certbot python3-certbot-nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # phai la v20.x
```

`better-sqlite3` và `sharp` là **module biên dịch sẵn theo hệ điều hành + phiên bản
Node**. Luôn chạy `npm ci` trên chính VPS; **không bao giờ chép `node_modules` từ máy
Windows** sang.

> ⚠️ **Node 20 đã hết hạn hỗ trợ (04/2026).** Dự án vẫn chạy được, nhưng nên lên kế
> hoạch nâng lên Node 22 như một việc riêng: sửa `engines`, `npm ci` lại (sinh nhị
> phân mới cho `better-sqlite3`), chạy đủ bộ kiểm ở [mục 6](#6-deploy-lần-đầu). Đừng
> gộp việc nâng Node vào một lượt deploy bình thường.

---

## 3. Vì sao cần cả repo trên máy chủ, không chỉ `dist/`

Hai thứ trên máy chủ đọc mã nguồn **lúc chạy**:

1. **Bộ kiểm ràng buộc của dashboard** ([server/content/lookups.js](../server/content/lookups.js))
   quét `src/components/` và bảng icon để biết neo nào, icon nào có thật. Mỗi lượt
   lưu đều chạy nó. Thiếu `src/` thì máy chủ vẫn chạy, nhưng `GET /api/admin/meta`
   báo `warnings: ["Khong quet duoc ..."]` và **việc kiểm href/icon bị bỏ qua** — admin
   lưu được một link menu trỏ vào hư không.
2. **`npm run build`** chạy `prebuild` đọc database để xuất `snapshot.json` và đồng bộ ảnh.

Vì vậy deploy = clone cả repo và build ngay trên VPS.

---

## 4. Biến môi trường

Toàn bộ cấu hình nằm ở [server/config.js](../server/config.js). Không có biến nào là
bí mật — **mật khẩu admin không nằm trong biến môi trường** mà trong database (tạo
bằng `npm run admin:create`).

| Biến | Giá trị production | Mặc định | Đặt sai thì sao |
|---|---|---|---|
| `NODE_ENV` | `production` | *(trống)* | Cookie đăng nhập thiếu cờ `Secure` |
| `PORT` | `3001` | `3001` | Phải khớp `proxy_pass` của nginx |
| `DATA_DIR` | `/var/lib/fablab` | `<repo>/data` | Máy chủ mở database rỗng và thoát với `Database chua co noi dung` |
| `SITE_ORIGIN` | `https://fablab.example.vn` | `http://localhost:5173` | Request ghi bị `403 goc request khong hop le` ở trình duyệt không gửi `Sec-Fetch-Site` — **kể cả form đăng ký và thống kê** |
| `REGISTRATION_RETENTION_DAYS` | `365` | `365` | Số ngày giữ đăng ký khóa học (dữ liệu cá nhân) trước khi tự xoá. Đổi thì sửa luôn câu "lưu tối đa 12 tháng" ở dashboard → Form đăng ký |
| `ANALYTICS_RETENTION_DAYS` | `90` | `90` | Số ngày giữ sự kiện thống kê bản thô; quá hạn thì gộp theo ngày rồi xoá |
| `REG_DAILY_CAP` | `300` | `300` | Trần số đăng ký cả trang nhận trong một ngày; vượt thì form báo "tạm ngưng" kèm số điện thoại |

Ba biến sau cùng không bắt buộc — mặc định đã hợp lý.

Tạo **một file** dùng chung cho cả systemd lẫn các lệnh chạy tay:

```bash
sudo tee /etc/fablab.env >/dev/null <<'EOF'
NODE_ENV=production
PORT=3001
DATA_DIR=/var/lib/fablab
SITE_ORIGIN=https://fablab.example.vn
EOF
sudo chmod 644 /etc/fablab.env
```

Mỗi lần chạy lệnh `npm run ...` bằng tay trên VPS, nạp file này trước:

```bash
set -a; . /etc/fablab.env; set +a
```

> ⚠️ **Phải có HTTPS trước khi thử đăng nhập.** Với `NODE_ENV=production`, cookie
> phiên mang cờ `Secure`; truy cập bằng `http://` thì trình duyệt bỏ cookie đó, nên
> đăng nhập báo thành công rồi bị đá về trang đăng nhập ngay. Thêm nữa, `helmet` đặt
> `upgrade-insecure-requests` trong CSP, nên trang mở bằng `http://` sẽ đòi tải JS/CSS
> qua `https://` và vỡ giao diện.

---

## 5. Đưa dữ liệu lên máy chủ

Có hai đường. **Khuyên dùng đường 1.**

### Đường 1 — chép database đang dùng (khuyên dùng)

Database trên máy lập trình là **nguồn sự thật**: mọi thứ đã sửa qua dashboard, ảnh
đã tải lên, lịch sử, tài khoản admin đều ở đó.

Trên máy đang giữ dữ liệu (nên dừng `npm run server` trước, nhưng `.backup` vẫn an
toàn khi máy chủ đang chạy):

```bash
sqlite3 data/fablab.db ".backup fablab-deploy.db"
```

> Đừng dùng `cp`/`Copy-Item` cho file `.db` khi máy chủ có thể đang chạy. SQLite chạy
> chế độ WAL: phần ghi gần nhất nằm trong `fablab.db-wal`, chép riêng file `.db` là
> mất dữ liệu hoặc được file hỏng. `.backup` gom cả hai thành một file nhất quán.

Trên Windows mà không có `sqlite3`, dùng chính driver của dự án:

```bash
node -e "const D=require('better-sqlite3');new D('data/fablab.db',{readonly:true}).backup('fablab-deploy.db').then(()=>console.log('xong'))"
```

Rồi đưa lên VPS cùng thư mục ảnh:

```bash
scp fablab-deploy.db user@vps:/tmp/fablab.db
scp -r data/media user@vps:/tmp/media
# tren VPS:
sudo mv /tmp/fablab.db /var/lib/fablab/fablab.db
sudo mv /tmp/media /var/lib/fablab/media
sudo chown -R fablab:fablab /var/lib/fablab
```

Migration (`server/db/migrations/*.sql`) **tự chạy** mỗi lần máy chủ mở database, nên
database cũ hơn mã nguồn vẫn dùng được.

### Đường 2 — seed mới từ mã nguồn

Chỉ dùng khi muốn dựng lại từ đầu. **Mất mọi thứ đã sửa qua dashboard.**

```bash
set -a; . /etc/fablab.env; set +a
npm run seed          # tu choi neu database da co noi dung
npm run verify:seed   # phai in "identical"
npm run admin:create
```

---

## 6. Deploy lần đầu

Chạy theo đúng thứ tự.

**1. User và thư mục**

```bash
sudo useradd --system --create-home --home-dir /srv/fablab --shell /usr/sbin/nologin fablab
sudo mkdir -p /var/lib/fablab
sudo chown fablab:fablab /var/lib/fablab
```

**2. Mã nguồn và thư viện**

```bash
sudo -u fablab git clone <url-repo> /srv/fablab
cd /srv/fablab
sudo -u fablab git checkout main
sudo -u fablab npm ci
```

**3. Dữ liệu** — theo [mục 5](#5-đưa-dữ-liệu-lên-máy-chủ).

**4. Tài khoản admin** — bỏ qua nếu đã chép database có sẵn tài khoản.

```bash
sudo -u fablab bash -c 'set -a; . /etc/fablab.env; set +a; npm run admin:create'
```

Script hỏi trực tiếp tên đăng nhập và mật khẩu (≥ 12 ký tự), không đọc biến môi
trường. Chỉ có **đúng một** tài khoản; quên mật khẩu thì đặt lại bằng
`npm run admin:create -- --force`.

**5. Build**

```bash
sudo -u fablab bash -c 'set -a; . /etc/fablab.env; set +a; npm run build'
```

> **Bắt buộc nạp `DATA_DIR` trước khi build.** `prebuild` chạy với cờ
> `--if-available`: không thấy database thì nó chỉ cảnh báo rồi **giữ nguyên snapshot
> cũ** — build vẫn "thành công", nhưng bản dự phòng và ảnh offline không phải của
> database thật. Log đúng phải có dòng `snapshot -> rev ...` hoặc
> `snapshot khong doi (rev ...)`.

**6. Kiểm trước khi mở**

```bash
sudo -u fablab npm run check:content
sudo -u fablab npm run check:snapshot
```

Cả hai phải kết thúc không lỗi. Repo không có bộ test; hai lệnh này là thứ thay thế.

**7. Dịch vụ systemd** — `/etc/systemd/system/fablab.service`

```ini
[Unit]
Description=FabLab EIU landing page + API
After=network.target

[Service]
Type=simple
User=fablab
Group=fablab
WorkingDirectory=/srv/fablab
EnvironmentFile=/etc/fablab.env
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
RestartSec=3

# Gia co co ban
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now fablab
sudo systemctl status fablab
curl -s http://127.0.0.1:3001/api/health
```

Máy chủ **cố ý chỉ nghe `127.0.0.1`** ([server/index.js](../server/index.js)) — không
thể truy cập thẳng cổng 3001 từ ngoài, mọi thứ phải qua nginx.

> **Chỉ chạy MỘT tiến trình.** Nếu dùng PM2 thay systemd thì `instances: 1`, không bật
> cluster. SQLite chỉ có một người ghi; bộ giới hạn số lần đăng nhập nằm trong RAM của
> tiến trình, chạy nhiều bản là mỗi bản đếm riêng và kẻ dò mật khẩu được nhân số lần thử.

**8. nginx** — `/etc/nginx/sites-available/fablab`

Tạo bản HTTP trước, để certbot tự thêm phần HTTPS ở bước 9:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name fablab.example.vn;

    # Anh tai len toi da 15 MB; mac dinh cua nginx la 1 MB -> 413 kho hieu.
    client_max_body_size 16m;

    gzip on;
    gzip_proxied any;
    gzip_types application/json text/css application/javascript image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        # BAT BUOC — xem canh bao ben duoi.
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Thong ke truy cap: trang hua "khong luu IP", nhung log truy cap mac dinh cua
    # nginx ghi IP cua MOI request. Tat log rieng cho duong nay de loi hua con dung.
    location = /api/events {
        access_log off;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/fablab /etc/nginx/sites-enabled/fablab
sudo nginx -t && sudo systemctl reload nginx
```

> ⚠️ **Thiếu `X-Forwarded-For` là khoá cả thế giới.** Express đặt `trust proxy 1` và
> lấy IP người dùng từ header này. Thiếu nó, mọi request trông như đến từ
> `127.0.0.1`: bộ giới hạn đăng nhập (5 lượt / 15 phút / IP) gom tất cả vào một IP, nên
> vài lần gõ sai mật khẩu của **bất kỳ ai** là không ai đăng nhập được nữa — trong khi
> bộ giới hạn trông vẫn như chạy đúng.
>
> Header này còn quyết định hai thứ nữa: **form đăng ký** (5 lượt / 10 phút / IP — thiếu
> header thì người thứ sáu trong 10 phút, ở bất cứ đâu, nhận "gửi quá nhiều lần") và
> **thống kê** (khách được nhận diện theo IP + trình duyệt — thiếu header thì cả trang
> chỉ còn vài "khách" mỗi ngày).
>
> Ngược lại, **đừng** đặt thêm một proxy/CDN nữa phía trước nginx mà không sửa
> `trust proxy` — khi đó IP thật nằm sâu hơn một bậc.

**9. HTTPS**

```bash
sudo certbot --nginx -d fablab.example.vn --redirect
```

certbot thêm khối `listen 443 ssl` với chứng chỉ Let's Encrypt, chuyển 80 → 443 và
tự gia hạn. Kiểm tra gia hạn: `sudo certbot renew --dry-run`.

> Express gửi `Strict-Transport-Security: max-age=31536000; includeSubDomains`. Sau lần
> đầu mở bằng HTTPS, trình duyệt sẽ **từ chối** mở tên miền này — và mọi tên miền con
> của nó — bằng HTTP trong một năm. Đừng bật trang trên tên miền mà sau này định bỏ
> HTTPS.

**10. Kiểm tra** — theo [mục 8](#8-kiểm-tra-sau-deploy).

---

## 7. Cập nhật phiên bản

```bash
cd /srv/fablab
sudo -u fablab git checkout -- src/content/snapshot.json   # xem ghi chu 3
sudo -u fablab git pull
sudo -u fablab npm ci
sudo -u fablab bash -c 'set -a; . /etc/fablab.env; set +a; npm run seed:images'   # xem ghi chu 4
sudo -u fablab bash -c 'set -a; . /etc/fablab.env; set +a; npm run build'
sudo -u fablab npm run check:content
sudo -u fablab npm run check:snapshot
sudo systemctl restart fablab
curl -s http://127.0.0.1:3001/api/health
```

Bốn điều **đã từng gây sự cố thật** hoặc sẽ gây nếu bỏ qua:

1. **Luôn `restart` sau khi pull.** Node không tự nạp mã mới. Không restart thì trang
   và dashboard mới (đã build) nói chuyện với API cũ: không lưu được, không tải ảnh
   được, mọi lỗi trông như lỗi dashboard. Dashboard hiện băng đỏ **"Máy chủ đang chạy
   bản cũ"** khi `api` trong `/api/health` thấp hơn số nó cần.
2. **Build trước, restart sau.** [server/app.js](../server/app.js) chỉ gắn phần phục vụ
   `dist/` nếu thư mục đó **tồn tại lúc tiến trình khởi động**. Khởi động khi chưa có
   `dist/` rồi mới build thì `/` và `/admin` trả 404 cho tới lần restart kế.
3. **`snapshot.json` bị build sửa trên VPS.** `prebuild` ghi lại
   `src/content/snapshot.json` từ database, nên `git pull` lần sau có thể báo xung đột.
   Bản trên VPS luôn dựng lại được, nên bỏ nó đi trước khi pull là an toàn (lệnh đầu
   tiên ở trên). Bản commit trong git chỉ là dự phòng lúc build không có database.

4. **`seed:images` đưa ảnh của scope MỚI vào database đang chạy.** Migration SQL thêm
   được chữ nhưng không thêm được file ảnh — ví dụ section `equipment` (popup thông số
   máy) vào bằng migration 006, còn 12 ảnh máy vào bằng lệnh này. Lệnh chỉ điền scope
   **chưa có ảnh nào**, nên chạy mọi lần cập nhật đều an toàn: không gắn lại ảnh admin
   đã gỡ. Phải có `DATA_DIR` (nạp `/etc/fablab.env`), kẻo nó ghi vào `data/` trong repo.

Nếu `npm ci` báo lỗi biên dịch `better-sqlite3`: Node trên VPS không phải bản 20.

---

## 8. Kiểm tra sau deploy

Chạy từ máy bất kỳ:

```bash
D=https://fablab.example.vn

curl -s $D/api/health
# {"ok":true,"rev":60,"updatedAt":"...","api":7}

curl -sI $D/ | grep -iE '^(HTTP|content-security-policy|strict-transport-security)'
# HTTP/2 200 + ca hai header bao mat

curl -s -o /dev/null -w '%{http_code}\n' $D/media/khong-co.jpg
# 404  (khong phai 200 — 200 nghia la dang roi vao trang HTML)

curl -s $D/admin | grep -o '<title>[^<]*</title>'
# tieu de cua dashboard, KHONG phai tieu de trang cong khai

curl -s -o /dev/null -w '%{http_code}\n' $D/api/admin/meta
# 401
```

Rồi làm bằng trình duyệt:

- [ ] Trang công khai hiện đủ nội dung, đổi được VI/EN.
- [ ] `/admin` đăng nhập được và **vẫn còn đăng nhập sau khi tải lại trang**.
- [ ] Không có băng đỏ "Máy chủ đang chạy bản cũ".
- [ ] Tải một ảnh lên Thư viện ảnh (kiểm `client_max_body_size`).
- [ ] Sửa một chữ ở một section, **Lưu**: thanh dưới cùng của dashboard chuyển từ
      "Đang kiểm tra trang công khai…" sang **"Đã lên trang công khai"**; tải lại trang
      công khai (một lần) thấy đổi.
- [ ] `sudo journalctl -u fablab -n 50` không có lỗi.
- [ ] Cố ý đăng nhập sai một lần **từ máy khác**: log ghi
      `dang nhap that bai tu <IP thật>`, **không** phải `127.0.0.1`
      (kiểm `X-Forwarded-For`).
- [ ] Bấm "Đăng ký" trên trang công khai, gửi một lượt thử **với ghi chú "THỬ"**:
      màn hình "Đã nhận đăng ký!" hiện ra, dashboard có badge đỏ ở "Đăng ký khóa học"
      (trong vòng 2 phút, hoặc ngay khi chuyển lại tab). Xoá lượt thử đó trong
      dashboard.
- [ ] Dashboard → Thống kê truy cập có lượt xem của hôm nay.
- [ ] `sudo tail /var/log/nginx/access.log` **không** có dòng `/api/events`.

---

## 9. Sao lưu và khôi phục

Lịch sử trong dashboard **không phải** bản sao lưu — nó nằm trong cùng file database.
Mất ổ đĩa là mất cả hai.

### Sao lưu hằng ngày

`/usr/local/bin/fablab-backup`:

```bash
#!/usr/bin/env bash
set -euo pipefail
DATA=/var/lib/fablab
DEST=/var/backups/fablab
KEEP_DAYS=30
STAMP=$(date +%F)

mkdir -p "$DEST/db" "$DEST/media"
sqlite3 "$DATA/fablab.db" ".backup '$DEST/db/fablab-$STAMP.db'"
# Ten anh mang bam noi dung, khong bao gio ghi de -> rsync tang dan la du.
rsync -a "$DATA/media/" "$DEST/media/"
find "$DEST/db" -name 'fablab-*.db' -mtime +$KEEP_DAYS -delete
```

```bash
sudo chmod +x /usr/local/bin/fablab-backup
echo '30 2 * * * root /usr/local/bin/fablab-backup' | sudo tee /etc/cron.d/fablab-backup
```

Bản sao lưu trên cùng VPS chỉ chống lỗi thao tác, không chống mất máy. Nên đồng bộ
`/var/backups/fablab` ra một nơi khác (máy chủ khác, lưu trữ đám mây của trường).

`rsync` cố ý **không** có `--delete`: ảnh đã xoá khỏi thư viện vẫn còn trong bản sao
lưu, nên khôi phục một database cũ vẫn có đủ ảnh nó trỏ tới.

> ⚠️ **Bản sao lưu chứa dữ liệu cá nhân.** Từ khi có form đăng ký, database mang họ tên
> học sinh, tên và số điện thoại phụ huynh. Giữ `/var/backups/fablab` chỉ root đọc
> được (`sudo chmod 700 /var/backups/fablab`), và khi đồng bộ ra nơi khác thì nơi đó
> cũng phải hạn chế quyền như vậy. Một đăng ký đã xoá trong dashboard **vẫn còn** trong
> các bản sao lưu cũ cho tới khi chúng bị xoay vòng (`KEEP_DAYS`) — nếu có người yêu
> cầu xoá dữ liệu, ghi nhận rằng bản sao lưu sẽ tự hết hạn sau từng ấy ngày.

### Khôi phục

```bash
sudo systemctl stop fablab
sudo -u fablab cp /var/backups/fablab/db/fablab-2026-09-14.db /var/lib/fablab/fablab.db
sudo rm -f /var/lib/fablab/fablab.db-wal /var/lib/fablab/fablab.db-shm
sudo -u fablab rsync -a /var/backups/fablab/media/ /var/lib/fablab/media/
sudo systemctl start fablab
```

Xoá `-wal`/`-shm` là **bắt buộc**: để lại file WAL của database cũ bên cạnh file vừa
khôi phục thì SQLite sẽ áp nhầm nó vào.

Sau khi khôi phục, chạy lại build ([mục 7](#7-cập-nhật-phiên-bản)) để bản dự phòng
offline khớp database.

---

## 10. Chỉ deploy frontend

Có thể đưa riêng `dist/` lên bất kỳ hosting tĩnh nào (GitHub Pages, Netlify, thư mục
web của trường). Trang **vẫn đủ nội dung**: nó vẽ bằng `snapshot.json` đóng gói sẵn,
gọi `/api/content` thất bại thì im lặng giữ bản đó
([src/lib/contentStore.js](../src/lib/contentStore.js)).

```bash
npm run build     # tren may co database, de snapshot la ban moi nhat
# roi chep toan bo dist/ len hosting
```

Đổi lại mất: dashboard, cập nhật nội dung không cần build lại. Nội dung đứng ở thời
điểm build.

**Không hỗ trợ** frontend một tên miền, API một tên miền khác: không có CORS, cookie
`SameSite=Lax`, và kiểm `Origin` chỉ nhận `SITE_ORIGIN` — dashboard sẽ không đăng
nhập được. Muốn có dashboard thì dùng kiến trúc ở [mục 1](#1-kiến-trúc-lúc-chạy).

---

## 11. Xử lý sự cố

| Triệu chứng | Nguyên nhân thường gặp | Cách sửa |
|---|---|---|
| Dashboard băng đỏ "Máy chủ đang chạy bản cũ"; không lưu, không tải ảnh được | Pull + build xong nhưng chưa restart | `sudo systemctl restart fablab` |
| Đăng nhập báo thành công rồi về lại trang đăng nhập | Mở bằng `http://` khi `NODE_ENV=production` | Dùng HTTPS ([mục 6, bước 9](#6-deploy-lần-đầu)) |
| Giao diện vỡ, console báo chặn tải JS/CSS | Mở bằng `http://` (CSP `upgrade-insecure-requests`) | Như trên |
| Lưu trả `403 goc request khong hop le` | `SITE_ORIGIN` sai (thiếu `https://`, thừa `/` cuối, sai `www`) | Sửa `/etc/fablab.env`, restart |
| Lưu trả `403 thieu hoac sai CSRF token` | Mở dashboard ở hai tab, một tab đăng nhập lại | Tải lại tab |
| Vài lần sai mật khẩu, không ai đăng nhập được (`429`) | nginx thiếu `X-Forwarded-For` | Thêm header, `reload nginx`; chờ 15 phút |
| Tải ảnh báo "File quá lớn" (`413`) | File vượt `client_max_body_size` của nginx | Đặt `16m`; ảnh nguồn nên nhỏ hơn 15 MB |
| Tải ảnh 15–16 MB báo "File quá lớn" (`413` JSON) | Qua được nginx nhưng vượt giới hạn 15 MB của Express | Thu nhỏ ảnh trước khi tải (xem [API.md](API.md#3-mã-lỗi-chung)) |
| Form đăng ký báo "gửi nhiều lần liên tiếp" với người mới gửi lần đầu | nginx thiếu `X-Forwarded-For` — mọi người chung một IP | Thêm header, `reload nginx` |
| Form đăng ký báo "tạm ngưng nhận đăng ký" | Đã nhận đủ `REG_DAILY_CAP` lượt trong ngày — có thể đang bị spam | Xem danh sách đăng ký; nếu là spam, xoá và cân nhắc `limit_req` ở nginx. Log ghi `cham tran ... dang ky/ngay` |
| Thống kê chỉ có 1–2 "khách" mỗi ngày dù có nhiều người vào | nginx thiếu `X-Forwarded-For` | Như trên |
| Thống kê trống trơn, form vẫn gửi được | Trình duyệt bật Do Not Track / GPC hoặc trình chặn quảng cáo — hành vi đúng; hoặc `/api/events` bị chặn ở nginx | Thử bằng trình duyệt khác; `curl -X POST` tới `/api/events` phải ra `204` |
| `/` hoặc `/admin` trả 404 | Tiến trình khởi động trước khi có `dist/` | Build rồi restart |
| `/admin` hiện trang công khai | `dist/admin.html` không có (build lỗi giữa chừng) | Build lại, xem log |
| Dịch vụ thoát ngay, log `Database chua co noi dung` | `DATA_DIR` sai, hoặc chưa chép/seed database | Kiểm `/etc/fablab.env`, [mục 5](#5-đưa-dữ-liệu-lên-máy-chủ) |
| Log `SQLITE_READONLY` / `EACCES` | `/var/lib/fablab` không thuộc user `fablab` | `chown -R fablab:fablab /var/lib/fablab` |
| `npm ci` lỗi biên dịch `better-sqlite3` | Node không phải bản 20 | Cài Node 20 ([mục 2](#2-yêu-cầu-máy-chủ)) |
| Ảnh vỡ trên bản `dist/` mang đi nơi khác | Ảnh tải lên sau lần build cuối chưa được chép vào `dist/media` | Build lại |
| `meta.warnings` báo `Khong quet duoc ...` | Máy chủ thiếu `src/` | Deploy cả repo ([mục 3](#3-vì-sao-cần-cả-repo-trên-máy-chủ-không-chỉ-dist)) |
| Sửa xong trang công khai chưa đổi | Máy chủ chạy bản cũ (còn header `max-age=60`), hoặc có proxy/CDN cache `/api/content` | Chạy `curl -sI $D/api/content`: dòng `cache-control` phải là `no-cache`; khởi động lại máy chủ. Dashboard báo "Trang công khai chưa trả bản mới" là dấu hiệu của đúng lỗi này |
| Animation không chạy trên một máy | Máy đó bật giảm chuyển động (`prefers-reduced-motion`) | Không phải lỗi — hành vi đúng |
