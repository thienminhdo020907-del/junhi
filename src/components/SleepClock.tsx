import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import confetti from 'canvas-confetti'

interface SleepClockProps {
  value: number | null
  onChange: (sleepHours: number) => void
}

const CX = 130
const CY = 130
const RADIUS = 92
const SNAP_MINUTES = 15 // Snap theo 15 phút
const SNAP_STEP = SNAP_MINUTES / 60 // 0.25 giờ

// Chuyển giờ thập phân (0-24) sang radian và tọa độ (0h ở đỉnh trên cùng)
function timeToAngle(hours: number) {
  return (hours / 24) * 360
}

function timeToCoords(hours: number) {
  const angle = timeToAngle(hours)
  const rad = ((angle - 90) * Math.PI) / 180
  return {
    x: CX + RADIUS * Math.cos(rad),
    y: CY + RADIUS * Math.sin(rad),
  }
}

// Chuyển tọa độ con trỏ (x, y) so với tâm thành giờ thập phân (0-24)
function coordsToTime(x: number, y: number) {
  const dx = x - CX
  const dy = y - CY
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90
  if (angle < 0) angle += 360

  const rawHours = (angle / 360) * 24
  const snapped = Math.round(rawHours / SNAP_STEP) * SNAP_STEP
  return snapped >= 24 ? 0 : snapped
}

