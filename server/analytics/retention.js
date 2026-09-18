/**
 * Dọn dữ liệu theo thời hạn giữ. Gọi từ `server/index.js` — không gọi từ `app.js`,
 * để script dựng app lên (hay một bài kiểm về sau) không tự bật timer.
 *
 * Mọi việc nằm trong MỘT giao dịch: gộp sự kiện quá hạn vào `stat_daily` rồi mới
 * xoá bản thô, nên không có lúc nào số liệu của một ngày vừa mất vừa chưa gộp.
 */
import { config } from '../config.js'
import { getDb } from '../db/index.js'
import { dayKey } from './track.js'

const SIX_HOURS = 6 * 3600_000

/** Các chỉ số giữ lại sau khi xoá bản thô. `dim` rỗng là tổng của ngày. */
const ROLLUPS = [
  ["'views'", "''", 'COUNT(*)', "name = 'pageview'"],
  ["'visitors'", "''", 'COUNT(DISTINCT visitor)', "name = 'pageview'"],
  ["'registrations'", "''", 'COUNT(*)', "name = 'register_submit'"],
  ["'course_open'", "COALESCE(target, '')", 'COUNT(*)', "name = 'course_open'"],
  ["'cta_click'", "COALESCE(target, '')", 'COUNT(*)', "name = 'cta_click'"],
]

export function runRetention(now = new Date()) {
  const db = getDb()
  const cutoff = dayKey(new Date(now.getTime() - config.analyticsRetentionDays * 86_400_000))
  const today = dayKey(now)
  const registrationCutoff = new Date(now.getTime() - config.registrationRetentionDays * 86_400_000).toISOString()

  const run = db.transaction(() => {
    for (const [metric, dim, value, where] of ROLLUPS) {
      db.prepare(
        `INSERT OR REPLACE INTO stat_daily (day, metric, dim, value)
         SELECT day, ${metric}, ${dim}, ${value} FROM event
          WHERE ${where} AND day < ? GROUP BY day, ${dim}`,
      ).run(cutoff)
    }
    return {
      events: db.prepare('DELETE FROM event WHERE day < ?').run(cutoff).changes,
      salts: db.prepare('DELETE FROM analytics_salt WHERE day <> ?').run(today).changes,
      registrations: db.prepare('DELETE FROM registration WHERE created_at < ?').run(registrationCutoff).changes,
    }
  })

  const result = run()
  if (result.events > 0 || result.registrations > 0) {
    console.info(
      `[retention] xoa ${result.events} su kien truoc ${cutoff}, ${result.registrations} dang ky qua ${config.registrationRetentionDays} ngay`,
    )
  }
  return result
}

export function startRetention() {
  const tick = () => {
    try {
      runRetention()
    } catch (error) {
      console.error('[retention]', error)
    }
  }
  tick()
  setInterval(tick, SIX_HOURS).unref()
}
