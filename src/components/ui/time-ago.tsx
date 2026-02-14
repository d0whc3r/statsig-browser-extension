import React, { useMemo } from 'react'

const MILLISECONDS_PER_SECOND = 1000

const INTERVALS = [
  { label: 'year', seconds: 31_536_000 },
  { label: 'month', seconds: 2_592_000 },
  { label: 'day', seconds: 86_400 },
  { label: 'hour', seconds: 3600 },
  { label: 'minute', seconds: 60 },
  { label: 'second', seconds: 1 },
] as const

const getTimeAgoString = (date: number | string | Date): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / MILLISECONDS_PER_SECOND)

  for (const { label, seconds: intervalSeconds } of INTERVALS) {
    const interval = seconds / intervalSeconds
    if (interval >= 1) {
      const count = Math.floor(interval)
      return `${count} ${label}${count === 1 ? '' : 's'} ago`
    }
  }

  return 'just now'
}

export function TimeAgo({ date }: { date: number | string | Date }) {
  const timeString = useMemo(() => getTimeAgoString(date), [date])

  return <span>{timeString}</span>
}
