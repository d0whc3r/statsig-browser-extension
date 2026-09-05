const DJB2_MULTIPLIER = 31

/**
 * Statsig's DJB2 variant (seed 0, 32-bit unsigned), used by the SDK to hash entity names
 * and by the API to report `hashed_sdk_key_used`.
 *
 * @param value - The string to hash
 * @returns The hash as an unsigned 32-bit decimal string
 */
export const djb2 = (value: string): string => {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    // oxlint-disable-next-line unicorn/prefer-code-point -- Statsig hashes UTF-16 code units
    hash = Math.imul(hash, DJB2_MULTIPLIER) + value.charCodeAt(index) // NOSONAR: code units, not code points
  }
  return String(hash >>> 0)
}
