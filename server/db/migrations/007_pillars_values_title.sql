-- Thêm `pillars.valuesTitle` (tiêu đề cột "Giá trị cốt lõi" của khối chia đôi Tầm nhìn
-- | Giá trị) vào database đã có section `pillars`. Database mới nhận nó từ seed; trên
-- database trống hai câu dưới đây không khớp dòng nào nên là no-op.
--
-- Không sửa 005 để gộp vào: database nào đã ghi nhận 005 sẽ không chạy lại nó.
-- Chỉ THÊM khi còn thiếu, theo TỪNG ngôn ngữ (bài học của 004) — không đè chữ admin
-- đã sửa. Chuỗi đóng băng từ `src/i18n/*.js` lúc viết migration. `rev + 1` để bộ
-- đệm và ETag của người xem tự làm mới.

UPDATE section
   SET json = json_set(json, '$.valuesTitle', 'Giá trị cốt lõi'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'pillars' AND locale = 'vi'
   AND json_extract(json, '$.valuesTitle') IS NULL;

UPDATE section
   SET json = json_set(json, '$.valuesTitle', 'Core values'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'pillars' AND locale = 'en'
   AND json_extract(json, '$.valuesTitle') IS NULL;
