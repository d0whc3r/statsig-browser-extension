// oxlint-disable-next-line import/no-nodejs-modules -- tests read the source stylesheet, not the compiled Tailwind output
import { readFileSync } from 'node:fs'
// oxlint-disable-next-line import/no-nodejs-modules -- join() builds the path to globals.css
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const themeCss = readFileSync(join(import.meta.dirname, 'globals.css'), 'utf8')

const WCAG_AA_TEXT = 4.5
const WCAG_AA_UI = 3
const VISIBLE_SEPARATOR = 2.5
const LIGHT_SEPARATOR_MIN = 1.5

interface OklchColor {
  chroma: number
  hue: number
  lightness: number
}

// OKLab → linear sRGB matrix from Björn Ottosson, CSS Color Level 4.
const OKLAB_TO_LMS = {
  lA: 0.396_337_777_4,
  lB: 0.215_803_757_3,
  mA: -0.105_561_345_8,
  mB: -0.063_854_172_8,
  sA: -0.089_484_177_5,
  sB: -1.291_485_548,
} as const

const LMS_TO_LINEAR_SRGB = {
  bL: -0.004_196_086_3,
  bM: -0.703_418_614_7,
  bS: 1.707_614_701,
  gL: -1.268_438_004_6,
  gM: 2.609_757_401_1,
  gS: -0.341_319_396_5,
  rL: 4.076_741_662_1,
  rM: -3.307_711_591_3,
  rS: 0.230_969_929_2,
} as const

const SRGB_LINEAR_THRESHOLD = 0.003_130_8
const SRGB_DECODE_THRESHOLD = 0.040_45
const SRGB_A = 0.055
const SRGB_GAMMA = 2.4
const SRGB_PHI = 12.92

function parseOklch(value: string): OklchColor {
  const match = /oklch\(\s*(?<lightness>[\d.]+)\s+(?<chroma>[\d.]+)\s+(?<hue>[\d.]+)/u.exec(value)
  if (!match?.groups?.lightness || !match.groups.chroma || !match.groups.hue) {
    throw new Error(`Expected oklch() color, received: ${value}`)
  }

  return {
    chroma: Number(match.groups.chroma),
    hue: Number(match.groups.hue),
    lightness: Number(match.groups.lightness),
  }
}

function linearToEncodedSrgb(channel: number): number {
  const clamped = Math.min(Math.max(channel, 0), 1)
  if (clamped <= SRGB_LINEAR_THRESHOLD) {
    return SRGB_PHI * clamped
  }
  return (1 + SRGB_A) * clamped ** (1 / SRGB_GAMMA) - SRGB_A
}

function encodedSrgbToLinear(channel: number): number {
  if (channel <= SRGB_DECODE_THRESHOLD) {
    return channel / SRGB_PHI
  }
  return ((channel + SRGB_A) / (1 + SRGB_A)) ** SRGB_GAMMA
}

function relativeLuminance(color: OklchColor): number {
  const hueRadians = (color.hue * Math.PI) / 180
  const aAxis = color.chroma * Math.cos(hueRadians)
  const bAxis = color.chroma * Math.sin(hueRadians)

  const lCone = color.lightness + OKLAB_TO_LMS.lA * aAxis + OKLAB_TO_LMS.lB * bAxis
  const mCone = color.lightness + OKLAB_TO_LMS.mA * aAxis + OKLAB_TO_LMS.mB * bAxis
  const sCone = color.lightness + OKLAB_TO_LMS.sA * aAxis + OKLAB_TO_LMS.sB * bAxis

  const lCube = lCone ** 3
  const mCube = mCone ** 3
  const sCube = sCone ** 3

  const linearRed = LMS_TO_LINEAR_SRGB.rL * lCube + LMS_TO_LINEAR_SRGB.rM * mCube + LMS_TO_LINEAR_SRGB.rS * sCube
  const linearGreen = LMS_TO_LINEAR_SRGB.gL * lCube + LMS_TO_LINEAR_SRGB.gM * mCube + LMS_TO_LINEAR_SRGB.gS * sCube
  const linearBlue = LMS_TO_LINEAR_SRGB.bL * lCube + LMS_TO_LINEAR_SRGB.bM * mCube + LMS_TO_LINEAR_SRGB.bS * sCube

  const red = encodedSrgbToLinear(linearToEncodedSrgb(linearRed))
  const green = encodedSrgbToLinear(linearToEncodedSrgb(linearGreen))
  const blue = encodedSrgbToLinear(linearToEncodedSrgb(linearBlue))

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrastRatio(foreground: OklchColor, background: OklchColor): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background))
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

