export const getActionTypeColor = (
  actionType: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const action = actionType.toLowerCase()

  const mappings: {
    keywords: string[]
    color: 'default' | 'secondary' | 'destructive' | 'outline'
  }[] = [
    { color: 'default', keywords: ['start', 'create', 'edit', 'update', 'condition', 'add'] },
    { color: 'destructive', keywords: ['delete', 'archive', 'toggle'] },
    { color: 'secondary', keywords: ['restart', 'warning', 'override', 'environment'] },
  ]

  for (const { keywords, color } of mappings) {
    if (keywords.some((keyword) => action.includes(keyword))) {
      return color
    }
  }

  return 'outline'
}

export const getActionTypeLabel = (actionType: string) =>
  actionType.charAt(0).toUpperCase() + actionType.slice(1)

export const getTagColor = (tag: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const tagLower = tag.toLowerCase()
  const mappings: { keywords: string[]; color: 'secondary' | 'destructive' | 'default' }[] = [
    { color: 'secondary', keywords: ['nexus', 'platform', 'test', 'dev', 'staging'] },
    { color: 'destructive', keywords: ['prod', 'production'] },
    {
      color: 'default',
      keywords: ['beta', 'alpha', 'preview', 'feature', 'experiment'],
    },
  ]

  for (const { keywords, color } of mappings) {
    if (keywords.some((keyword) => tagLower.includes(keyword))) {
      return color
    }
  }

  return 'outline'
}

export const getDateFromAuditLog = (date: string, time: string) => {
  try {
    const dateTime = new Date(`${date} ${time}`)
    if (!isNaN(dateTime.getTime())) {
      return dateTime
    }
    const isoDateTime = new Date(`${date}T${time}`)
    if (!isNaN(isoDateTime.getTime())) {
      return isoDateTime
    }
    return new Date()
  } catch {
    return new Date()
  }
}
