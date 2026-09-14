/**
 * Thông tin nền cho dashboard: số liệu trang Tổng quan, danh sách neo cho ô chọn
 * href, bảng icon cho ô chọn icon.
 *
 * Neo và icon quét từ mã nguồn component (`content/lookups.js`), cùng nguồn với bộ
 * bất biến chặn lượt lưu. Ô chọn trong dashboard vì thế không bao giờ gợi ý một giá
 * trị mà máy chủ sẽ từ chối.
 */
import { Router } from 'express'

import { requireSameOrigin, requireSession } from '../auth/middleware.js'
import { SECTION_IMAGES } from '../content/assemble.js'
import { getContent } from '../content/cache.js'
import { getLookups, renderedAnchors } from '../content/lookups.js'
import { getDb } from '../db/index.js'
import { EDITABLE_SECTIONS } from '../schema/sections.js'

export const metaRouter = Router()

metaRouter.use(requireSameOrigin, requireSession)

/** Số phần tử của mọi mảng cấp một (và `social.items` lồng một bậc). */
function countLists(value) {
  const out = {}
  for (const [key, child] of Object.entries(value ?? {})) {
    if (Array.isArray(child)) out[key] = child.length
    else if (child && typeof child === 'object' && Array.isArray(child.items)) out[`${key}.items`] = child.items.length
  }
  return out
}

metaRouter.get('/meta', (_req, res) => {
  const db = getDb()
  const content = getContent()
  const lookups = getLookups()

  const updated = new Map(
    db.prepare('SELECT key, MAX(updated_at) AS at FROM section GROUP BY key').all().map((row) => [row.key, row.at]),
  )
  const anchors = renderedAnchors(content.vi, lookups)

  res.json({
    rev: content.rev,
    updatedAt: content.updatedAt,
    sections: EDITABLE_SECTIONS.map((key) => ({
      key,
      updatedAt: updated.get(key) ?? null,
      counts: countLists(content.vi[key]),
      hasImages: Boolean(SECTION_IMAGES[key]),
    })),
    anchors: anchors ? [...anchors].sort() : null,
    icons: {
      course: lookups.courseIcons ?? [],
      pillar: lookups.pillarIcons ?? [],
      facility: lookups.facilityIcons ?? [],
    },
    media: db
      .prepare(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(bytes), 0) AS bytes,
                COALESCE(SUM(CASE WHEN id NOT IN (SELECT media_id FROM binding) THEN 1 ELSE 0 END), 0) AS unused
           FROM media`,
      )
      .get(),
    overriddenDetails: db
      .prepare("SELECT COUNT(DISTINCT course_id) AS n FROM course_detail WHERE source = 'overridden'")
      .get().n,
    // Mỗi lượt lưu chép 2 dòng lịch sử (vi + en); lấy dòng vi làm đại diện.
    recent: db
      .prepare(
        `SELECT id, key, saved_at AS savedAt, note
           FROM section_history WHERE locale = 'vi'
          ORDER BY saved_at DESC, id DESC LIMIT 10`,
      )
      .all(),
    warnings: lookups.problems,
  })
})