function extractThemeBlock(css: string, selector: string): string {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) {
    throw new Error(`Theme block not found: ${selector}`)
  }

  let depth = 0
  for (let index = start; index < css.length; index += 1) {
    const character = css[index]
    if (character === '{') {
      depth += 1
    } else if (character === '}') {
      depth -= 1
      if (depth === 0) {
        return css.slice(start, index + 1)
      }
    }
  }

  throw new Error(`Unclosed theme block: ${selector}`)
}

function parseOklchTokens(block: string): Record<string, string> {
  const tokens: Record<string, string> = {}
  const tokenPattern = /--(?<name>[a-z0-9-]+):\s*(?<value>oklch\([^)]+\))/giu

  for (const match of block.matchAll(tokenPattern)) {
    const name = match.groups?.name
    const value = match.groups?.value
    if (name && value) {
      tokens[name] = value
    }
  }

  return tokens
}

function ratioOf(tokens: Record<string, string>, foreground: string, background: string): number {
  const foregroundValue = tokens[foreground]
  const backgroundValue = tokens[background]
  if (!foregroundValue || !backgroundValue) {
    throw new Error(`Missing token ${foreground} or ${background}`)
  }
  return contrastRatio(parseOklch(foregroundValue), parseOklch(backgroundValue))
}

function failingPairs(
  tokens: Record<string, string>,
  pairs: readonly (readonly [string, string])[],
  minimum: number,
): string[] {
  const failures: string[] = []
  for (const [foreground, background] of pairs) {
    const ratio = ratioOf(tokens, foreground, background)
    if (ratio < minimum) {
      failures.push(`${foreground} on ${background} ${ratio.toFixed(2)}:1`)
    }
  }
  return failures
}

const light = parseOklchTokens(extractThemeBlock(themeCss, ':root'))
const dark = parseOklchTokens(extractThemeBlock(themeCss, '.dark'))

const textPairs = [
  ['foreground', 'background'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'muted'],
  ['muted-foreground', 'card'],
  ['primary-foreground', 'primary'],
  ['primary', 'background'],
  ['primary', 'card'],
  ['secondary-foreground', 'secondary'],
  ['accent-foreground', 'accent'],
  ['destructive-foreground', 'destructive'],
  ['destructive', 'background'],
  ['destructive', 'card'],
  ['success-foreground', 'success'],
  ['success', 'background'],
  ['success', 'card'],
] as const

const inputPairs = [
  ['input', 'background'],
  ['input', 'card'],
] as const

const separatorPairs = [
  ['border', 'background'],
  ['border', 'card'],
] as const

describe('oklch contrast math', () => {
  it('returns 21:1 for black on white', () => {
    expect(contrastRatio(parseOklch('oklch(0 0 0)'), parseOklch('oklch(1 0 0)'))).toBeCloseTo(21, 0)
  })
})

describe('theme tokens meet WCAG AA', () => {
  it('light text pairs are at least 4.5:1', () => {
    expect(failingPairs(light, textPairs, WCAG_AA_TEXT)).toStrictEqual([])
  })

  it('dark text pairs are at least 4.5:1', () => {
    expect(failingPairs(dark, textPairs, WCAG_AA_TEXT)).toStrictEqual([])
  })

  it('light input edges are at least 3:1', () => {
    expect(failingPairs(light, inputPairs, WCAG_AA_UI)).toStrictEqual([])
  })

  it('dark input edges are at least 3:1', () => {
    expect(failingPairs(dark, inputPairs, WCAG_AA_UI)).toStrictEqual([])
  })

  it('dark separators stay visible against surfaces', () => {
    expect(failingPairs(dark, separatorPairs, VISIBLE_SEPARATOR)).toStrictEqual([])
  })

  it('light separators stay distinguishable against surfaces', () => {
    expect(failingPairs(light, separatorPairs, LIGHT_SEPARATOR_MIN)).toStrictEqual([])
  })
})
