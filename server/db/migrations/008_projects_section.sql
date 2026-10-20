-- Section `projects` (Dự án) cho database ĐÃ seed, kèm mục menu và footer trỏ tới nó.
-- Database mới nhận cả ba từ seed; trên database trống mọi câu dưới đây là no-op.
--
-- 1. Chèn section — hai chốt như 004: `EXISTS (SELECT 1 FROM section)` (migration chạy
--    trước seed trên database trống) và `NOT EXISTS` THEO TỪNG NGÔN NGỮ.
-- 2. Chèn "Dự án" vào nhánh FabLab của menu (sau "Thiết bị") và cột "Khám phá" của
--    footer (sau "Thiết bị") bằng SQL JSON — KHÔNG ghi đè cả section, vì admin có thể
--    đã sửa menu/footer. Mảng con dựng lại bằng json_group_array(... ORDER BY o): mục
--    cũ ở vị trí chẵn 2k, mục mới ở 2k+1 ngay sau "facilities" (không có thì cuối).
--    Chỉ chạy khi có nhánh/cột đích và chưa có mục `projects`; admin đã đổi cấu trúc
--    thì bỏ qua — thêm tay trong dashboard.
--
-- JSON đóng băng, sinh bằng máy từ `src/i18n/*.js`. Ảnh dự án KHÔNG đi đường này:
-- chạy `npm run seed:images` (scope `project` chưa có ảnh nào nên được điền).

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'vi', 'projects', '{"eyebrow":"Dự án","title":"Sản phẩm làm ra từ xưởng","description":"Những mô hình và sản phẩm được thiết kế, chế tạo tại FabLab EIU — từ học cụ STEM tới robot và mô hình y tế.","imageAlt":"Ảnh dự án {title}","statuses":{"ongoing":"Đang thực hiện","done":"Đã hoàn thành"},"items":[{"id":"cobot","title":"Mô hình Cobot","description":"Cobot là mô hình robot đa chức năng nhằm thực hiện các tác vụ hỗ trợ con người (vận chuyển, giám sát an ninh,…) ở nơi công cộng."},{"id":"plane","title":"Mô hình máy bay","description":"Mô hình máy bay được thiết kế đơn giản, dễ dàng lắp ráp và áp dụng vào trong lớp học STEM."},{"id":"microbit-kit","title":"Bộ kit micro:bit mở rộng","description":"Giúp học sinh tiếp cận công nghệ, lập trình, thúc đẩy các hoạt động nghiên cứu khoa học kĩ thuật cho sinh viên."},{"id":"jaw-model","title":"Mô hình xương hàm cho phẫu thuật nha","description":"Mô hình xương sọ thực hiện bằng phương pháp in 3D giúp hỗ trợ cho bác sĩ làm thí nghiệm trong phẫu thuật tạo hình."},{"id":"smart-light","title":"Đèn thông minh","description":"Đèn thay đổi màu sắc, độ sáng bằng nút nhấn, qua điện thoại hoặc để đèn chạy tự động bật nếu có người trong điều kiện ánh sáng yếu."},{"id":"refraction-model","title":"Mô hình khúc xạ ánh sáng","description":"Mô hình học cụ vật lý ứng dụng vào chương trình trải nghiệm Quang học trong chuỗi chương trình trải nghiệm STEM của STEM Lab."},{"id":"mcr-racing-car","title":"Xe đua MCR – EIU","description":"Mô hình xe đua MCR giúp sinh viên nâng cao kiến thức chuyên ngành thông qua sản phẩm."},{"id":"hydroponic-garden","title":"Vườn thủy canh","description":"Mô hình trồng rau thủy canh có các chức năng tự động như hẹn giờ phun sương, điều khiển từ xa, đèn mô phỏng ánh sáng mặt trời, bón phân theo lịch trình hay cảm biến."}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'projects' AND locale = 'vi');

UPDATE section
   SET json = json_set(json, '$.links[' || (SELECT p.key FROM json_each(section.json, '$.links') p WHERE json_extract(p.value, '$.id') = 'fablab') || '].children',
         (SELECT json_group_array(json(v) ORDER BY o) FROM (
            SELECT c.value AS v, c.key * 2 AS o FROM json_each(section.json, '$.links[' || (SELECT p.key FROM json_each(section.json, '$.links') p WHERE json_extract(p.value, '$.id') = 'fablab') || '].children') c
            UNION ALL
            SELECT '{"id":"projects","label":"Dự án","href":"#projects"}',
                   COALESCE((SELECT c.key * 2 + 1 FROM json_each(section.json, '$.links[' || (SELECT p.key FROM json_each(section.json, '$.links') p WHERE json_extract(p.value, '$.id') = 'fablab') || '].children') c
                              WHERE json_extract(c.value, '$.id') = 'facilities'), 1000000)
         ))),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'nav' AND locale = 'vi'
   AND EXISTS (SELECT 1 FROM json_each(section.json, '$.links') p WHERE json_extract(p.value, '$.id') = 'fablab')
   AND NOT EXISTS (SELECT 1 FROM json_each(section.json, '$.links') p, json_each(p.value, '$.children') c
                    WHERE json_extract(c.value, '$.id') = 'projects');

