import { useState, useRef, useEffect } from 'react'
import { Pipette, X } from 'lucide-react'
import {
  hexToHsl,
  hslToHex,
  type HSL,
} from '@/lib/colorUtils'

interface Props {
  color: string
  label: string
  presets?: { name: string; hex: string }[]
  onChange: (hex: string) => void
  onClose: () => void
}

export default function ColorPickerPopover({
  color,
  label,
  presets = [],
  onChange,
  onClose,
}: Props) {
  const [hexInput, setHexInput] = useState(color)
  const [hsl, setHsl] = useState<HSL>(() => hexToHsl(color))
  const popoverRef = useRef<HTMLDivElement | null>(null)

  // Sync when prop changes
  useEffect(() => {
    setHexInput(color)
    setHsl(hexToHsl(color))
  }, [color])

  // Click outside to close
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onClose])

  const handleHexChange = (val: string) => {
    setHexInput(val)
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      onChange(val.toUpperCase())
      setHsl(hexToHsl(val))
    }
  }

  const handleHslChange = (nextHsl: Partial<HSL>) => {
    const merged = { ...hsl, ...nextHsl }
    setHsl(merged)
    const newHex = hslToHex(merged)
    setHexInput(newHex)
    onChange(newHex)
  }

  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eyeDropper = new (window as any).EyeDropper()
        const result = await eyeDropper.open()
        if (result?.sRGBHex) {
          const hex = result.sRGBHex.toUpperCase()
          setHexInput(hex)
          setHsl(hexToHsl(hex))
          onChange(hex)
        }
      } catch {
        // user canceled
      }
    }
  }

  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 text-[var(--text)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--text)]">{label}</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <X size={14} />
        </button>
      </div>

      {/* Preset colors */}
      {presets.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase">
            Màu gợi ý
          </p>
          <div className="grid grid-cols-6 gap-1.5">
            {presets.map((p) => {
              const isSelected = p.hex.toLowerCase() === color.toLowerCase()
              return (
                <button
                  key={p.hex}
                  type="button"
                  title={p.name}
                  onClick={() => {
                    setHexInput(p.hex)
                    setHsl(hexToHsl(p.hex))
                    onChange(p.hex)
                  }}
                  className={`size-6 rounded-lg border transition-all ${
                    isSelected
                      ? 'scale-110 border-[var(--text)] ring-2 ring-[var(--accent)]'
                      : 'border-[var(--border)] hover:scale-105'
                  }`}
                  style={{ backgroundColor: p.hex }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* HSL Sliders */}
      <div className="mb-3 space-y-2 text-xs">
        <div>
          <div className="mb-1 flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>Sắc độ (Hue)</span>
            <span>{hsl.h}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={hsl.h}
            onChange={(e) => handleHslChange({ h: Number(e.target.value) })}
            className="h-2 w-full appearance-none rounded-lg cursor-pointer"
            style={{
              background:
                'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)',
            }}
          />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>Độ bão hòa (Sat)</span>
            <span>{hsl.s}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={hsl.s}
            onChange={(e) => handleHslChange({ s: Number(e.target.value) })}
            className="h-2 w-full appearance-none rounded-lg cursor-pointer bg-[var(--surface)]"
          />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-[10px] text-[var(--text-muted)]">
            <span>Độ sáng (Light)</span>
            <span>{hsl.l}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={hsl.l}
            onChange={(e) => handleHslChange({ l: Number(e.target.value) })}
            className="h-2 w-full appearance-none rounded-lg cursor-pointer bg-[var(--surface)]"
          />
        </div>
      </div>

      {/* Hex input & Eyedropper */}
      <div className="flex items-center gap-2">
        <div
          className="size-8 shrink-0 rounded-xl border border-[var(--border)] shadow-xs"
          style={{ backgroundColor: color }}
        />
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#FFFFFF"
          className="h-8 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 font-mono text-xs text-[var(--text)] uppercase outline-none focus:border-[var(--accent)]"
        />
        {hasEyeDropper && (
          <button
            type="button"
            title="Lấy màu từ màn hình"
            onClick={handleEyeDropper}
            className="flex size-8 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)] active:scale-95"
          >
            <Pipette size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
