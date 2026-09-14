/**
 * Bảng tra cứu quét ra từ MÃ NGUỒN component: id icon, bảng sắc/bố cục, tập neo.
 *
 * Quét chứ không chép tay vào đây — chép tay là tự tạo thêm một chỗ nữa để lệch.
 * Dùng chung cho `check-content.js` và đường ghi của dashboard, nên cả hai hỏi
 * cùng một câu và nhận cùng một câu trả lời.
 *
 * Máy chủ chạy từ bản clone của repo nên `src/` có mặt. Nếu không có (ai đó chỉ
 * chép `server/` + `dist/` lên máy), bảng nào không quét được thì là `null` và bộ
 * bất biến bỏ qua luật tương ứng kèm cảnh báo — thà bỏ một luật còn hơn chặn ghi.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { ROOT } from '../config.js'

/** Khoá cấp một của một object literal trong mã nguồn, quét theo thụt đầu dòng 2. */
export function literalKeys(file, constName) {
  if (!existsSync(file)) return null
  const source = readFileSync(file, 'utf8')
  const start = source.indexOf(`${constName} = {`)
  if (start === -1) return null
  const body = source.slice(start)
  const end = body.indexOf('\n}')
  if (end === -1) return null
  return [...body.slice(0, end).matchAll(/^ {2}'?([A-Za-z0-9-]+)'?:/gm)].map((match) => match[1])
}

/** Neo mà component viết cứng (`<Section id="…">`). Neo suy từ dữ liệu tính riêng. */
function staticAnchors(dir) {
  if (!existsSync(dir)) return null
  const anchors = new Set()
  for (const entry of readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.jsx')) continue
    const source = readFileSync(join(entry.parentPath ?? dir, entry.name), 'utf8')
    for (const match of source.matchAll(/<(?:Section|section|footer)\s+id="([a-z0-9-]+)"/g)) {
      anchors.add(match[1])
    }
  }
  return anchors
}

export function scanLookups(root = ROOT) {
  const src = (...parts) => join(root, 'src', ...parts)
  const problems = []

  const iconTable = (file, constName, label) => {
    const keys = literalKeys(file, constName)
    if (!keys) problems.push(`Khong quet duoc bang icon ${label} — bo kiem dang chay mu, sua lai literalKeys()`)
    return keys
  }

  const anchors = staticAnchors(src('components'))
  if (!anchors) problems.push('Khong quet duoc neo trong src/components — bo qua kiem href')

  return {
    courseIcons: iconTable(src('assets', 'icons', 'CourseIcons.jsx'), 'const PATHS', 'PATHS (CourseIcons.jsx)'),
    pillarIcons: iconTable(src('assets', 'icons', 'Icons.jsx'), 'const PILLAR_PATHS', 'PILLAR_PATHS (Icons.jsx)'),
    facilityIcons: iconTable(src('assets', 'icons', 'Icons.jsx'), 'const FACILITY_PATHS', 'FACILITY_PATHS (Icons.jsx)'),
    pillarTones: literalKeys(src('components', 'Pillars.jsx'), 'const TONES'),
    facilityLayouts: literalKeys(src('components', 'Facilities.jsx'), 'const LAYOUT'),
    staticAnchors: anchors,
    problems,
  }
}

let memo = null

/** Bản nhớ đệm cho máy chủ: mã nguồn component không đổi trong vòng đời tiến trình. */
export function getLookups() {
  memo ??= scanLookups()
  return memo
}

/**
 * Tập neo mà trang THẬT SỰ dựng ra: neo viết cứng + hai họ neo suy từ dữ liệu.
 * Thêm nhóm khóa học hay khối hoạt động là neo tự có. `null` nếu không quét được.
 */
export function renderedAnchors(dict, lookups) {
  if (!lookups.staticAnchors) return null
  const anchors = new Set(lookups.staticAnchors)
  for (const group of dict.activities?.groups ?? []) anchors.add(group.id)
  for (const group of dict.courses?.groups ?? []) anchors.add(`courses-${group.id}`)
  return anchors
}