UPDATE section
   SET json = json_set(json, '$.columns[' || (SELECT p.key FROM json_each(section.json, '$.columns') p WHERE json_extract(p.value, '$.id') = 'explore') || '].links',
         (SELECT json_group_array(json(v) ORDER BY o) FROM (
            SELECT c.value AS v, c.key * 2 AS o FROM json_each(section.json, '$.columns[' || (SELECT p.key FROM json_each(section.json, '$.columns') p WHERE json_extract(p.value, '$.id') = 'explore') || '].links') c
            UNION ALL
            SELECT '{"id":"projects","label":"Dự án","href":"#projects"}',
                   COALESCE((SELECT c.key * 2 + 1 FROM json_each(section.json, '$.columns[' || (SELECT p.key FROM json_each(section.json, '$.columns') p WHERE json_extract(p.value, '$.id') = 'explore') || '].links') c
                              WHERE json_extract(c.value, '$.id') = 'facilities'), 1000000)
         ))),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'footer' AND locale = 'vi'
   AND EXISTS (SELECT 1 FROM json_each(section.json, '$.columns') p WHERE json_extract(p.value, '$.id') = 'explore')
   AND NOT EXISTS (SELECT 1 FROM json_each(section.json, '$.columns') p, json_each(p.value, '$.links') c
                    WHERE json_extract(c.value, '$.id') = 'projects');

INSERT INTO section (locale, key, json, rev, updated_at)
SELECT 'en', 'projects', '{"eyebrow":"Projects","title":"Made in our workshop","description":"Models and products designed and built at FabLab EIU — from STEM teaching kits to robots and medical models.","imageAlt":"Photo of the {title} project","statuses":{"ongoing":"In progress","done":"Completed"},"items":[{"id":"cobot","title":"Cobot","description":"Cobot is a multifunctional robot that supports people in public areas with tasks such as delivery and security."},{"id":"plane","title":"Plane model","description":"The aircraft model is designed to be simple, easy to assemble and easy to use in STEM classes."},{"id":"microbit-kit","title":"Micro:bit starter kit","description":"Helps students access technology and programming, and promotes scientific and technical research activities among students."},{"id":"jaw-model","title":"Skull model for surgery","description":"A skull model made by 3D printing so that doctors can practise before operating on a real patient."},{"id":"smart-light","title":"Micro:bit smart light","description":"The light changes colour and brightness with a push button or from a phone, or turns on automatically when someone is present in low light."},{"id":"refraction-model","title":"Physics training kit","description":"A physics teaching kit for the Laser & Fibre Optics STEM class that shows the refraction of light."},{"id":"mcr-racing-car","title":"EIU – MCR racing car","description":"Racing car models help students improve their specialised knowledge."},{"id":"hydroponic-garden","title":"Hydroponic garden","description":"The hydroponic growing model has automatic functions such as a misting timer, remote control, lights that simulate sunlight, scheduled fertilisation and a pH sensor."}]}', 1, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE EXISTS (SELECT 1 FROM section)
   AND NOT EXISTS (SELECT 1 FROM section WHERE key = 'projects' AND locale = 'en');

UPDATE section
   SET json = json_set(json, '$.links[' || (SELECT p.key FROM json_each(section.json, '$.links') p WHERE json_extract(p.value, '$.id') = 'fablab') || '].children',
         (SELECT json_group_array(json(v) ORDER BY o) FROM (
            SELECT c.value AS v, c.key * 2 AS o FROM json_each(section.json, '$.links[' || (SELECT p.key FROM json_each(section.json, '$.links') p WHERE json_extract(p.value, '$.id') = 'fablab') || '].children') c
            UNION ALL
            SELECT '{"id":"projects","label":"Projects","href":"#projects"}',
                   COALESCE((SELECT c.key * 2 + 1 FROM json_each(section.json, '$.links[' || (SELECT p.key FROM json_each(section.json, '$.links') p WHERE json_extract(p.value, '$.id') = 'fablab') || '].children') c
                              WHERE json_extract(c.value, '$.id') = 'facilities'), 1000000)
         ))),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'nav' AND locale = 'en'
   AND EXISTS (SELECT 1 FROM json_each(section.json, '$.links') p WHERE json_extract(p.value, '$.id') = 'fablab')
   AND NOT EXISTS (SELECT 1 FROM json_each(section.json, '$.links') p, json_each(p.value, '$.children') c
                    WHERE json_extract(c.value, '$.id') = 'projects');

UPDATE section
   SET json = json_set(json, '$.columns[' || (SELECT p.key FROM json_each(section.json, '$.columns') p WHERE json_extract(p.value, '$.id') = 'explore') || '].links',
         (SELECT json_group_array(json(v) ORDER BY o) FROM (
            SELECT c.value AS v, c.key * 2 AS o FROM json_each(section.json, '$.columns[' || (SELECT p.key FROM json_each(section.json, '$.columns') p WHERE json_extract(p.value, '$.id') = 'explore') || '].links') c
            UNION ALL
            SELECT '{"id":"projects","label":"Projects","href":"#projects"}',
                   COALESCE((SELECT c.key * 2 + 1 FROM json_each(section.json, '$.columns[' || (SELECT p.key FROM json_each(section.json, '$.columns') p WHERE json_extract(p.value, '$.id') = 'explore') || '].links') c
                              WHERE json_extract(c.value, '$.id') = 'facilities'), 1000000)
         ))),
       rev = rev + 1,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
 WHERE key = 'footer' AND locale = 'en'
   AND EXISTS (SELECT 1 FROM json_each(section.json, '$.columns') p WHERE json_extract(p.value, '$.id') = 'explore')
   AND NOT EXISTS (SELECT 1 FROM json_each(section.json, '$.columns') p, json_each(p.value, '$.links') c
                    WHERE json_extract(c.value, '$.id') = 'projects');
