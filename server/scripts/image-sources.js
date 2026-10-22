/**
 * Ảnh đóng gói trong `src/assets/images/` và chúng gắn vào mục nào — dùng chung cho
 * `seed.js` (database trống) và `seed-images.js` (database đã seed, thêm scope mới).
 *
 * Một danh sách scope duy nhất: hai script tự liệt kê riêng là sớm muộn sẽ lệch, và
 * scope bị quên ở một bên thì ảnh của nó không bao giờ vào database.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { ROOT } from '../config.js'

export const SRC_IMAGES = join(ROOT, 'src', 'assets', 'images')

/**
 * scope trong bảng `binding` -> map `id mục -> ảnh` của index.js. Thêm scope ở đây
 * thì nhớ thêm cả vào `BINDING_TARGETS` (server/content/assemble.js).
 */
export function imageScopes(images) {
  return [
    ['course', images.COURSE_IMAGES],
    ['facility', images.FACILITY_IMAGES],
    ['equipment', images.EQUIPMENT_IMAGES],
    ['project', images.PROJECT_IMAGES],
    ['activity', images.ACTIVITY_IMAGES],
    ['partner', images.PARTNER_LOGOS],
    ['team', images.TEAM_IMAGES],
    ['singleton', { hero: images.HERO_IMAGE, logo: images.LOGO_MARK }],
  ]
}

/** Map ảnh trong index.js dùng hai quy ước giá trị khác nhau. */
export const filenameOf = (value) => (typeof value === 'string' ? value : value?.src)

/**
 * Ghi chú `// ~` và `// ↺` bóc thẳng từ mã nguồn của index.js.
 *
 * Bóc bằng regex chứ không chép tay: chép tay 15 dòng thì sai một dòng cũng không
 * ai biết, mà đây là thông tin không dựng lại được nếu mất.
 */
export function readImageNotes() {
  const source = readFileSync(join(SRC_IMAGES, 'index.js'), 'utf8')
  const notes = new Map()
  for (const match of source.matchAll(/^\s{2}'?([A-Za-z0-9-]+)'?:\s*[^,\n]+,\s*\/\/\s*(.+)$/gm)) {
    notes.set(match[1], match[2].trim())
  }
  return notes
}
