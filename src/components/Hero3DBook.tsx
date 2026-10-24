import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { COZY_SPRING, DAILY_AFFIRMATIONS } from '@/constants/tokens'
import { playChimeSound, playPopSound } from '@/lib/sound'
import { DoodleStar, DoodleFlower, DoodleMoon } from './DoodleIcons'

export default function Hero3DBook() {
  const [isOpen, setIsOpen] = useState(false)
  const [affirmationIndex, setAffirmationIndex] = useState(0)

  const handleBookClick = () => {
    playPopSound()
    if (!isOpen) {
      playChimeSound()
      // Bắn confetti pastel nhẹ nhàng
      try {
        confetti({
          particleCount: 36,
          spread: 60,
          origin: { y: 0.55 },
          colors: ['#F4C6D0', '#CFE3DD', '#F6E3A8', '#CFE0F1', '#D9CFEA'],
          ticks: 180,
          gravity: 0.8,
          scalar: 0.9,
        })
      } catch {
        // Fallback
      }
      setAffirmationIndex(Math.floor(Math.random() * DAILY_AFFIRMATIONS.length))
      setIsOpen(true)
    } else {
      // Đổi câu động viên khác
      setAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length)
      playChimeSound()
    }
  }

  return (
    <div className="relative mx-auto flex flex-col items-center justify-center py-6 select-none">
      {/* Các họa tiết doodle bay lơ lửng xung quanh */}
      <motion.div
        animate={{ y: [-4, 4, -4], rotate: [-6, 6, -6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-2 left-6 text-[var(--mood-1)]"
      >
        <DoodleFlower size={26} />
      </motion.div>

      <motion.div
        animate={{ y: [4, -5, 4], rotate: [5, -5, 5] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-4 right-8 text-[var(--pastel-butter)]"
      >
        <DoodleStar size={24} />
      </motion.div>

      <motion.div
        animate={{ y: [-3, 5, -3] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-2 right-12 text-[var(--mood-4)]"
      >
        <DoodleMoon size={24} />
      </motion.div>

      {/* Vật thể 3D nổi ở giữa (Quyển sổ nhật ký pastel / Hộp bí mật) */}
      <div className="relative flex flex-col items-center">
        <motion.div
          animate={{
            y: [-8, 8, -8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBookClick}
          className="group relative cursor-pointer"
          style={{ perspective: 1000 }}
        >
          {/* Quyển sổ 3D pastel */}
          <div
            className={`relative flex h-36 w-32 sm:h-44 sm:w-36 flex-col justify-between rounded-2xl border-[2px] border-[var(--border-strong)] p-4 shadow-[4px_6px_0px_var(--border-strong)] transition-colors duration-300 ${
              isOpen ? 'bg-[var(--pastel-mint)]' : 'bg-[var(--pastel-pink)]'
            }`}
          >
            {/* Gáy sổ 3D dập nổi */}
            <div className="absolute top-0 bottom-0 left-3 w-1.5 border-r border-[var(--border-strong)]/30 bg-black/5 dark:bg-white/5" />

            {/* Dây ruy-băng đánh dấu trang */}
            <div className="absolute -top-1 left-7 h-8 w-3 rounded-b-sm border border-[var(--border-strong)] bg-[var(--pastel-butter)]" />

            {/* Nhãn dán trên bìa sổ */}
            <div className="relative z-10 mx-auto mt-6 flex flex-col items-center rounded-xl border-[1.5px] border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 shadow-[2px_2px_0px_var(--border-strong)]">
              <span className="font-mono text-[9px] tracking-widest text-[var(--text-muted)] uppercase">DIARY</span>
              <span className="font-serif text-lg italic text-[var(--text)]">junhi ✿</span>
            </div>

            {/* Chữ gợi ý bấm mở */}
            <div className="text-center">
              <span className="inline-block rounded-full bg-[var(--surface)]/80 px-2.5 py-0.5 font-mono text-[9px] font-medium text-[var(--text)] tracking-wide">
                {isOpen ? 'chạm để đổi ✿' : 'chạm để mở ✿'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Bóng elip mờ bên dưới nhẹ nhàng co giãn đồng bộ với chuyển động lơ lửng */}
        <motion.div
          animate={{
            scale: [0.85, 1.1, 0.85],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mt-3 h-3 w-28 rounded-full bg-[var(--border-strong)]/20 blur-[2px]"
        />
      </div>

      {/* Hộp thông điệp mở ra với câu động viên hôm nay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={COZY_SPRING}
            className="relative mt-4 max-w-md rounded-2xl border-[1.5px] border-[var(--border-strong)] bg-[var(--surface)] p-4 text-center shadow-[3px_4px_0px_var(--border-strong)]"
          >
            {/* Miếng băng keo washi trang trí */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-16 opacity-80 dark:opacity-45"
              style={{
                backgroundColor: 'var(--pastel-butter)',
                clipPath: 'polygon(0% 20%, 5% 0%, 95% 0%, 100% 20%, 98% 80%, 95% 100%, 5% 100%, 0% 80%)',
              }}
            />

            <div className="pt-1">
              <p className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase">
                GỬI MỘT CHÚT DỊU DÀNG CHO BẠN HÔM NAY
              </p>
              <p className="mt-2 font-serif text-lg sm:text-xl italic text-[var(--text)] leading-relaxed">
                "{DAILY_AFFIRMATIONS[affirmationIndex]}"
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setAffirmationIndex((prev) => (prev + 1) % DAILY_AFFIRMATIONS.length)
                    playChimeSound()
                  }}
                  className="rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--pastel-butter)] px-3 py-1 font-sans text-xs text-[var(--text)] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_var(--border-strong)] transition-all"
                >
                  ✿ xem câu khác
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                    playPopSound()
                  }}
                  className="rounded-full border-[1.5px] border-[var(--border)] bg-transparent px-3 py-1 font-sans text-xs text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-all"
                >
                  đóng lại
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
