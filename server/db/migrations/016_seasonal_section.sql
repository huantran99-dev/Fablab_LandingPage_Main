-- Section `seasonal` (Sự kiện mùa: popup quảng cáo + bảng màu cả trang theo Tết, Trung
-- Thu, Noel…) cho database ĐÃ seed. Database mới nhận section này từ seed.
--
-- Hai chốt, cùng lý do với 004, đều bắt buộc:
--   * `WHERE EXISTS (SELECT 1 FROM section)`: trên database trống migration chạy TRƯỚC
--     seed; chèn lúc đó thì seed từ chối chạy.
--   * `NOT EXISTS` theo TỪNG ngôn ngữ: chốt theo key thôi thì dòng `vi` vừa chèn làm
--     câu `en` thấy "đã có" và trang tiếng Anh thiếu section.
--
-- JSON là bản ĐÓNG BĂNG của `vi.seasonal` / `en.seasonal`, sinh bằng máy: ba sự kiện
-- MẪU đang TẮT (không có `enabled`) — trang không đổi gì cho tới khi admin bật một mục.
-- Hai dòng mới cộng thêm 2 vào SUM(section.rev). Kiểm: `rev` tăng đúng 2.

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'vi', 'seasonal', '{"close":"Đóng","dismiss":"Để sau","items":[{"id":"tet-2027","name":"Tết Nguyên Đán","popup":true,"start":"2027-01-28","end":"2027-02-14","title":"Chào Xuân Đinh Mùi 2027","body":"EIU FabLab chúc bạn và gia đình một năm mới an khang, nhiều ý tưởng mới. Bắt đầu năm mới bằng một khóa học sáng tạo cùng FabLab.","ctaAction":"register","ctaLabel":"Đăng ký khóa học","href":"#","colorPrimary":"#c8102e","colorSurface":"#fff3d6","colorDark":"#7a0c1e","colorAccent":"#e8a317"},{"id":"trung-thu-2027","name":"Tết Trung Thu","popup":true,"start":"2027-09-08","end":"2027-09-16","title":"Trung Thu vui tươi cùng EIU FabLab","body":"Chúc các bạn nhỏ một mùa trăng thật vui. Cùng xem các chương trình trải nghiệm STEM dành cho học sinh.","ctaAction":"link","ctaLabel":"Xem chương trình","href":"#courses-experience","colorPrimary":"#b34700","colorSurface":"#fff1dc","colorDark":"#3b2a5c","colorAccent":"#f2b134"},{"id":"noel-2026","name":"Giáng sinh","popup":true,"start":"2026-12-15","end":"2026-12-26","title":"Giáng sinh an lành","body":"EIU FabLab chúc bạn một mùa Giáng sinh ấm áp. Ghé xem những dự án được làm ra từ xưởng.","ctaAction":"link","ctaLabel":"Xem dự án","href":"#projects","colorPrimary":"#1f7a4d","colorSurface":"#eef7f0","colorDark":"#7f1d1d","colorAccent":"#c0392b"}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'seasonal' AND locale = 'vi');

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'en', 'seasonal', '{"close":"Close","dismiss":"Maybe later","items":[{"id":"tet-2027","name":"Lunar New Year","popup":true,"start":"2027-01-28","end":"2027-02-14","title":"Happy Lunar New Year 2027","body":"EIU FabLab wishes you and your family a peaceful new year full of fresh ideas. Start the year with a creative course at FabLab.","ctaAction":"register","ctaLabel":"Register for a course","href":"#","colorPrimary":"#c8102e","colorSurface":"#fff3d6","colorDark":"#7a0c1e","colorAccent":"#e8a317"},{"id":"trung-thu-2027","name":"Mid-Autumn Festival","popup":true,"start":"2027-09-08","end":"2027-09-16","title":"A joyful Mid-Autumn Festival with EIU FabLab","body":"Wishing every child a happy moon festival. Explore our hands-on STEM programmes for school students.","ctaAction":"link","ctaLabel":"See programmes","href":"#courses-experience","colorPrimary":"#b34700","colorSurface":"#fff1dc","colorDark":"#3b2a5c","colorAccent":"#f2b134"},{"id":"noel-2026","name":"Christmas","popup":true,"start":"2026-12-15","end":"2026-12-26","title":"Merry Christmas","body":"EIU FabLab wishes you a warm Christmas season. Take a look at the projects made in our workshop.","ctaAction":"link","ctaLabel":"See projects","href":"#projects","colorPrimary":"#1f7a4d","colorSurface":"#eef7f0","colorDark":"#7f1d1d","colorAccent":"#c0392b"}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'seasonal' AND locale = 'en');
