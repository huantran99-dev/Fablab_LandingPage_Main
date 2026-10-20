import { Icon } from './Icon'
import { Spinner } from './Spinner'

/**
 * Chip trạng thái "đã lên trang công khai" sau một lượt lưu. Đi cùng `usePublishCheck`.
 *
 * Đọc to qua `role="status"`: người dùng trình đọc màn hình nghe được lúc chip chuyển
 * từ "đang kiểm tra" sang "đã lên trang".
 */
export function PublishStatus({ status, onRetry, compact = false }) {
  if (status.state === 'idle') return null

  if (status.state === 'checking') {
    return (
      <span role="status" className="inline-flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400">
        <Spinner size={14} />
        {compact ? 'Đang đồng bộ…' : 'Đang kiểm tra trang công khai…'}
      </span>
    )
  }

  if (status.state === 'live') {
    return (
      <span role="status" className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-success-600 dark:text-success-500">
        <Icon name="check" size={16} />
        <span>
          Đã lên trang công khai{status.rev != null && !compact ? ` · bản #${status.rev}` : ''}
        </span>
        {!compact && (
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Xem trang
            <Icon name="external" size={14} />
          </a>
        )}
      </span>
    )
  }

  return (
    <span role="status" className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-warning-600 dark:text-warning-500">
      <Icon name="alert" size={16} />
      <span>Trang công khai chưa trả bản mới</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-medium text-brand-600 hover:underline dark:text-brand-400">
          Kiểm tra lại
        </button>
      )}
    </span>
  )
}
