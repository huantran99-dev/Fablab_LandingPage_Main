import { getPath, setPath } from '../lib/paths'
import { Card } from '../ui/Card'
import { TranslatedField } from './FieldControl'

const issueAt = (issues, locale, path) => issues?.[locale]?.find((issue) => issue.path === path)?.message

/** Một nhóm chữ chung của section (không thuộc mục nào): tiêu đề, nhãn nút, nhãn trợ năng… */
export function SectionFields({ group, draft, onChangeDraft, issues, idPrefix }) {
  const hasIssue = group.fields.some((field) => issueAt(issues, 'vi', field.key) || issueAt(issues, 'en', field.key))

  const content = (
    <div className="space-y-5">
      {group.fields.map((field) => (
        <TranslatedField
          key={field.key}
          field={field}
          id={`${idPrefix}-${field.key.replaceAll('.', '-')}`}
          values={{ vi: getPath(draft.vi, field.key), en: getPath(draft.en, field.key) }}
          onChange={(locale, value) => onChangeDraft({ ...draft, [locale]: setPath(draft[locale], field.key, value) })}
          errors={{ vi: issueAt(issues, 'vi', field.key), en: issueAt(issues, 'en', field.key) }}
        />
      ))}
    </div>
  )

  return (
    <Card title={group.title} description={group.description}>
      {group.collapsible ? (
        <details open={hasIssue || undefined}>
          <summary className="cursor-pointer text-sm font-medium text-brand-500 select-none">
            Hiện {group.fields.length} trường
          </summary>
          <div className="mt-5">{content}</div>
        </details>
      ) : (
        content
      )}
    </Card>
  )
}
