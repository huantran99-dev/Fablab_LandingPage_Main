/**
 * Tự nạp lại stylesheet khi lần tải đầu hỏng, để người xem không phải bấm tải lại trang.
 *
 * Production đứng sau WAF của trường. WAF thỉnh thoảng chặn nhầm một request và trả về
 * trang HTML "Attack blocked" mã 403. Nếu request bị chặn là file CSS, trình duyệt bỏ
 * stylesheet đó (sai kiểu nội dung, có `nosniff`) và trang hiện ra trơn, không định dạng.
 * Lần thử lại thường qua được, vì đó là chặn nhầm thỉnh thoảng chứ không phải chặn cố định.
 *
 * Gọi ở đầu entry. Module script chạy SAU khi các `<link rel="stylesheet">` trong
 * `<head>` đã tải xong hoặc đã hỏng (stylesheet chặn script), nên lúc này `sheet`
 * đã có kết quả cuối cùng. Ở chế độ dev Vite chèn `<style>`, không có `<link>`, nên
 * hàm không làm gì.
 */
const MAX_ATTEMPTS = 3

function applied(link) {
  try {
    return (link.sheet?.cssRules?.length ?? 0) > 0
  } catch {
    // Stylesheet khác nguồn không cho đọc `cssRules`: coi như đã nạp.
    return true
  }
}

function retry(link, attempt) {
  let url
  try {
    url = new URL(link.href)
  } catch {
    return
  }
  // Tham số lạ để không nhận lại đúng phản hồi lỗi từ bộ đệm nào ở giữa.
  url.searchParams.set('retry', `${attempt}-${Date.now()}`)

  const next = document.createElement('link')
  next.rel = 'stylesheet'
  if (link.crossOrigin !== null) next.crossOrigin = link.crossOrigin
  next.href = url.href

  const settle = () => {
    if (applied(next)) {
      link.remove()
      return
    }
    next.remove()
    if (attempt < MAX_ATTEMPTS) setTimeout(() => retry(link, attempt + 1), 800 * attempt)
  }
  next.addEventListener('load', settle, { once: true })
  next.addEventListener('error', settle, { once: true })
  link.after(next)
}

export function ensureStylesheets() {
  try {
    for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
      if (!applied(link)) retry(link, 1)
    }
  } catch {
    // Không bao giờ để bước phòng hờ này làm hỏng trang.
  }
}
