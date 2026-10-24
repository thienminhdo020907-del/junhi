import type { FontOption } from '@/types/theme'

export const HEADING_FONTS: FontOption[] = [
  {
    name: 'Playfair Display Italic',
    family: "'Playfair Display', Georgia, serif",
    category: 'serif',
    vietnamese: true,
    googleFontKey: 'Playfair+Display:ital,wght@1,400;1,600;1,700',
  },
  {
    name: 'Instrument Serif Italic',
    family: "'Instrument Serif', Georgia, serif",
    category: 'serif',
    vietnamese: false,
    googleFontKey: 'Instrument+Serif:ital@0;1',
  },
  {
    name: 'Lora',
    family: "'Lora', Georgia, serif",
    category: 'serif',
    vietnamese: true,
    googleFontKey: 'Lora:ital,wght@0,500;0,700;1,400;1,600',
  },
  {
    name: 'DM Serif Display',
    family: "'DM Serif Display', serif",
    category: 'serif',
    vietnamese: false,
    googleFontKey: 'DM+Serif+Display',
  },
  {
    name: 'Fraunces',
    family: "'Fraunces', serif",
    category: 'serif',
    vietnamese: true,
    googleFontKey: 'Fraunces:ital,opsz,wght@0,9..144,500;1,9..144,600',
  },
  {
    name: 'Caveat',
    family: "'Caveat', cursive",
    category: 'handwriting',
    vietnamese: false,
    googleFontKey: 'Caveat:wght@500;700',
  },
  {
    name: 'Patrick Hand',
    family: "'Patrick Hand', cursive",
    category: 'handwriting',
    vietnamese: true,
    googleFontKey: 'Patrick+Hand',
  },
  {
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    category: 'display',
    vietnamese: true,
    googleFontKey: 'Space+Grotesk:wght@500;700',
  },
  {
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'sans',
    vietnamese: true,
    googleFontKey: 'Inter:wght@400;600;800',
  },
  {
    name: 'Pixelify Sans',
    family: "'Pixelify Sans', monospace",
    category: 'display',
    vietnamese: false,
    googleFontKey: 'Pixelify+Sans:wght@500;700',
  },
]

export const BODY_FONTS: FontOption[] = [
  {
    name: 'DM Sans',
    family: "'DM Sans', sans-serif",
    category: 'sans',
    vietnamese: true,
    googleFontKey: 'DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600',
  },
  {
    name: 'Inter',
    family: "'Inter', sans-serif",
    category: 'sans',
    vietnamese: true,
    googleFontKey: 'Inter:wght@400;500;600',
  },
  {
    name: 'Nunito',
    family: "'Nunito', sans-serif",
    category: 'sans',
    vietnamese: true,
    googleFontKey: 'Nunito:ital,wght@0,400;0,600;1,400',
  },
  {
    name: 'Be Vietnam Pro',
    family: "'Be Vietnam Pro', sans-serif",
    category: 'sans',
    vietnamese: true,
    googleFontKey: 'Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;1,400',
  },
  {
    name: 'Quicksand',
    family: "'Quicksand', sans-serif",
    category: 'sans',
    vietnamese: true,
    googleFontKey: 'Quicksand:wght@400;500;600',
  },
  {
    name: 'Lora',
    family: "'Lora', Georgia, serif",
    category: 'serif',
    vietnamese: true,
    googleFontKey: 'Lora:ital,wght@0,400;0,500;1,400',
  },
  {
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', monospace",
    category: 'mono',
    vietnamese: true,
    googleFontKey: 'JetBrains+Mono:wght@400;500',
  },
]

const loadedFonts = new Set<string>()

/** Dynamically loads a Google Font by name on demand with font-display: swap */
export function loadFontOnDemand(fontOption?: FontOption): void {
  if (!fontOption?.googleFontKey) return
  if (typeof document === 'undefined') return
  if (loadedFonts.has(fontOption.googleFontKey)) return

  loadedFonts.add(fontOption.googleFontKey)
  const linkId = `google-font-${fontOption.name.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(linkId)) return

  const link = document.createElement('link')
  link.id = linkId
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${fontOption.googleFontKey}&display=swap`
  document.head.appendChild(link)
}
