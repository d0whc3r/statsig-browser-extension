import type { StatsigUser } from '@/src/types/statsig'

const getStringId = (value: unknown) => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
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
}

export const getDetectedUserId = (detectedUser?: StatsigUser, idType = 'userID'): string | undefined => {
  if (!detectedUser) {
    return
  }

  if (idType === 'userID') {
    return getStringId(detectedUser.userID ?? detectedUser.id)
  }

  return getCustomId(detectedUser, idType)
}
