import { djb2 } from '../lib/djb2'
import { api } from '../lib/fetcher'

interface ConsoleApiKey {
  key: string
  type: string
}

interface KeysResponse {
  data?: ConsoleApiKey[]
}

interface GatesResponse {
  data?: { id?: string; name?: string }[]
}

const LIST_LIMIT = 100

/**
 * Lists the CLIENT SDK keys of the project owning the given Console API key.
 * Requires the `can_access_keys` scope; resolves to an empty list when the key lacks it.
 *
 * @param apiKey - Console API key of the project
 * @returns The project's client SDK keys
 */
export const fetchClientKeys = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await api
      .headers({ 'STATSIG-API-KEY': apiKey })
      .url(`/keys?limit=${LIST_LIMIT}`)
      .get()
      .json<KeysResponse>()

    return (response.data ?? []).filter((key) => key.type === 'CLIENT').map((key) => key.key)
  } catch {
    // The Console key has no `can_access_keys` scope: fall back to the gate fingerprint.
    return []
  }
}

/**
 * Hashes the project's gate names so a page's evaluation payload can be fingerprinted.
 *
 * @param apiKey - Console API key of the project
 * @returns djb2 hashes of the project's gate names
 */
export const fetchGateHashes = async (apiKey: string): Promise<string[]> => {
  try {
    const response = await api
      .headers({ 'STATSIG-API-KEY': apiKey })
      .url(`/gates?limit=${LIST_LIMIT}`)
      .get()
      .json<GatesResponse>()

    return (response.data ?? [])
      .map((gate) => gate.id ?? gate.name)
      .filter((name): name is string => Boolean(name))
      .map((name) => djb2(name))
  } catch {
    return []
  }
}

/**
 * Collects the identifiers used to recognise a project on a page. Client keys are preferred;
 * the gate fingerprint is only fetched when they are unavailable.
 *
 * @param apiKey - Console API key of the project
 * @returns The project's client keys and, if needed, its gate hashes
 */
export const fetchProjectFingerprint = async (apiKey: string) => {
  const clientKeys = await fetchClientKeys(apiKey)
  const gateHashes = clientKeys.length > 0 ? [] : await fetchGateHashes(apiKey)

  return { clientKeys, gateHashes }
}
