import { useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useTheme } from '@/context/useTheme'
import { Sparkles, Palette } from 'lucide-react'

// Bộ 16 công cụ MS Paint kinh điển
const PAINT_TOOLS = [
  { id: 'free-select', icon: '⭐', label: 'Chọn tự do' },
  { id: 'rect-select', icon: '⬚', label: 'Chọn vùng chữ nhật' },
  { id: 'eraser', icon: '🧼', label: 'Tẩy xóa' },
  { id: 'bucket', icon: '🪣', label: 'Đổ màu' },
  { id: 'picker', icon: '💉', label: 'Hút màu' },
  { id: 'zoom', icon: '🔍', label: 'Phóng to' },
  { id: 'pencil', icon: '✏️', label: 'Bút chì' },
  { id: 'brush', icon: '🖌️', label: 'Cọ vẽ' },
  { id: 'airbrush', icon: '💨', label: 'Bình xịt màu' },
  { id: 'text', icon: 'A', label: 'Viết chữ' },
  { id: 'line', icon: '╱', label: 'Đường thẳng' },
  { id: 'curve', icon: '〰️', label: 'Đường cong' },
  { id: 'rect', icon: '▭', label: 'Hình chữ nhật' },
  { id: 'polygon', icon: '⬟', label: 'Đa giác' },
  { id: 'ellipse', icon: '⬭', label: 'Hình elip' },
  { id: 'round-rect', icon: '▢', label: 'Chữ nhật bo góc' },
]

// 28 màu sắc kinh điển của bảng màu MS Paint
const PAINT_PALETTE = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080',
  '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff',
  '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#7c6cf0', '#ff80ff', '#ff8040',
]

