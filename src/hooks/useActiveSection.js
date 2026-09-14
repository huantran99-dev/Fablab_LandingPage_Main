import { useEffect, useState } from 'react'

/**
 * Trả về id của section đang nằm trong vùng nhìn, để navbar tô sáng đúng link.
 *
 * `rootMargin` phía trên bù chiều cao navbar sticky, phía dưới thu hẹp vùng
 * quan sát về khoảng giữa màn hình — dải quan sát vì thế là `[88px, 45vh]`.
 *
 * Hai điểm dễ làm sai, cả hai đều từng nằm trong bản đầu:
 *
 * 1. `entries` của mỗi lần callback CHỈ chứa phần tử vừa đổi trạng thái, không
 *    phải toàn bộ phần tử đang lọt. Đọc thẳng từ `entries` sẽ giữ nguyên giá trị
 *    cũ ngay cả khi section đó đã trôi khỏi màn hình. Vì vậy phải cộng dồn vào
 *    một `Set` sống qua các lần gọi.
 *
 * 2. Thứ tự trong `entries` KHÔNG theo thứ tự tài liệu. Lấy phần tử đầu tiên là
 *    tuỳ hứng — với hai khối liền nhau trong cùng một section (hai nhóm khóa
 *    học) thì cả hai thường xuyên cùng cắt dải quan sát và link sẽ nhấp nháy.
 *    Nên sắp phần tử theo thứ tự tài liệu một lần lúc dựng observer, rồi chọn
 *    mục CUỐI CÙNG đang lọt: đó là khối vừa cuộn vào, cũng là khối chiếm phần
 *    lớn dải quan sát.
 */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el) => el !== null)

    if (elements.length === 0) return

    // Thứ tự tài liệu, không phải thứ tự trong `ids` — mảng `ids` đi theo thứ tự
    // hiển thị trên menu, vốn không trùng thứ tự các section trên trang.
    const ordered = [...elements].sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )

    const intersecting = new Set()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target)
          else intersecting.delete(entry.target)
        }

        // Không có gì trong dải quan sát (đang ở đầu hoặc cuối trang) thì giữ
        // nguyên mục đang sáng, đừng tắt hết — nhảy về rỗng trông như lỗi.
        if (intersecting.size === 0) return

        for (let i = ordered.length - 1; i >= 0; i--) {
          if (intersecting.has(ordered[i])) {
            setActive(ordered[i].id)
            return
          }
        }
      },
      { rootMargin: '-88px 0px -55% 0px', threshold: 0 },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}