// Định dạng giờ hiển thị HH:mm
function formatHourMinute(hoursFloat: number) {
  const h = Math.floor(hoursFloat)
  const m = Math.round((hoursFloat - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Vẽ cung tròn SVG từ giờ đi ngủ đến giờ thức dậy
function describeArc(startHour: number, endHour: number) {
  const start = timeToCoords(startHour)
  const end = timeToCoords(endHour)

  let sweepHours = endHour - startHour
  if (sweepHours < 0) sweepHours += 24

  const largeArcFlag = sweepHours > 12 ? 1 : 0

  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

// Component cuộn số dọc
function RollingNumber({ value }: { value: string | number }) {
  const prefersReduced = useReducedMotion()

  return (
    <div className="relative inline-flex h-8 w-7 items-center justify-center overflow-hidden font-bold">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(value)}
          initial={prefersReduced ? { opacity: 0 } : { y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReduced ? { opacity: 0 } : { y: -16, opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="absolute text-2xl tracking-tight text-white select-none"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export default function SleepClock({ value, onChange }: SleepClockProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const gradientId = useId()
  const prefersReduced = useReducedMotion()

  // Khởi tạo: Mặc định đi ngủ lúc 23:00, thức dậy theo value nếu có (hoặc 07:00 nếu chưa có)
  const [bedtime, setBedtime] = useState<number>(23)
  const [waketime, setWaketime] = useState<number>(() => {
    if (value != null && value > 0 && value <= 24) {
      return (23 + value) % 24
    }
    return 7
  })

  const [activeThumb, setActiveThumb] = useState<'bed' | 'wake' | null>(null)
  const lastConfettiTrigger = useRef<number>(0)

  // Tính tổng thời lượng ngủ
  const duration = useMemo(() => {
    let diff = waketime - bedtime
    if (diff < 0) diff += 24
    return Math.round(diff * 100) / 100
  }, [bedtime, waketime])

  const durHours = Math.floor(duration)
  const durMinutes = Math.round((duration - durHours) * 60)

  // Cập nhật giá trị ra component cha
  const notifyChange = useCallback(
    (b: number, w: number) => {
      let diff = w - b
      if (diff < 0) diff += 24
      const hours = Math.round(diff * 10) / 10
      onChange(hours)
    },
    [onChange],
  )

  // Hiệu ứng pháo giấy confetti khi ngủ 7 - 9 giờ lý tưởng
  useEffect(() => {
    if (duration >= 7 && duration <= 9) {
      const now = Date.now()
      if (now - lastConfettiTrigger.current > 4000) {
        lastConfettiTrigger.current = now
        confetti({
          particleCount: 28,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#a78bfa', '#38bdf8', '#34d399', '#fde047'],
          disableForReducedMotion: true,
        })
      }
    }
  }, [duration])

  // Xử lý kéo núm tròn
  const handlePointerDown = (type: 'bed' | 'wake') => (e: React.PointerEvent) => {
    e.preventDefault()
    setActiveThumb(type)
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeThumb || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 260
    const y = ((e.clientY - rect.top) / rect.height) * 260
    const time = coordsToTime(x, y)

    if (activeThumb === 'bed') {
      setBedtime(time)
      notifyChange(time, waketime)
    } else {
      setWaketime(time)
      notifyChange(bedtime, time)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeThumb) {
      setActiveThumb(null)
      try {
        ;(e.target as Element).releasePointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    }
  }

  // Điều khiển bằng phím mũi tên (mỗi lần tăng/giảm 15 phút)
  const handleKeyDown = (type: 'bed' | 'wake') => (e: React.KeyboardEvent) => {
    let delta = 0
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      delta = SNAP_STEP
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      delta = -SNAP_STEP
    }

    if (delta !== 0) {
      e.preventDefault()
      if (type === 'bed') {
        const next = (bedtime + delta + 24) % 24
        setBedtime(next)
        notifyChange(next, waketime)
      } else {
        const next = (waketime + delta + 24) % 24
        setWaketime(next)
        notifyChange(bedtime, next)
      }
    }
  }

  const bedCoords = timeToCoords(bedtime)
  const wakeCoords = timeToCoords(waketime)
  const arcPath = describeArc(bedtime, waketime)

  // Đánh giá giấc ngủ
  const isOptimal = duration >= 7 && duration <= 9
  const isShort = duration < 6

  // Nền chuyển gradient theo khung giờ đi ngủ & thức dậy
  const bgTheme = useMemo(() => {
    if (duration >= 7 && duration <= 9) {
      return 'from-slate-950 via-indigo-950 to-purple-950 border-purple-500/30'
    }
    if (isShort) {
      return 'from-zinc-950 via-slate-900 to-stone-900 border-zinc-700/30'
    }
    return 'from-slate-950 via-slate-900 to-indigo-950 border-indigo-500/30'
  }, [duration, isShort])

  // Vị trí các ngôi sao trang trí trong nền đêm
  const stars = useMemo(
    () => [
      { top: '15%', left: '20%', size: 2, delay: 0 },
      { top: '25%', left: '80%', size: 3, delay: 0.8 },
      { top: '75%', left: '18%', size: 2.5, delay: 1.4 },
      { top: '80%', left: '78%', size: 2, delay: 0.4 },
      { top: '48%', left: '88%', size: 1.5, delay: 1.1 },
      { top: '40%', left: '12%', size: 2, delay: 1.7 },
    ],
    [],
  )

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-b p-5 text-white shadow-lg transition-all duration-700 ${bgTheme}`}
    >
      {/* Sao đêm nhấp nháy */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {stars.map((s, idx) => (
          <div
            key={idx}
            className={`absolute rounded-full bg-white/70 ${prefersReduced ? '' : 'animate-pulse'}`}
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: `${s.delay}s`,
              animationDuration: '2.5s',
            }}
          />
        ))}
      </div>

      {/* Tiêu đề & Thông số */}
      <div className="relative z-1 mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
            Hiểu giấc ngủ của bạn
          </p>
          <p className="text-sm font-medium text-white/90">Kéo hai núm trăng và mặt trời</p>
        </div>

        {/* Trạng thái giấc ngủ */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md transition-all ${
            isOptimal
              ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
              : isShort
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40'
                : 'bg-white/10 text-white/80 ring-1 ring-white/20'
          }`}
        >
          {isOptimal && '✨ Ngủ lý tưởng (7–9h)'}
          {isShort && '⚠️ Thiếu ngủ (< 6h)'}
          {!isOptimal && !isShort && 'Bình thường'}
        </div>
      </div>

      {/* SVG Đồng hồ 24 giờ */}
      <div className="relative mx-auto my-2 flex max-w-[280px] items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 260 260"
          className="w-full touch-none select-none drop-shadow-md"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <defs>
            {/* Gradient cho cung tròn thời gian ngủ */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>

            {/* Bộ lọc ánh hào quang trăng sáng */}
            <filter id="moon-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Vòng tròn nền 24h mờ */}
          <circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={14}
            strokeLinecap="round"
          />

          {/* Các mốc giờ chính trên đồng hồ (0h/24h, 6h, 12h, 18h) */}
          {[
            { hour: 0, label: '00:00' },
            { hour: 6, label: '06:00' },
            { hour: 12, label: '12:00' },
            { hour: 18, label: '18:00' },
          ].map(({ hour, label }) => {
            const rad = ((timeToAngle(hour) - 90) * Math.PI) / 180
            const x = CX + (RADIUS - 22) * Math.cos(rad)
            const y = CY + (RADIUS - 22) * Math.sin(rad)
            return (
              <text
                key={hour}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(255, 255, 255, 0.4)"
                fontSize="9"
                fontWeight="500"
              >
                {label}
              </text>
            )
          })}

          {/* Vạch chia nhỏ 24 giờ */}
          {Array.from({ length: 24 }).map((_, i) => {
            const rad = ((timeToAngle(i) - 90) * Math.PI) / 180
            const x1 = CX + (RADIUS + 11) * Math.cos(rad)
            const y1 = CY + (RADIUS + 11) * Math.sin(rad)
            const x2 = CX + (RADIUS + (i % 6 === 0 ? 15 : 13)) * Math.cos(rad)
            const y2 = CY + (RADIUS + (i % 6 === 0 ? 15 : 13)) * Math.sin(rad)
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 6 === 0 ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)'}
                strokeWidth={i % 6 === 0 ? 1.5 : 1}
              />
            )
          })}

          {/* Cung thời gian ngủ tô gradient */}
          {duration > 0 && (
            <path
              d={arcPath}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={14}
              strokeLinecap="round"
            />
          )}

          {/* Núm Giờ Đi Ngủ 🌙 */}
          <g
            tabIndex={0}
            role="slider"
            aria-label="Giờ đi ngủ"
            aria-valuemin={0}
            aria-valuemax={24}
            aria-valuenow={bedtime}
            aria-valuetext={formatHourMinute(bedtime)}
            onKeyDown={handleKeyDown('bed')}
            onPointerDown={handlePointerDown('bed')}
            className="cursor-grab outline-none focus:scale-110 active:cursor-grabbing"
            style={{ transformOrigin: `${bedCoords.x}px ${bedCoords.y}px` }}
          >
            {/* Vòng tròn hào quang trăng */}
            <circle
              cx={bedCoords.x}
              cy={bedCoords.y}
              r={18}
              fill="#312e81"
              stroke={isOptimal ? '#a855f7' : isShort ? '#64748b' : '#6366f1'}
              strokeWidth={2}
              filter={isOptimal ? 'url(#moon-glow)' : undefined}
              opacity={isShort ? 0.6 : 1}
            />
            <text
              x={bedCoords.x}
              y={bedCoords.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="14"
              className="pointer-events-none select-none"
              opacity={isShort ? 0.5 : isOptimal ? 1 : 0.9}
            >
              🌙
            </text>
          </g>

          {/* Núm Giờ Thức Dậy ☀️ */}
          <g
            tabIndex={0}
            role="slider"
            aria-label="Giờ thức dậy"
            aria-valuemin={0}
            aria-valuemax={24}
            aria-valuenow={waketime}
            aria-valuetext={formatHourMinute(waketime)}
            onKeyDown={handleKeyDown('wake')}
            onPointerDown={handlePointerDown('wake')}
            className="cursor-grab outline-none focus:scale-110 active:cursor-grabbing"
            style={{ transformOrigin: `${wakeCoords.x}px ${wakeCoords.y}px` }}
          >
            <circle
              cx={wakeCoords.x}
              cy={wakeCoords.y}
              r={18}
              fill="#ea580c"
              stroke="#fed7aa"
              strokeWidth={2}
              className="shadow-sm"
            />
            <text
              x={wakeCoords.x}
              y={wakeCoords.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="14"
              className="pointer-events-none select-none"
            >
              ☀️
            </text>
          </g>
        </svg>

        {/* Nội dung ở giữa vòng tròn: Tổng giờ ngủ với hiệu ứng cuốn số dọc */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-medium tracking-wider text-indigo-300 uppercase">
            Thời lượng
          </p>

          <div className="flex items-baseline justify-center gap-0.5">
            {/* Giờ */}
            <RollingNumber value={durHours} />
            <span className="text-xs font-semibold text-white/70">h</span>

            {/* Phút */}
            <RollingNumber value={String(durMinutes).padStart(2, '0')} />
            <span className="text-xs font-semibold text-white/70">m</span>
          </div>

          <p className="mt-0.5 text-[10px] text-white/60">
            {formatHourMinute(bedtime)} → {formatHourMinute(waketime)}
          </p>
        </div>
      </div>

      {/* Chú thích điều khiển */}
      <div className="relative z-1 mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-indigo-200/80">
        <div className="flex items-center gap-2">
          <span>🌙 Ngủ: <strong className="text-white">{formatHourMinute(bedtime)}</strong></span>
          <span>•</span>
          <span>☀️ Dậy: <strong className="text-white">{formatHourMinute(waketime)}</strong></span>
        </div>
        <p className="hidden text-white/50 sm:block">Kéo núm hoặc dùng mũi tên phím (±15p)</p>
      </div>
    </div>
  )
}
