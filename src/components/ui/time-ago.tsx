import React, { useMemo } from 'react'

const MILLISECONDS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_DAY = 86_400
const SECONDS_PER_MONTH = 2_592_000
const SECONDS_PER_YEAR = 31_536_000

// eslint-disable-next-line max-statements
const getTimeAgoString = (date: number | string | Date): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / MILLISECONDS_PER_SECOND)
  let interval = seconds / SECONDS_PER_YEAR
  if (interval > 1) {
    return `${Math.floor(interval)} years ago`
  }
  interval = seconds / SECONDS_PER_MONTH
  if (interval > 1) {
    return `${Math.floor(interval)} months ago`
  }
  interval = seconds / SECONDS_PER_DAY
  if (interval > 1) {
    return `${Math.floor(interval)} days ago`
  }
  interval = seconds / SECONDS_PER_HOUR
  if (interval > 1) {
    return `${Math.floor(interval)} hours ago`
  }
  interval = seconds / SECONDS_PER_MINUTE
  if (interval > 1) {
    return `${Math.floor(interval)} minutes ago`
  }
  return `${Math.floor(seconds)} seconds ago`
}

export function TimeAgo({ date }: { date: number | string | Date }) {
  const timeString = useMemo(() => getTimeAgoString(date), [date])

  return <span>{timeString}</span>
}
