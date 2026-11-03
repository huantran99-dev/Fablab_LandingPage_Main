import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { ArrowRightIcon, CloseIcon } from '../assets/icons/Icons'
import { useLiveHref } from '../hooks/useLiveHref'
import { useScrollLock } from '../hooks/useScrollLock'
import { useLanguage } from '../i18n/context'
import { getContentState, subscribeContent } from '../lib/contentStore'
import { forcedSeasonId, useActiveSeason } from '../lib/season'
import { track } from '../lib/track'
import { useRegister } from './register/RegisterContext'
import { Button } from './ui/Button'
import { Pill } from './ui/Pill'

const TITLE_ID = 'seasonal-popup-title'
const STORAGE_KEY = 'fablab-season-seen'
/** Mở sau chừng này (ms): không chen vào lần vẽ đầu, người xem kịp thấy trang trước. */
const OPEN_DELAY_MS = 1200
/** Tab đang ẩn hoặc đang có popup khác mở thì thử lại sau chừng này. */
const RETRY_MS = 1500

/**
 * "Đã xem" của trình duyệt này: `{ idSựKiện: phiênBản }`. Bọc try/catch (chế độ riêng tư
 * ném lỗi). Không ghi được thì bộ nhớ trong phiên vẫn chặn hiện lại cho tới khi tải trang.
 */
const seenInSession = new Map()

function readSeen() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

function hasSeen(id, version) {
  return seenInSession.get(id) === version || readSeen()[id] === version
}

function markSeen(id, version) {
  seenInSession.set(id, version)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readSeen(), [id]: version }))
  } catch {
    /* không ghi được thì chỉ nhớ trong phiên */
  }
}

/**
 * Phiên bản nội dung popup: băm chữ của CẢ HAI ngôn ngữ + ảnh. Admin sửa popup là phiên
 * bản đổi và popup hiện lại đúng một lần; đổi ngôn ngữ thì không (băm không theo ngôn
 * ngữ đang xem). Chỉ cần ổn định, không cần chống va chạm — djb2 là đủ.
 */
function versionOf(content, id) {
  const pick = (locale) => {
    const item = content[locale]?.seasonal?.items?.find((entry) => entry.id === id)
    return item && [item.name, item.title, item.body, item.ctaLabel, item.ctaAction, item.href, item.image?.url]
  }
  const text = JSON.stringify([pick('vi'), pick('en')])
  let hash = 5381
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0
  return (hash >>> 0).toString(36)
}

/**
 * Popup quảng cáo của sự kiện mùa — hiện MỘT LẦN mỗi sự kiện trên một trình duyệt.
 *
 * `<dialog>` gốc + `showModal()` cùng mẫu CourseModal: trình duyệt lo bẫy focus, Esc, trả
 * focus và `inert` cho nền; khoá cuộn qua `useScrollLock` (trên <html>, có bộ đếm). Bấm ra
 * nền thì đóng — đây là quảng cáo, không phải form đang điền dở.
 *
 * Phải mount TRƯỚC `<RegisterDialog />` trong App: nút "Đăng ký" đóng popup rồi mở form
 * trong cùng một lượt, effect chạy theo thứ tự cây (cùng lý do với popup khóa học).
 *
 * `?season=<id>` (xem thử từ dashboard) luôn hiện, kể cả đã xem.
 */
