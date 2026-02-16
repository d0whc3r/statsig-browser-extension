import { fetcher } from '@/src/lib/fetcher'

export interface UnitIDType {
  name: string
  displayName?: string
  description?: string
}

export interface UnitIDTypesResponse {
  data: string[] | UnitIDType[]
  message: string
}

const defaultUnitIDTypes = ['userID', 'stableID']

export const getUnitIDTypes = async (): Promise<string[]> => {
  try {
    const response = await fetcher<UnitIDTypesResponse>('/unit_id_types')

    // Normalize data to string array
    // The API might return strings or objects depending on version/config
    if (Array.isArray(response.data)) {
      return [
        ...response.data.map((item) => {
          if (typeof item === 'string') {
            return item
          }
          return item.name
        }),
        ...defaultUnitIDTypes,
      ]
    }
    return defaultUnitIDTypes // Fallback
  } catch (error) {
    console.error('Failed to fetch unit ID types:', error)
    // Return default types on error to ensure UI still works
    return defaultUnitIDTypes
  }
}
