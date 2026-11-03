-- Thư viện họa tiết tự tạo (section `motifs`, API 17) cho database ĐÃ seed.
--
-- Hai chốt như 004, đều bắt buộc:
--   * `WHERE EXISTS (SELECT 1 FROM section)`: database trống nhận section này từ seed.
--   * `NOT EXISTS (... key = 'motifs' AND locale = ...)`: chốt theo TỪNG ngôn ngữ — chốt
--     theo key thôi thì dòng `vi` vừa chèn làm câu `en` thấy "đã có".
--
-- Nội dung: chưa có ảnh nào, một họa tiết MẪU `tuyet-day` (tuyết có sẵn, mật độ 200%) không
-- gắn vào sự kiện nào — trang không đổi gì. Hai dòng mới cộng 2 vào SUM(section.rev).
--
-- JSON là bản ĐÓNG BĂNG của `vi.motifs` / `en.motifs`, sinh bằng máy.

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'vi', 'motifs', '{"shapes":[],"items":[{"id":"tuyet-day","name":"Tuyết dày (mẫu)","particles":[{"id":"snowflake","shape":"snowflake","weight":45,"sizeMin":11,"sizeMax":18},{"id":"snowdot","shape":"snowdot","weight":55,"sizeMin":5,"sizeMax":9}],"direction":"down","motion":"spin","speedMin":18,"speedMax":40,"sway":26,"density":200,"ornamentShape":"snowflake","ornamentCorner":"right","ornamentSize":16}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'motifs' AND locale = 'vi');

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'en', 'motifs', '{"shapes":[],"items":[{"id":"tuyet-day","name":"Heavy snow (sample)","particles":[{"id":"snowflake","shape":"snowflake","weight":45,"sizeMin":11,"sizeMax":18},{"id":"snowdot","shape":"snowdot","weight":55,"sizeMin":5,"sizeMax":9}],"direction":"down","motion":"spin","speedMin":18,"speedMax":40,"sway":26,"density":200,"ornamentShape":"snowflake","ornamentCorner":"right","ornamentSize":16}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'motifs' AND locale = 'en');
