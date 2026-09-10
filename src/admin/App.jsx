import { useCallback, useEffect, useState } from 'react'

import { Login } from './components/Login'
import { TestimonialsEditor } from './editors/TestimonialsEditor'
import { ApiError, api, setCsrfToken } from './lib/api'

/**
 * Vỏ dashboard: đăng nhập, chọn section, soạn, lưu, xem lịch sử.
 *
 * Đợt này chỉ mở section "Cảm nhận". Máy chủ **từ chối ghi** vào section chưa có
 * schema (400 kèm danh sách section mở), nên giao diện chỉ liệt kê đúng những gì
 * máy chủ nhận — không có nút nào dẫn tới một lượt lưu chắc chắn thất bại.
 */

const EDITORS = {
  testimonials: { label: 'Cảm nhận', Component: TestimonialsEditor },
}

function useSession() {
  const [state, setState] = useState({ status: 'checking', username: null })

  useEffect(() => {
    api
      .session()
      .then((result) => {
        setCsrfToken(result.csrfToken)
        setState({
          status: result.authenticated ? 'in' : 'out',
          username: result.username ?? null,
        })
      })
      .catch(() => setState({ status: 'out', username: null }))
  }, [])

  return [state, setState]
}

export default function App() {
  const [session, setSession] = useSession()
  const [section, setSection] = useState('testimonials')
  const [editable, setEditable] = useState([])

  const [draft, setDraft] = useState(null)
  const [baseRev, setBaseRev] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState(null)
  const [issues, setIssues] = useState(null)
  const [history, setHistory] = useState([])

  // Chỉ ĐỌC, không đụng state — nhờ vậy dùng lại được cho cả effect lẫn nút bấm.
  const fetchSection = useCallback(async (key) => {
    const [pair, history] = await Promise.all([api.readSection(key), api.history(key)])
    return { draft: { vi: pair.vi, en: pair.en }, rev: pair.rev, entries: history.entries }
  }, [])

  const apply = useCallback((loaded) => {
    setDraft(loaded.draft)
    setBaseRev(loaded.rev)
    setHistory(loaded.entries)
    setDirty(false)
    setStatus(null)
    setIssues(null)
  }, [])

  useEffect(() => {
    if (session.status !== 'in') return undefined

    // `cancelled` chặn việc ghi state của một lượt nạp đã lỗi thời: đổi section
    // nhanh hai lần thì lượt trước về sau lượt sau là chuyện có thật.
    let cancelled = false
    ;(async () => {
      try {
        const [sections, loaded] = await Promise.all([api.editableSections(), fetchSection(section)])
        if (cancelled) return
        setEditable(sections.editable)
        apply(loaded)
      } catch (error) {
        if (!cancelled) setStatus({ kind: 'error', text: error.message })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [session.status, section, fetchSection, apply])

  const reload = useCallback(async () => {
    apply(await fetchSection(section))
  }, [apply, fetchSection, section])

  // Chặn đóng tab khi còn thay đổi chưa lưu. Không có tự lưu: một lượt lưu là một
  // lượt ghi vào trang thật, phải do người bấm.
  useEffect(() => {
    if (!dirty) return undefined
    const warn = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (session.status === 'checking') {
    return <p className="p-8 text-sm text-steel">Đang kiểm tra phiên đăng nhập…</p>
  }

  if (session.status === 'out') {
    return <Login onSignedIn={(result) => setSession({ status: 'in', username: result.username })} />
  }

  async function save() {
    setStatus({ kind: 'busy', text: 'Đang lưu…' })
    setIssues(null)
    try {
      const result = await api.writeSection(section, { ...draft, rev: baseRev })
      setBaseRev(result.rev)
      setDirty(false)
      setHistory((await api.history(section)).entries)
      setStatus({ kind: 'ok', text: `Đã lưu. Tải lại trang chính là thấy đổi.` })
    } catch (error) {
      if (!(error instanceof ApiError)) throw error

      if (error.status === 422 && (error.body.vi || error.body.en)) {
        setIssues({ vi: error.body.vi ?? [], en: error.body.en ?? [] })
        setStatus({ kind: 'error', text: 'Nội dung chưa hợp lệ — xem các ô báo đỏ bên dưới.' })
        return
      }
      if (error.status === 422) {
        const missing = [...(error.body.missingInEn ?? []), ...(error.body.missingInVi ?? [])]
        setStatus({
          kind: 'error',
          text: `Hai ngôn ngữ không cùng cấu trúc: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '…' : ''}`,
        })
        return
      }
      if (error.status === 409) {
        setStatus({
          kind: 'error',
          text: 'Nội dung đã bị sửa ở nơi khác. Tải lại để lấy bản mới — thay đổi đang soạn sẽ mất.',
        })
        return
      }
      setStatus({ kind: 'error', text: error.message })
    }
  }

  async function restore(id) {
    await api.restore(id)
    await reload()
    setStatus({ kind: 'ok', text: 'Đã khôi phục bản trước.' })
  }

  const Editor = EDITORS[section]?.Component

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ash pb-4">
        <div>
          <h1 className="text-lg font-bold">Quản trị nội dung</h1>
          <p className="text-xs text-steel">
            Đăng nhập: {session.username} · phiên bản nội dung {baseRev ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" className="rounded border border-ash px-3 py-1.5 text-sm">
            Xem trang
          </a>
          <button
            type="button"
            onClick={() => api.logout().then(() => setSession({ status: 'out', username: null }))}
            className="rounded border border-ash px-3 py-1.5 text-sm"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      <nav className="flex flex-wrap gap-2">
        {editable.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSection(key)}
            className={`rounded px-3 py-1.5 text-sm ${
              key === section ? 'bg-signal text-white' : 'border border-ash bg-white'
            }`}
          >
            {EDITORS[key]?.label ?? key}
          </button>
        ))}
        <span className="self-center text-xs text-steel">
          Các section khác sẽ mở dần ở những đợt sau.
        </span>
      </nav>

      {status && (
        <p
          role="status"
          className={`rounded border px-3 py-2 text-sm ${
            status.kind === 'error'
              ? 'border-danger/30 bg-danger/5 text-danger'
              : status.kind === 'ok'
                ? 'border-ok/30 bg-ok/5 text-ok'
                : 'border-ash bg-white text-steel'
          }`}
        >
          {status.text}
        </p>
      )}

      {draft && Editor && (
        <Editor
          value={draft}
          issues={issues}
          onChange={(next) => {
            setDraft(next)
            setDirty(true)
          }}
        />
      )}

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-ash bg-paper/95 py-3 backdrop-blur">
        <span className="text-sm text-steel">
          {dirty ? 'Có thay đổi chưa lưu' : 'Chưa có thay đổi nào'}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => reload()}
            className="rounded border border-ash bg-white px-4 py-2 text-sm"
          >
            Bỏ thay đổi
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || status?.kind === 'busy'}
            className="rounded bg-signal px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Lưu
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <details className="rounded border border-ash bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium">
            Lịch sử ({history.length} bản)
          </summary>
          <ul className="mt-3 flex flex-col gap-2">
            {history
              .filter((entry) => entry.locale === 'vi')
              .map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-steel">
                    {new Date(entry.saved_at).toLocaleString('vi-VN')}
                    {entry.note ? ` · ${entry.note}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => restore(entry.id)}
                    className="rounded border border-ash px-2 py-1 text-xs"
                  >
                    Khôi phục
                  </button>
                </li>
              ))}
          </ul>
          <p className="mt-3 text-xs text-steel">
            Khôi phục luôn lấy cả hai ngôn ngữ của cùng một thời điểm.
          </p>
        </details>
      )}
    </div>
  )
}