export default function RetroWin95Wrapper({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  const [activeTool, setActiveTool] = useState('pencil')
  const [selectedColor, setSelectedColor] = useState('#7c6cf0')
  const [statusMessage, setStatusMessage] = useState('Sẵn sàng. Kéo thả để khám phá tâm trạng hôm nay.')

  if (theme !== 'win95') {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden p-2 sm:p-4 md:p-6 select-none">
      {/* NỀN HALFTONE CHẤM BI RETRO Y2K */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#e8f3fe] [background-image:radial-gradient(#93c5fd_22%,transparent_23%),radial-gradient(#60a5fa_18%,transparent_19%)] [background-size:26px_26px] [background-position:0_0,13px_13px]" />

      {/* STICKER NGÔI SAO VÀNG GÓC TRÊN TRÁI */}
      <div className="pointer-events-none fixed top-4 left-4 z-20 animate-pulse hidden lg:block">
        <svg width="70" height="70" viewBox="0 0 100 100" fill="#fde047" className="drop-shadow-md">
          <polygon points="50,0 63,35 100,50 63,65 50,100 37,65 0,50 37,35" />
        </svg>
      </div>

      {/* STICKER CHÚ ẾCH ĐÁNG YÊU GÓC TRÊN PHẢI (THEO ẢNH PINTEREST) */}
      <div className="pointer-events-none fixed top-2 right-4 sm:right-12 z-40 transition-transform hover:scale-110">
        <div className="relative flex flex-col items-center">
          <div className="text-5xl sm:text-6xl drop-shadow-lg filter select-none">🐸</div>
          <span className="rounded-md border border-black/20 bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 shadow-xs">
            Ribbit!
          </span>
        </div>
      </div>

      {/* STICKER ĐÀN CÁ VÀNG BƠI GÓC DƯỚI TRÁI */}
      <div className="pointer-events-none fixed bottom-12 left-2 z-20 hidden md:block">
        <div className="relative space-y-2">
          <div className="animate-bounce text-4xl drop-shadow-md" style={{ animationDuration: '3s' }}>
            🐠
          </div>
          <div className="translate-x-4 text-3xl drop-shadow-sm">🐟</div>
        </div>
      </div>

      {/* STICKER NGÔI SAO VÀNG GÓC DƯỚI PHẢI */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-20 hidden sm:block">
        <svg width="65" height="65" viewBox="0 0 100 100" fill="#facc15" className="drop-shadow-md">
          <polygon points="50,0 60,30 95,35 68,60 77,95 50,75 23,95 32,60 5,35 40,30" />
        </svg>
      </div>

      {/* CỬA SỔ CHÍNH WINDOWS 95 / MS PAINT */}
      <div className="mx-auto max-w-6xl border-2 border-t-white border-l-white border-r-[#000] border-b-[#000] bg-[#c0c0c0] shadow-[2px_2px_0px_#808080] font-sans">
        {/* THANH TIÊU ĐỀ TITLEBAR XANH ĐẬM KINH ĐIỂN */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#000080] via-[#0000aa] to-[#1084d0] px-2 py-1 text-white">
          <div className="flex items-center gap-2">
            <span className="text-base">🎨</span>
            <span className="text-xs sm:text-sm font-bold tracking-wide font-mono">
              Junhi - Nhật ký & Tâm trạng [untitled - Paint]
            </span>
          </div>

          {/* CÁC NÚT ĐIỀU KHIỂN CỬA SỔ: _ □ ✕ */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="Chuyển về giao diện Hiện đại"
              onClick={() => setTheme('modern')}
              className="flex items-center gap-1 border-t-white border-l-white border-r-[#000] border-b-[#000] border bg-[#c0c0c0] px-1.5 py-0.5 text-[11px] font-bold text-black active:border-t-[#000] active:border-l-[#000] active:border-r-white active:border-b-white"
            >
              <Sparkles size={11} className="text-indigo-600" /> Hiện đại
            </button>
            <div className="flex h-5 items-center gap-0.5">
              <button
                type="button"
                className="flex size-5 items-center justify-center border border-t-white border-l-white border-r-[#000] border-b-[#000] bg-[#c0c0c0] text-[10px] font-bold text-black active:border-t-[#000] active:border-l-[#000] active:border-r-white active:border-b-white"
              >
                _
              </button>
              <button
                type="button"
                className="flex size-5 items-center justify-center border border-t-white border-l-white border-r-[#000] border-b-[#000] bg-[#c0c0c0] text-[10px] font-bold text-black active:border-t-[#000] active:border-l-[#000] active:border-r-white active:border-b-white"
              >
                □
              </button>
              <button
                type="button"
                onClick={() => setTheme('modern')}
                title="Đóng giao diện Retro Win95"
                className="flex size-5 items-center justify-center border border-t-white border-l-white border-r-[#000] border-b-[#000] bg-[#c0c0c0] text-[10px] font-bold text-black hover:bg-rose-500 hover:text-white active:border-t-[#000] active:border-l-[#000] active:border-r-white active:border-b-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* THANH MENU KINH ĐIỂN CÓ GẠCH CHÂN PHÍM TẮT */}
        <div className="flex flex-wrap items-center gap-3 border-b border-[#808080] bg-[#c0c0c0] px-3 py-1 text-xs text-black shadow-[inset_0_-1px_0_#fff]">
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">
            <span className="underline">T</span>ệp (F)
          </span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">
            <span className="underline">C</span>hỉnh sửa (E)
          </span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">
            <span className="underline">X</span>em (V)
          </span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">
            <span className="underline">H</span>ình ảnh (I)
          </span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">
            Tùy <span className="underline">c</span>họn (O)
          </span>
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1">
            Trợ <span className="underline">g</span>iúp (H)
          </span>
          <span className="ml-auto text-[11px] text-slate-600 font-mono">
            {location.pathname}
          </span>
        </div>

        {/* THÂN CỬA SỔ: THANH CÔNG CỤ TRÁI + VÙNG VẼ CANVAS NỘI DUNG */}
        <div className="flex flex-col md:flex-row">
          {/* CỘT CÔNG CỤ MS PAINT BÊN TRÁI (2 CỘT x 8 DÒNG) */}
          <aside className="border-r border-[#808080] bg-[#c0c0c0] p-2 shrink-0 md:w-16 shadow-[inset_-1px_0_0_#fff] flex md:flex-col items-center justify-center gap-1 overflow-x-auto">
            <div className="grid grid-cols-8 md:grid-cols-2 gap-1 p-1 border-t-[#808080] border-l-[#808080] border-r-white border-b-white border bg-[#c0c0c0]">
              {PAINT_TOOLS.map((t) => {
                const isActive = activeTool === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    title={t.label}
                    onClick={() => {
                      setActiveTool(t.id)
                      setStatusMessage(`Đã chọn công cụ: ${t.label}`)
                    }}
                    className={`flex size-6 items-center justify-center text-xs font-bold transition-all ${
                      isActive
                        ? 'border border-t-[#000] border-l-[#000] border-r-white border-b-white bg-white/60 shadow-[inset_1px_1px_0_#808080]'
                        : 'border border-t-white border-l-white border-r-[#808080] border-b-[#808080] bg-[#c0c0c0] hover:bg-white/20'
                    }`}
                  >
                    {t.icon}
                  </button>
                )
              })}
            </div>

            {/* Ô CHỌN KÍCH THƯỚC NÉT VẼ RETRO */}
            <div className="mt-2 hidden md:flex flex-col items-center gap-1 p-1 border-t-[#808080] border-l-[#808080] border-r-white border-b-white border bg-[#c0c0c0] w-full">
              <span className="h-0.5 w-6 bg-black" />
              <span className="h-1 w-6 bg-black" />
              <span className="h-1.5 w-6 bg-black" />
              <span className="h-2 w-6 bg-black" />
            </div>
          </aside>

          {/* VÙNG VẼ NỘI DUNG CHÍNH (CANVAS INSET) */}
          <main className="min-w-0 flex-1 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white p-3 sm:p-5 m-1.5 shadow-[inset_1px_1px_0_#000] overflow-y-auto max-h-[calc(100vh-180px)]">
            {children}
          </main>
        </div>

        {/* KHAY BẢNG MÀU 28 MÀU MS PAINT BÊN DƯỚI */}
        <div className="flex flex-wrap items-center gap-3 border-t border-[#808080] bg-[#c0c0c0] p-2 shadow-[inset_0_1px_0_#fff]">
          {/* Ô HIỂN THỊ MÀU NÉT & MÀU NỀN CHỒNG NHAU KINH ĐIỂN */}
          <div className="relative size-7 shrink-0 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-[#c0c0c0]">
            <div className="absolute bottom-0.5 right-0.5 size-4 border border-black bg-white" title="Màu nền" />
            <div
              className="absolute top-0.5 left-0.5 size-4 border border-black shadow-xs"
              style={{ backgroundColor: selectedColor }}
              title="Màu nét vẽ / Tâm trạng"
            />
          </div>

          {/* DẢI 28 Ô MÀU MS PAINT */}
          <div className="grid grid-cols-14 gap-0.5 border border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-black p-0.5">
            {PAINT_PALETTE.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedColor(c)
                  setStatusMessage(`Đã chọn mã màu: ${c}`)
                }}
                className={`size-3.5 sm:size-4 border ${selectedColor === c ? 'scale-110 ring-1 ring-white' : ''}`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-700">
            <Palette size={13} />
            <span className="font-mono text-[11px]">Bảng màu Y2K</span>
          </div>
        </div>

        {/* THANH TRẠNG THÁI STATUS BAR INSET BÊN DƯỚI CÙNG */}
        <footer className="flex items-center justify-between border-t border-[#808080] bg-[#c0c0c0] px-2 py-0.5 text-[11px] text-black shadow-[inset_0_1px_0_#fff]">
          <div className="border border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-0.5 flex-1 mr-2 truncate">
            {statusMessage}
          </div>
          <div className="border border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-0.5 font-mono">
            100% · 24-bit RGB
          </div>
        </footer>
      </div>
    </div>
  )
}
