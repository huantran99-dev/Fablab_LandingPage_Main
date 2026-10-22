-- Thêm nhãn nút dừng/phát của banner tự chạy (`activities.pause` / `play`) vào database
-- đã có section `activities`. Database mới nhận chúng từ seed; trên database trống hai
-- câu dưới đây không khớp dòng nào nên là no-op.
--
-- Chỉ THÊM khi còn thiếu (`pause` vắng), theo TỪNG ngôn ngữ (bài học của 004) — không
-- đè chữ admin đã sửa. Chuỗi đóng băng từ `src/i18n/*.js`. `rev + 1` để bộ đệm và ETag
-- của người xem tự làm mới.

UPDATE section
   SET json = json_set(json,
         '$.pause', 'Tạm dừng trình chiếu',
         '$.play', 'Phát trình chiếu'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'activities' AND locale = 'vi'
   AND json_extract(json, '$.pause') IS NULL;

UPDATE section
   SET json = json_set(json,
         '$.pause', 'Pause slideshow',
         '$.play', 'Play slideshow'),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'activities' AND locale = 'en'
   AND json_extract(json, '$.pause') IS NULL;
