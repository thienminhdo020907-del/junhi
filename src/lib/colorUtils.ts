export interface RGB {
  r: number
  g: number
  b: number
}

export interface HSL {
  h: number // 0 - 360
  s: number // 0 - 100
  l: number // 0 - 100
}

export function parseHex(hex: string): RGB {
  let cleaned = hex.trim().replace(/^#/, '')
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (cleaned.length < 6) {
    return { r: 0, g: 0, b: 0 }
  }
  const num = parseInt(cleaned.slice(0, 6), 16)
  if (Number.isNaN(num)) return { r: 0, g: 0, b: 0 }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)))
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
        break
      case gNorm:
        h = (bNorm - rNorm) / d + 2
        break
      case bNorm:
        h = (rNorm - gNorm) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let rPrime = 0
  let gPrime = 0
  let bPrime = 0

  if (h >= 0 && h < 60) {
    rPrime = c
    gPrime = x
  } else if (h >= 60 && h < 120) {
    rPrime = x
    gPrime = c
  } else if (h >= 120 && h < 180) {
    gPrime = c
    bPrime = x
  } else if (h >= 180 && h < 240) {
    gPrime = x
    bPrime = c
  } else if (h >= 240 && h < 300) {
    rPrime = x
    bPrime = c
  } else if (h >= 300 && h <= 360) {
    rPrime = c
    bPrime = x
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  }
}

export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl))
}

export function hexToHsl(hex: string): HSL {
  return rgbToHsl(parseHex(hex))
}

/** Calculate Relative Luminance per WCAG 2.1 specs */
export function getRelativeLuminance(rgb: RGB): number {
  const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
}

/** Returns contrast ratio between color1 and color2 (1:1 to 21:1) */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(parseHex(hex1))
  const l2 = getRelativeLuminance(parseHex(hex2))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Checks whether contrast ratio meets 4.5:1 (WCAG AA normal text) */
export function isContrastAdequate(bgHex: string, textHex: string, minRatio = 4.5): boolean {
  return getContrastRatio(bgHex, textHex) >= minRatio
}

/** Automatically picks or fixes text color against a background to guarantee >= 4.5:1 contrast */
export function autoFixTextColor(bgHex: string, preferredTextHex = '#2B2724'): string {
  if (isContrastAdequate(bgHex, preferredTextHex)) {
    return preferredTextHex
  }

  const bgLum = getRelativeLuminance(parseHex(bgHex))
  // If background is bright, try very dark colors; if background is dark, try light colors
  if (bgLum > 0.4) {
    const darkCandidates = ['#1A1715', '#2B2724', '#0F172A', '#111827', '#000000']
    for (const c of darkCandidates) {
      if (getContrastRatio(bgHex, c) >= 4.5) return c
    }
    return '#000000'
  } else {
    const lightCandidates = ['#F5F2EC', '#FFFFFF', '#F8FAFC', '#F1F5F9', '#FFFBEB']
    for (const c of lightCandidates) {
      if (getContrastRatio(bgHex, c) >= 4.5) return c
    }
    return '#FFFFFF'
  }
}

/** Given an accent color, generates the ideal contrast text (light or dark) */
export function getAccentContrast(accentHex: string): string {
  const darkRatio = getContrastRatio(accentHex, '#2B2724')
  const lightRatio = getContrastRatio(accentHex, '#F5F2EC')
  return darkRatio >= lightRatio ? '#2B2724' : '#F5F2EC'
}

/** Tự sinh bảng màu tối dịu mắt từ bảng màu sáng */
export function generateDarkPaletteFromLight(lightBg: string, _lightSurface?: string): {
  bg: string
  surface: string
  surface2: string
  text: string
  textMuted: string
  border: string
  borderStrong: string
} {
  const bgHsl = hexToHsl(lightBg)
  const darkBgHsl: HSL = {
    h: bgHsl.h,
    s: Math.min(bgHsl.s * 0.4, 25),
    l: 11,
  }
  const darkSurfaceHsl: HSL = {
    h: bgHsl.h,
    s: Math.min(bgHsl.s * 0.35, 20),
    l: 16,
  }
  const darkSurface2Hsl: HSL = {
    h: bgHsl.h,
    s: Math.min(bgHsl.s * 0.35, 20),
    l: 21,
  }

  return {
    bg: hslToHex(darkBgHsl),
    surface: hslToHex(darkSurfaceHsl),
    surface2: hslToHex(darkSurface2Hsl),
    text: '#F5F2EC',
    textMuted: '#B8AFA4',
    border: 'rgba(255, 255, 255, 0.14)',
    borderStrong: 'rgba(255, 255, 255, 0.35)',
  }
}
