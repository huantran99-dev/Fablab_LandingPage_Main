import { useCallback, useEffect, useRef, useState } from 'react'

import { waitForPublished } from '../lib/publish'

/**
 * Trạng thái "đã lên trang công khai chưa" của lượt lưu gần nhất.
 *
 *   idle      chưa lưu gì trong phiên này
 *   checking  đang đọc lại /api/content để so
 *   live      bản công khai khớp bản vừa ghi
 *   stale     thử ~6 giây vẫn chưa khớp (hoặc không đọc được bản công khai)
 *
 * Chỉ lượt kiểm MỚI NHẤT được ghi kết quả: lưu hai lần liên tiếp thì kết quả của lần
 * đầu về muộn không được đè lên lần sau. Kiểm chạy trong handler (sau khi lưu), không
 * trong effect — không đụng luật lint `set-state-in-effect`.
 */
export function usePublishCheck() {
  const [status, setStatus] = useState({ state: 'idle', rev: null })
  const token = useRef(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const run = useCallback(async (check) => {
    token.current += 1
    const mine = token.current
    setStatus({ state: 'checking', rev: null })
    const result = await waitForPublished(check)
    if (!alive.current || mine !== token.current) return result
    setStatus({ state: result.ok ? 'live' : 'stale', rev: result.rev, error: result.error })
    return result
  }, [])

  const reset = useCallback(() => {
    token.current += 1
    setStatus({ state: 'idle', rev: null })
  }, [])

  return { status, run, reset }
}
