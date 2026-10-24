import { useState, useRef } from 'react'
import PageHeader from '@/components/PageHeader'
import { useEntriesInRange } from '@/db/useEntries'
import { formatFullDate, toKey } from '@/lib/date'
import TodayForm from './today/TodayForm'
import WhimsicalHero from '@/components/WhimsicalHero'

export default function TodayPage() {
  const [now] = useState(() => new Date())
  const key = toKey(now)
  const entries = useEntriesInRange(key, key)
  const entry = entries?.get(key)
  const formRef = useRef<HTMLDivElement | null>(null)

  const scrollToEntry = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="space-y-10">
      {/* Whimsical Hero section: 3D interactive diary + 4 tilted cards */}
      <WhimsicalHero onScrollToEntry={scrollToEntry} />

      {/* Phần ghi nhật ký hôm nay */}
      <div ref={formRef} className="pt-2">
        <PageHeader
          title="Trang viết hôm nay"
          subtitle={`${formatFullDate(now)}${entry ? ' · đang lưu những suy nghĩ dịu dàng' : ' · một trang giấy mới chờ bạn'}`}
        />
        {entries && (
          <TodayForm
            key={`${key}-${entry?.id ?? 'empty'}-${entry?.updatedAt ?? 0}`}
            date={key}
            entry={entry}
          />
        )}
      </div>
    </div>
  )
}
