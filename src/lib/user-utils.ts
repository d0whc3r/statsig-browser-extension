import type { StatsigUser } from '@/src/types/statsig'

const getStringId = (value: unknown) => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  return null
}

const getCustomId = (detectedUser: StatsigUser, idType: string) => {
  const customId = detectedUser.customIDs?.[idType]
  if (typeof customId === 'string') {
    return customId
  }

  const rootId = detectedUser[idType]
  if (typeof rootId === 'string') {
    return rootId
  }

  const nestedCustomId = detectedUser.custom?.[idType]
  if (typeof nestedCustomId === 'string') {
    return nestedCustomId
  }

  return null
}

export const getDetectedUserId = (detectedUser?: StatsigUser, idType = 'userID'): string | null => {
  if (!detectedUser) {
    return null
  }

  if (idType === 'userID') {
    return getStringId(detectedUser.userID ?? detectedUser.id) ?? null
  }

  return getCustomId(detectedUser, idType) ?? null
}
