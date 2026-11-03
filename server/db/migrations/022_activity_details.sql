-- Popup "Xem chi tiết" của banner Cuộc thi (API 19): ba nhãn mới cho database đã seed.
--
-- Hai trường mới trên từng hoạt động (`details`, `link`) đều tuỳ chọn và VẮNG ở bản seed —
-- trang gốc không có nội dung dài cho cuộc thi, admin tự viết — nên không cần chèn gì cho chúng.
--
-- Mỗi ngôn ngữ một câu UPDATE (`rev` +1 mỗi câu → +2), chốt `viewDetails IS NULL` theo TỪNG
-- ngôn ngữ: admin đã tự đặt chữ thì giữ nguyên. Database chưa có section `activities` thì
-- không khớp dòng nào. Nguồn đăng ký vẫn là `events` (021) — không phải dựng lại bảng.

UPDATE section
   SET json = json_set(json, '$.viewDetails', 'Xem chi tiết',
                             '$.detailLink', 'Xem trang cuộc thi',
                             '$.closeDetails', 'Đóng'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'activities' AND locale = 'vi'
   AND json_extract(json, '$.viewDetails') IS NULL;

UPDATE section
   SET json = json_set(json, '$.viewDetails', 'View details',
                             '$.detailLink', 'Visit the competition page',
                             '$.closeDetails', 'Close'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'activities' AND locale = 'en'
   AND json_extract(json, '$.viewDetails') IS NULL;
