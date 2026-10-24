import { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import { useEntriesInRange } from '@/db/useEntries'
import { formatFullDate, toKey } from '@/lib/date'
import TodayForm from './today/TodayForm'

export default function TodayPage() {
  const [now] = useState(() => new Date())
  const key = toKey(now)
  const entries = useEntriesInRange(key, key)
  const entry = entries?.get(key)

  return (
    <>
      <PageHeader
        title="Hôm nay"
        subtitle={`${formatFullDate(now)}${entry ? ' · đang chỉnh sửa' : ''}`}
      />
      {entries && (
        <TodayForm
          key={`${key}-${entry?.id ?? 'empty'}-${entry?.updatedAt ?? 0}`}
          date={key}
          entry={entry}
        />
      )}
    </>
  )
}
