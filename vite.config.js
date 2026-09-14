import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

/**
 * Hai entry độc lập: trang công khai và dashboard quản trị.
 *
 * Rollup dựng hai đồ thị riêng, nên **mọi thứ chỉ `admin.html` chạm tới đều nằm
 * trong chunk riêng** — người xem trang tải đúng bằng khi chưa có dashboard. Đây
 * là lý do không dùng react-router trên app hiện tại: router sẽ vào bundle công
 * khai vô điều kiện, và chunk admin chỉ tách được nếu MỌI import đều lazy — một
 * import tĩnh lỡ tay là dính lại, không có lỗi build nào báo.
 *
 * Phần CSS còn một chốt nữa nằm ở `src/index.css` (`@source not "./admin"`), vì
 * Tailwind v4 quét nguồn độc lập với đồ thị module của Rollup.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        admin: fileURLToPath(new URL('./admin.html', import.meta.url)),
      },
    },
  },

  server: {
    // Trình duyệt đứng ở cổng của Vite, nên `/api` và `/media` phải được chuyển
    // tiếp sang máy chủ Express — nhờ đó không cần CORS ở chế độ phát triển.
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/media': 'http://127.0.0.1:3001',
    },
  },
})
