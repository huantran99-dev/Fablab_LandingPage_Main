-- Lược đồ ban đầu.
--
-- Nguyên tắc chia bảng: mỗi dòng là MỘT SECTION của MỘT NGÔN NGỮ, nội dung để
-- nguyên dạng JSON.
--
-- Không gộp cả từ điển vào một dòng: mỗi lần lưu sẽ thành đọc–sửa–ghi 38 KB, mỗi
-- dòng lịch sử cũng 38 KB, và một lỗi hợp lệ hoá ở footer sẽ chặn luôn việc lưu
-- hero. Cũng không chuẩn hoá quan hệ đầy đủ: `courses.items` là union phân biệt
-- theo `group` (nhóm STEM mang level/duration/age, nhóm trải nghiệm mang
-- stage/topic/icon) nên kiểu gì cũng phải có cột JSON — chỉ là sau khi đã trả giá
-- mười mấy bảng. Mảng JSON còn mang sẵn thứ tự, không sợ hạng trùng hay hổng.

CREATE TABLE section (
  locale     TEXT    NOT NULL CHECK (locale IN ('vi', 'en')),
  key        TEXT    NOT NULL,
  json       TEXT    NOT NULL,
  rev        INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT    NOT NULL,
  PRIMARY KEY (locale, key)
);

CREATE TABLE section_history (
  id       INTEGER PRIMARY KEY,
  locale   TEXT    NOT NULL,
  key      TEXT    NOT NULL,
  json     TEXT    NOT NULL,
  rev      INTEGER NOT NULL,
  saved_at TEXT    NOT NULL,
  note     TEXT
);

CREATE INDEX section_history_lookup ON section_history (locale, key, rev DESC);

-- `courses.details` để riêng, KHÔNG nằm trong dòng `section` của courses.
--
-- Hai lý do, cả hai đều là tính chất cố ý của dữ liệu: nhánh này bất đối xứng
-- giữa hai ngôn ngữ (khoá học không có trang tiếng Anh thì thiếu hẳn mục), và một
-- nửa của nó là file SINH RA từ bộ scraper. Tách ra là thứ cho phép bộ kiểm đối
-- xứng ở `content/parity.js` giữ được sự nghiêm ngặt của nó.
--
-- `source` phân biệt xuất xứ: chạy lại scraper chỉ được đụng vào 'scraped'.
CREATE TABLE course_detail (
  locale     TEXT NOT NULL CHECK (locale IN ('vi', 'en')),
  course_id  TEXT NOT NULL,
  source     TEXT NOT NULL CHECK (source IN ('scraped', 'handwritten', 'overridden')),
  json       TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (locale, course_id, source)
);

-- Tên file mang 8 ký tự đầu của sha256, đúng cơ chế chống cache mà Vite đang làm:
-- đổi ảnh là đổi tên file, nên không bao giờ phải xoá cache thủ công.
CREATE TABLE media (
  id          INTEGER PRIMARY KEY,
  filename    TEXT    NOT NULL UNIQUE,
  sha256      TEXT    NOT NULL UNIQUE,
  mime        TEXT    NOT NULL,
  bytes       INTEGER NOT NULL,
  width       INTEGER NOT NULL,
  height      INTEGER NOT NULL,
  kind        TEXT,
  origin      TEXT    NOT NULL CHECK (origin IN ('seed', 'upload')),
  source_note TEXT,
  created_at  TEXT    NOT NULL
);

-- Bản database của các map ảnh trong src/assets/images/index.js.
--
-- CỐ Ý KHÔNG CÓ CỘT NGÔN NGỮ: một mục một ảnh, nên hai bản dịch không thể hiện
-- hai ảnh khác nhau, và bộ kiểm đối xứng không phải đi canh chuyện đó. Ảnh được
-- ghép vào nội dung SAU khi kiểm đối xứng đã chạy.
-- `note` giữ các dấu `// ~` (ảnh thật của FabLab nhưng chụp hoạt động khác) và
-- `// ↺` (ảnh dùng lại của card khác) từ src/assets/images/index.js. Ghi chú mô tả
-- QUAN HỆ mục↔ảnh chứ không mô tả file, nên nó thuộc về đây chứ không phải `media`:
-- cùng một file có thể vừa đúng chủ đề cho mục này vừa chỉ gần đúng cho mục kia.
-- Đây là công sức thật của repo, đừng để rơi trong lúc di trú.
CREATE TABLE binding (
  scope    TEXT    NOT NULL,
  item_id  TEXT    NOT NULL,
  media_id INTEGER NOT NULL REFERENCES media (id) ON DELETE RESTRICT,
  note     TEXT,
  PRIMARY KEY (scope, item_id)
);

CREATE TABLE config (
  key        TEXT PRIMARY KEY,
  json       TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Đúng một tài khoản admin: CHECK (id = 1) làm điều đó thành ràng buộc của lược
-- đồ chứ không phải một quy ước ai đó phải nhớ.
CREATE TABLE admin_user (
  id            INTEGER PRIMARY KEY CHECK (id = 1),
  username      TEXT    NOT NULL,
  password_hash TEXT    NOT NULL,
  failed_count  INTEGER NOT NULL DEFAULT 0,
  locked_until  TEXT,
  updated_at    TEXT    NOT NULL
);

-- Chỉ lưu sha256 của token, không lưu token. Lộ database thì cũng không lấy được
-- phiên đang sống.
CREATE TABLE session (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_seen  TEXT NOT NULL,
  ip         TEXT,
  user_agent TEXT
);