export function SeasonalPopup() {
  const { t } = useLanguage()
  const isLive = useLiveHref()
  // Cả hai ngôn ngữ (phiên bản popup không theo ngôn ngữ đang xem) — cùng store LanguageProvider đọc.
  const content = useSyncExternalStore(subscribeContent, getContentState, getContentState)
  const season = useActiveSeason()
  const { openRegister } = useRegister()
  const ref = useRef(null)

  const forced = forcedSeasonId() !== null
  const version = useMemo(() => (season?.popup ? versionOf(content, season.id) : null), [season, content])

  const [openVersion, setOpenVersion] = useState(null)
  const [closedVersion, setClosedVersion] = useState(null)
  const showing = version !== null && openVersion === version
  const due = version !== null && !showing && closedVersion !== version && (forced || !hasSeen(season.id, version))

  // Hẹn giờ mở. setState nằm trong callback của bộ hẹn giờ, không chạy đồng bộ trong
  // effect (luật lint `set-state-in-effect`).
  useEffect(() => {
    if (!due) return undefined
    let timer
    const attempt = () => {
      if (document.visibilityState !== 'visible' || document.querySelector('dialog[open]')) {
        timer = setTimeout(attempt, RETRY_MS)
        return
      }
      setOpenVersion(version)
    }
    timer = setTimeout(attempt, OPEN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [due, version])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (showing && !dialog.open) {
      dialog.showModal()
      // Tính là "đã xem" ngay khi hiện: rời trang lúc popup đang mở cũng không hiện lại.
      markSeen(season.id, version)
    } else if (!showing && dialog.open) {
      dialog.close()
    }
  }, [showing, season, version])

  useScrollLock(showing)

  const close = () => {
    setClosedVersion(version)
    setOpenVersion(null)
  }

  // Bấm ra vùng nền: click trên ::backdrop có target chính là <dialog>.
  const handleClick = (event) => {
    if (event.target === ref.current) close()
  }

  const labels = t.seasonal ?? {}
  const external = /^https?:\/\//.test(season?.href ?? '')

  let cta = null
  if (season?.ctaAction === 'register' && season.ctaLabel) {
    cta = (
      <Button
        type="button"
        onClick={() => {
          track('cta_click', 'seasonal-popup')
          close()
          openRegister(null, 'seasonal-popup')
        }}
      >
        {season.ctaLabel}
        <ArrowRightIcon />
      </Button>
    )
  } else if (season?.ctaAction === 'link' && season.ctaLabel && isLive(season.href)) {
    // Link trỏ vào khối admin đã tắt thì bỏ nút, đừng để một nút bấm vào không đi đâu.
    cta = (
      <Button
        href={season.href}
        {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
        onClick={() => {
          track('cta_click', 'seasonal-popup')
          close()
        }}
      >
        {season.ctaLabel}
        <ArrowRightIcon />
      </Button>
    )
  }

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={handleClick}
      aria-labelledby={TITLE_ID}
      className="w-full max-w-[min(560px,calc(100vw-32px))]"
    >
      {showing && season && (
        <div className="relative flex max-h-[calc(100dvh-48px)] flex-col overflow-hidden rounded-card-sm bg-white shadow-ambient-lift">
          <button
            type="button"
            onClick={close}
            aria-label={labels.close}
            className="absolute top-4 right-4 z-10 inline-flex size-10 cursor-pointer items-center justify-center rounded-pill bg-white text-ink shadow-ambient transition-colors duration-200 ease-[var(--ease-out-soft)] hover:bg-wash"
          >
            <CloseIcon />
          </button>

          {/* Ảnh popup do admin tải lên — thường là poster, nên `object-contain` trên nền
              pastel của sự kiện: cắt mất chữ trên poster còn tệ hơn để lề. */}
          {season.image && (
            <div className="flex shrink-0 items-center justify-center bg-wash px-6 pt-6">
              <img
                src={season.image.url}
                width={season.image.width}
                height={season.image.height}
                alt=""
                decoding="async"
                className="max-h-[min(320px,38dvh)] w-auto rounded-image-sm object-contain"
              />
            </div>
          )}

          <div className="flex flex-col items-start gap-4 overflow-y-auto px-6 py-6 md:px-8 md:py-7">
            <Pill tone="signal">{season.name}</Pill>
            <h2 id={TITLE_ID} className="text-heading-lg text-ink">
              {season.title}
            </h2>
            <p className="text-subheading text-graphite">{season.body}</p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-ash/60 px-6 py-4 md:px-8">
            {cta}
            <Button type="button" variant="ghost" onClick={close}>
              {labels.dismiss}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  )
}
