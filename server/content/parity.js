/**
 * So đối xứng cấu trúc giữa hai từ điển ngôn ngữ.
 *
 * Quy ước bắt buộc của repo: `vi` và `en` phải luôn cùng cấu trúc khoá. File này
 * là chỗ duy nhất định nghĩa "cùng cấu trúc" nghĩa là gì.
 *
 * ## Mảng địa chỉ theo `id`, không theo chỉ số
 *
 * Nếu đánh địa chỉ theo chỉ số thì **đổi thứ tự một mảng sẽ bị đọc thành khác
 * biệt**, trong khi thứ tự vốn được phép khác... mà thật ra là không được phép
 * khác. Điểm mấu chốt nằm ở chỗ khác: đánh theo `id` làm cho thông báo lỗi chỉ
 * đúng vào mục nào thiếu (`courses.items[id=cnc].title`) thay vì một con số vô
 * nghĩa (`courses.items[7].title`), và nó là thứ giữ được ý nghĩa khi mảng dài ra.
 *
 * ## Miễn trừ `courses.details`
 *
 * Nhánh này **cố ý bất đối xứng**: khoá học nào trang gốc không có trang tiếng
 * Anh thì thiếu hẳn mục đó, và popup chỉ render mục có dữ liệu. Quy ước "hai từ
 * điển cùng shape" chỉ áp cho chữ giao diện.
 *
 * Nhưng miễn trừ dừng đúng ở **một bậc**: hai bản vẫn phải liệt kê cùng một tập
 * khoá học, chỉ có nội dung bên trong mỗi khoá được phép khác. Vì thế mẫu miễn
 * trừ khớp `courses.details.<id>` chứ không khớp `courses.details`.
 */

/** Nhánh cố ý bất đối xứng. Khớp tới đâu thì ghi nhận tới đó rồi dừng, không đi sâu. */
export const DEFAULT_EXEMPT = [/^courses\.details\.[^.]+$/]

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Liệt kê mọi đường khoá lá của một từ điển.
 *
 * @param {object} root
 * @param {{ exempt?: RegExp[] }} [options]
 * @returns {string[]} đã sắp xếp
 */
export function keyPaths(root, { exempt = DEFAULT_EXEMPT } = {}) {
  const paths = []

  const walk = (value, path) => {
    if (path && exempt.some((pattern) => pattern.test(path))) {
      paths.push(path)
      return
    }

    if (Array.isArray(value)) {
      // Mảng toàn object có `id` chuỗi thì đánh theo id; còn lại đành theo chỉ số.
      const byId = value.length > 0 && value.every((item) => isPlainObject(item) && typeof item.id === 'string')
      value.forEach((item, index) => {
        const key = byId ? `[id=${item.id}]` : `[${index}]`
        walk(item, `${path}${key}`)
      })
      if (value.length === 0) paths.push(`${path}[]`)
      return
    }

    if (isPlainObject(value)) {
      const keys = Object.keys(value)
      if (keys.length === 0) paths.push(`${path}{}`)
      for (const key of keys) {
        walk(value[key], path ? `${path}.${key}` : key)
      }
      return
    }

    paths.push(path)
  }

  walk(root, '')
  return paths.sort()
}

/**
 * Hiệu đối xứng giữa hai từ điển.
 *
 * **Trả về khác biệt, không so với một con số.** Thêm một testimonial là tổng số
 * đường khoá đổi một cách hợp lệ; chốt cứng con số sẽ biến mọi lần sửa hợp lệ
 * thành lỗi build, và bộ kiểm sẽ bị tắt đi trong vòng một tuần.
 */
export function assertParity(vi, en, { exempt = DEFAULT_EXEMPT } = {}) {
  const viPaths = keyPaths(vi, { exempt })
  const enPaths = keyPaths(en, { exempt })
  const viSet = new Set(viPaths)
  const enSet = new Set(enPaths)

  return {
    total: viPaths.length,
    missingInEn: viPaths.filter((path) => !enSet.has(path)),
    missingInVi: enPaths.filter((path) => !viSet.has(path)),
  }
}
