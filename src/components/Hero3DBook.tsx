import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { DAILY_AFFIRMATIONS } from '@/constants/tokens'
import { playChimeSound, playPopSound } from '@/lib/sound'
import { DoodleStar, DoodleFlower, DoodleMoon, DoodleWashiTape } from './DoodleIcons'

// Danh sách các tông màu pastel cho bìa sách (đổi mỗi lần mở)
const COVER_PALETTES = [
  { bg: 'var(--pastel-pink)', name: 'pink', accent: 'var(--pastel-butter)' },
  { bg: 'var(--pastel-mint)', name: 'mint', accent: 'var(--pastel-pink)' },
  { bg: 'var(--pastel-butter)', name: 'butter', accent: 'var(--pastel-sky)' },
  { bg: 'var(--pastel-sky)', name: 'sky', accent: 'var(--pastel-lavender)' },
  { bg: 'var(--pastel-lavender)', name: 'lavender', accent: 'var(--pastel-mint)' },
  { bg: '#FCD5B5', name: 'peach', accent: 'var(--pastel-butter)' },
]

export default function Hero3DBook() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [colorIndex, setColorIndex] = useState(0)
  const [affirmationIndex, setAffirmationIndex] = useState(() =>
    Math.floor(Math.random() * DAILY_AFFIRMATIONS.length)
  )
  const [isPageFlipping, setIsPageFlipping] = useState(false)

  // Nhận biết mobile (< 640px)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640
    }
    return false
  })

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const shouldReduceMotion = useReducedMotion()

  const bookBtnRef = useRef<HTMLDivElement>(null)
  const nextBtnRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Bắn confetti pastel
  const firePastelConfetti = () => {
    try {
      confetti({
        particleCount: 36,
        spread: 60,
        origin: { y: 0.52 },
        colors: ['#F4C6D0', '#CFE3DD', '#F6E3A8', '#CFE0F1', '#D9CFEA'],
        ticks: 160,
        gravity: 0.85,
        scalar: 0.9,
      })
    } catch {
      // Fallback nếu không hỗ trợ
    }
  }

  // Mở sách
  const handleOpenBook = useCallback(() => {
    if (isOpen) return
    playChimeSound()
    firePastelConfetti()
    // Đổi màu bìa mỗi lần mở
    setColorIndex((prev) => (prev + 1) % COVER_PALETTES.length)
    setIsOpen(true)

    // Focus vào nút "xem câu khác" sau khi sách mở xong
    setTimeout(() => {
      nextBtnRef.current?.focus()
    }, 600)
  }, [isOpen])

  // Đóng sách
  const handleCloseBook = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      if (e) e.stopPropagation()
      if (!isOpen) return
      playPopSound()
      setIsOpen(false)
      // Trả focus về nút sách
      setTimeout(() => {
        bookBtnRef.current?.focus()
      }, 300)
    },
    [isOpen]
  )

  // Đổi câu động viên khác (không trùng câu liền trước)
  const handleNextAffirmation = (e: React.MouseEvent) => {
    e.stopPropagation()
    playChimeSound()
    setIsPageFlipping(true)

    let nextIdx = Math.floor(Math.random() * DAILY_AFFIRMATIONS.length)
    if (nextIdx === affirmationIndex) {
      nextIdx = (nextIdx + 1) % DAILY_AFFIRMATIONS.length
    }
    setAffirmationIndex(nextIdx)

    setTimeout(() => {
      setIsPageFlipping(false)
    }, 450)
  }

  // Phím tắt bàn phím: Esc đóng, Enter/Space mở
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCloseBook(e)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleCloseBook])

  // Click ra ngoài để đóng sách
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleCloseBook()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, handleCloseBook])

  // Format ngày hôm nay viết tay
  const todayFormatted = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'numeric',
  }).format(new Date())

  const currentColor = COVER_PALETTES[colorIndex]

  // Kích thước trang sách
  // Desktop: 1 trang rộng 276px, cao 330px -> khi mở rộng 552px
  // Mobile: 1 trang rộng min(310px, 88vw), cao 340px
  const desktopPageWidth = 276
  const desktopPageHeight = 330
  const mobileWidth = 310
  const mobileHeight = 340

  return (
    <div
      ref={containerRef}
      className="relative mx-auto flex flex-col items-center justify-center py-4 select-none"
    >
      {/* Các họa tiết doodle bay lơ lửng xung quanh */}
      <motion.div
        animate={{ y: [-4, 4, -4], rotate: [-6, 6, -6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-4 left-4 sm:left-12 text-[var(--mood-1)] z-10"
      >
        <DoodleFlower size={26} />
      </motion.div>

      <motion.div
        animate={{ y: [4, -5, 4], rotate: [5, -5, 5] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-2 right-4 sm:right-14 text-[var(--pastel-butter)] z-10"
      >
        <DoodleStar size={24} />
      </motion.div>

      <motion.div
        animate={{ y: [-3, 5, -3] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-3 right-8 sm:right-20 text-[var(--mood-4)] z-10"
      >
        <DoodleMoon size={24} />
      </motion.div>

      {/* KHUNG SÁCH 3D */}
      <div
        className="relative flex flex-col items-center"
        style={{
          perspective: 1200,
        }}
      >
        {/* Nút sách có thể focus / bấm phím */}
        <motion.div
          ref={bookBtnRef}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Đóng sổ nhật ký' : 'Mở sổ để đọc lời nhắn'}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (!isOpen) handleOpenBook()
            }
          }}
          onClick={isOpen ? undefined : handleOpenBook}
          onMouseEnter={() => !isOpen && setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{
            y: isOpen ? 0 : [-6, 6, -6],
            x: !isMobile ? (isOpen ? 0 : -desktopPageWidth / 2) : 0,
          }}
          transition={{
            y: isOpen
              ? { duration: 0.5, ease: 'easeOut' }
              : { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            x: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
          }}
          className={`relative ${
            !isOpen ? 'cursor-pointer' : 'cursor-default'
          } outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-2xl`}
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {/* ============================================================== */}
          {/* DESKTOP & TABLET VIEW (>= 640px): SÁCH MỞ 2 TRANG NGANG CỔ ĐIỂN */}
          {/* ============================================================== */}
          <div
            className="hidden sm:block relative"
            style={{
              width: desktopPageWidth * 2,
              height: desktopPageHeight,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* TRANG BÊN PHẢI (Right Page - Trang nội dung chính) */}
            <div
              className="absolute top-0 right-0 rounded-r-2xl border-[2px] border-[var(--border-strong)] bg-[var(--surface)] p-5 flex flex-col justify-between overflow-hidden shadow-[4px_6px_0px_var(--border-strong)]"
              style={{
                width: desktopPageWidth,
                height: desktopPageHeight,
                backgroundImage:
                  'repeating-linear-gradient(transparent, transparent 27px, var(--border) 27px, var(--border) 28px)',
              }}
            >
              {/* Bóng gáy sách bên trái của trang phải */}
              <div
                className="pointer-events-none absolute top-0 bottom-0 left-0 w-8 z-10"
                style={{
                  background:
                    'linear-gradient(to right, rgba(0,0,0,0.18), rgba(0,0,0,0.03) 20px, transparent 32px)',
                }}
              />

              {/* Lớp mép giấy xếp chồng bên phải mô phỏng nhiều trang sách */}
              <div className="pointer-events-none absolute top-1 -right-1 bottom-1 w-1 rounded-r-xl border-r border-[var(--border-strong)]/40 bg-[var(--surface-2)] -z-10" />
              <div className="pointer-events-none absolute top-2 -right-2 bottom-2 w-1 rounded-r-xl border-r border-[var(--border-strong)]/20 bg-[var(--surface-2)]/60 -z-20" />

              {/* Miếng washi dán nhẹ ở góc */}
              <div className="absolute top-2 right-4 pointer-events-none opacity-80">
                <DoodleWashiTape color="var(--pastel-butter)" className="h-3 w-12" />
              </div>

              {/* NỘI DUNG TRÊN TRANG SÁCH PHẢI */}
              <div className="relative z-10 flex flex-col items-center text-center pt-2">
                {/* Dòng 1: Nhãn nhỏ */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  transition={{ delay: 0.38, duration: 0.4 }}
                  className="font-mono text-[9px] tracking-widest text-[var(--text-muted)] uppercase"
                >
                  GỬI MỘT CHÚT DỊU DÀNG CHO BẠN HÔM NAY
                </motion.p>

                {/* Dòng 2: Trích dẫn câu động viên */}
                <div className="mt-4 px-2 min-h-[110px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={affirmationIndex}
                      initial={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 8, scale: 0.96 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -8, scale: 0.96 }
                      }
                      transition={{ duration: 0.38, ease: 'easeOut' }}
                    >
                      <p
                        className="font-serif italic text-[var(--text)] leading-relaxed"
                        style={{
                          fontSize: 'clamp(14px, 1.8vw, 17px)',
                        }}
                      >
                        "{DAILY_AFFIRMATIONS[affirmationIndex]}"
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Dòng 3: Cụm nút thao tác */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ delay: 0.58, duration: 0.4 }}
                className="relative z-10 flex items-center justify-center gap-2 pb-1"
              >
                <button
                  ref={nextBtnRef}
                  type="button"
                  onClick={handleNextAffirmation}
                  disabled={isPageFlipping}
                  className="rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--pastel-butter)] px-3 py-1.5 font-sans text-xs font-medium text-[var(--text)] shadow-[2px_2px_0px_var(--border-strong)] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--border-strong)] active:translate-y-0"
                >
                  ✿ xem câu khác
                </button>
                <button
                  type="button"
                  onClick={handleCloseBook}
                  className="rounded-full border-[1.5px] border-[var(--border)] bg-transparent px-3 py-1.5 font-sans text-xs text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-all"
                >
                  đóng lại
                </button>
              </motion.div>
            </div>

            {/* BÌA TRƯỚC (Front Cover - lật quanh gáy sách bên trái) */}
            <motion.div
              animate={{
                rotateY: isOpen
                  ? -170
                  : isHovered && !shouldReduceMotion
                  ? -14
                  : 0,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.3 }
                  : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
              }
              className="absolute top-0 right-0 z-20 origin-left"
              style={{
                width: desktopPageWidth,
                height: desktopPageHeight,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* MẶT NGOÀI BÌA (Front Face of Cover) */}
              <div
                className="absolute inset-0 rounded-2xl border-[2px] border-[var(--border-strong)] p-4 flex flex-col justify-between shadow-[4px_6px_0px_var(--border-strong)] transition-colors duration-400"
                style={{
                  backgroundColor: currentColor.bg,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Gáy sổ 3D dập nổi bên trái */}
                <div className="absolute top-0 bottom-0 left-3 w-2 border-r border-[var(--border-strong)]/30 bg-black/5 dark:bg-white/5" />

                {/* Dây ruy-băng đánh dấu trang rủ từ trên xuống */}
                <div
                  className="absolute -top-1 left-8 h-9 w-3.5 rounded-b-sm border border-[var(--border-strong)] shadow-sm"
                  style={{ backgroundColor: currentColor.accent }}
                />

                {/* Nhãn dán trên bìa sổ */}
                <div className="relative z-10 mx-auto mt-10 flex flex-col items-center rounded-xl border-[1.5px] border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 shadow-[2px_2px_0px_var(--border-strong)]">
                  <span className="font-mono text-[9px] tracking-widest text-[var(--text-muted)] uppercase">
                    DIARY
                  </span>
                  <span className="font-serif text-xl italic text-[var(--text)] font-medium">
                    junhi ✿
                  </span>
                </div>

                {/* Chữ gợi ý chạm để mở */}
                <div className="text-center pb-2">
                  <span className="inline-block rounded-full border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-1 font-mono text-[9px] font-medium text-[var(--text)] tracking-wide shadow-sm">
                    chạm để mở ✿
                  </span>
                </div>
              </div>

              {/* MẶT TRONG BÌA (Inside Left Page - Trang trái hiển thị khi mở) */}
              <div
                className="absolute inset-0 rounded-l-2xl border-[2px] border-[var(--border-strong)] bg-[var(--surface)] p-5 flex flex-col justify-between overflow-hidden shadow-[4px_6px_0px_var(--border-strong)]"
                style={{
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  backgroundImage:
                    'repeating-linear-gradient(transparent, transparent 27px, var(--border) 27px, var(--border) 28px)',
                }}
              >
                {/* Bóng gáy bên phải của trang trái */}
                <div
                  className="pointer-events-none absolute top-0 bottom-0 right-0 w-8 z-10"
                  style={{
                    background:
                      'linear-gradient(to left, rgba(0,0,0,0.18), rgba(0,0,0,0.03) 20px, transparent 32px)',
                  }}
                />

                {/* Header trang trái: Ngày tháng viết tay */}
                <div className="relative z-10 pt-1">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                    <span className="font-serif text-xs italic text-[var(--text-muted)] flex items-center gap-1.5">
                      <span>🌱</span>
                      <span>{todayFormatted}</span>
                    </span>
                    <span className="font-mono text-[9px] text-[var(--text-muted)]">
                      trang 01
                    </span>
                  </div>
                </div>

                {/* Họa tiết doodle & ghi chú viết tay trên trang trái */}
                <div className="relative z-10 my-auto text-center px-3">
                  <div className="inline-flex items-center justify-center gap-3 text-[var(--text-muted)] mb-3">
                    <DoodleStar size={18} className="text-[var(--pastel-butter)]" />
                    <DoodleFlower size={20} className="text-[var(--pastel-pink)]" />
                    <DoodleMoon size={18} className="text-[var(--mood-4)]" />
                  </div>
                  <p className="font-serif italic text-xs text-[var(--text-muted)] leading-relaxed">
                    mỗi trang viết là một cái ôm dịu dàng gửi tới bạn hôm nay... ✿
                  </p>
                </div>

                {/* Chân trang trái: Nhãn nhỏ mộc mạc */}
                <div className="relative z-10 text-center pb-1">
                  <span className="font-mono text-[8px] tracking-widest text-[var(--text-muted)] uppercase">
                    A LITTLE LOVE FOR YOU
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ============================================================== */}
          {/* MOBILE VIEW (< 640px): SỔ TAY CUỘN/LẬT MỞ THEO CHIỀU DỌC GỌN GÀNG */}
          {/* ============================================================== */}
          <div
            className="block sm:hidden relative"
            style={{
              width: mobileWidth,
              height: mobileHeight,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* TRANG NỘI DUNG CHÍNH (Mobile Right/Main Page) */}
            <div
              className="absolute inset-0 rounded-2xl border-[2px] border-[var(--border-strong)] bg-[var(--surface)] p-4 flex flex-col justify-between overflow-hidden shadow-[4px_6px_0px_var(--border-strong)]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(transparent, transparent 26px, var(--border) 26px, var(--border) 27px)',
              }}
            >
              {/* Khoen lò xo xoắn ốc ở mép trên cuốn sổ */}
              <div className="flex justify-around px-4 -mt-2 mb-1 z-20 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-3.5 w-2 rounded-full border border-[var(--border-strong)] bg-[var(--border)] shadow-inner"
                  />
                ))}
              </div>

              {/* Nội dung lời nhắn */}
              <div className="relative z-10 flex flex-col items-center text-center pt-1">
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                  transition={{ delay: 0.35, duration: 0.35 }}
                  className="font-mono text-[9px] tracking-widest text-[var(--text-muted)] uppercase"
                >
                  GỬI MỘT CHÚT DỊU DÀNG CHO BẠN HÔM NAY
                </motion.p>

                <div className="mt-4 px-2 min-h-[120px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={affirmationIndex}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                    >
                      <p
                        className="font-serif italic text-[var(--text)] leading-relaxed"
                        style={{
                          fontSize: 'clamp(14px, 4.2vw, 17px)',
                        }}
                      >
                        "{DAILY_AFFIRMATIONS[affirmationIndex]}"
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Hai nút xem câu khác & đóng lại */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                transition={{ delay: 0.52, duration: 0.35 }}
                className="relative z-10 flex items-center justify-center gap-2 pb-1"
              >
                <button
                  type="button"
                  onClick={handleNextAffirmation}
                  disabled={isPageFlipping}
                  className="rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--pastel-butter)] px-3 py-1.5 font-sans text-xs font-medium text-[var(--text)] shadow-[2px_2px_0px_var(--border-strong)] active:scale-95"
                >
                  ✿ xem câu khác
                </button>
                <button
                  type="button"
                  onClick={handleCloseBook}
                  className="rounded-full border-[1.5px] border-[var(--border)] bg-transparent px-3 py-1.5 font-sans text-xs text-[var(--text-muted)] active:scale-95"
                >
                  đóng lại
                </button>
              </motion.div>
            </div>

            {/* BÌA TRƯỚC TRÊN MOBILE (Lật lên như sổ lò xo) */}
            <motion.div
              animate={{
                rotateX: isOpen
                  ? -165
                  : isHovered && !shouldReduceMotion
                  ? -12
                  : 0,
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.3 }
                  : { duration: 0.85, ease: [0.16, 1, 0.3, 1] }
              }
              className="absolute inset-0 z-20 origin-top"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Mặt ngoài bìa sổ mobile */}
              <div
                className="absolute inset-0 rounded-2xl border-[2px] border-[var(--border-strong)] p-4 flex flex-col justify-between shadow-[4px_6px_0px_var(--border-strong)] transition-colors duration-400"
                style={{
                  backgroundColor: currentColor.bg,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Khoen lò xo xoắn ốc */}
                <div className="flex justify-around px-4 -mt-2 mb-1 z-20 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-3.5 w-2 rounded-full border border-[var(--border-strong)] bg-stone-200 dark:bg-stone-700 shadow-inner"
                    />
                  ))}
                </div>

                {/* Nhãn DIARY junhi */}
                <div className="relative z-10 mx-auto my-auto flex flex-col items-center rounded-xl border-[1.5px] border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 shadow-[2px_2px_0px_var(--border-strong)]">
                  <span className="font-mono text-[9px] tracking-widest text-[var(--text-muted)] uppercase">
                    DIARY
                  </span>
                  <span className="font-serif text-xl italic text-[var(--text)] font-medium">
                    junhi ✿
                  </span>
                </div>

                {/* Gợi ý chạm để mở */}
                <div className="text-center pb-2">
                  <span className="inline-block rounded-full border border-[var(--border)] bg-[var(--surface)]/90 px-3 py-1 font-mono text-[9px] font-medium text-[var(--text)] tracking-wide shadow-sm">
                    chạm để mở ✿
                  </span>
                </div>
              </div>

              {/* Mặt sau bìa mobile khi lật lên */}
              <div
                className="absolute inset-0 rounded-2xl border-[2px] border-[var(--border-strong)] bg-[var(--surface)] p-4 flex flex-col items-center justify-center shadow-md"
                style={{
                  transform: 'rotateX(180deg)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <DoodleFlower size={24} className="text-[var(--pastel-pink)] mb-2" />
                <span className="font-serif text-xs italic text-[var(--text-muted)]">
                  {todayFormatted} ✿
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* BÓNG ELIP MỜ BÊN DƯỚI (Co giãn mượt mà theo trạng thái mở/đóng) */}
        <motion.div
          animate={{
            width: isOpen
              ? !isMobile
                ? desktopPageWidth * 1.9
                : mobileWidth * 0.95
              : !isMobile
              ? 160
              : 140,
            scale: isOpen ? 1 : [0.88, 1.08, 0.88],
            opacity: isOpen ? 0.35 : [0.22, 0.42, 0.22],
          }}
          transition={{
            width: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
            scale: isOpen
              ? { duration: 0.5 }
              : { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            opacity: isOpen
              ? { duration: 0.5 }
              : { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="mt-4 h-3.5 rounded-full bg-[var(--border-strong)]/25 blur-[3px]"
        />
      </div>
    </div>
  )
}

