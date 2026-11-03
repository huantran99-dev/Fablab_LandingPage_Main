-- Sự kiện mẫu Halloween 2026 (bộ họa tiết mới `halloween`: dơi + bí ngô) cho database đã
-- có section `seasonal`. Database mới nhận mục này từ seed; database chưa có section thì hai
-- câu không khớp dòng nào.
--
-- Mục được tạo ĐANG TẮT (không có `enabled`) — trang không đổi gì cho tới khi admin bật.
-- Mỗi ngôn ngữ MỘT câu UPDATE thêm mục vào CUỐI danh sách → `rev` tăng đúng 2. Chốt theo
-- TỪNG ngôn ngữ (bài học 004): admin đã có mục id `halloween-2026` thì bỏ qua.
--
-- JSON là bản ĐÓNG BĂNG của mục đó trong `vi.seasonal` / `en.seasonal`, sinh bằng máy.

UPDATE section
   SET json = json_insert(json, '$.items[#]', json('{"id":"halloween-2026","name":"Halloween","popup":true,"start":"2026-10-25","end":"2026-11-01","title":"Halloween sáng tạo cùng EIU FabLab","body":"EIU FabLab chúc bạn một mùa Halloween thật vui. Cùng khám phá các chương trình trải nghiệm STEM và tự tay làm ra sản phẩm của riêng mình.","ctaAction":"link","ctaLabel":"Xem chương trình","href":"#courses-experience","colorPrimary":"#c2410c","colorSurface":"#fff7ed","colorDark":"#3b0764","colorAccent":"#7c3aed","motif":"halloween","fall":true}')),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'seasonal' AND locale = 'vi'
   AND json_type(json, '$.items') = 'array'
   AND NOT EXISTS (SELECT 1 FROM json_each(section.json, '$.items') v
                    WHERE json_extract(v.value, '$.id') = 'halloween-2026');

UPDATE section
   SET json = json_insert(json, '$.items[#]', json('{"id":"halloween-2026","name":"Halloween","popup":true,"start":"2026-10-25","end":"2026-11-01","title":"A creative Halloween with EIU FabLab","body":"EIU FabLab wishes you a fun Halloween. Explore our hands-on STEM programmes and make something of your very own.","ctaAction":"link","ctaLabel":"See programmes","href":"#courses-experience","colorPrimary":"#c2410c","colorSurface":"#fff7ed","colorDark":"#3b0764","colorAccent":"#7c3aed","motif":"halloween","fall":true}')),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'seasonal' AND locale = 'en'
   AND json_type(json, '$.items') = 'array'
   AND NOT EXISTS (SELECT 1 FROM json_each(section.json, '$.items') v
                    WHERE json_extract(v.value, '$.id') = 'halloween-2026');
