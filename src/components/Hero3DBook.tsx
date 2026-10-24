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
        className="pointer-events-none absolute -top-2 left-6 text-[#E08A82]"
      >
        <DoodleFlower size={26} />
      </motion.div>

      <motion.div
        animate={{ y: [4, -5, 4], rotate: [5, -5, 5] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-4 right-8 text-[#F6E3A8]"
      >
        <DoodleStar size={24} />
      </motion.div>

      <motion.div
        animate={{ y: [-3, 5, -3] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -bottom-2 right-12 text-[#BFDDCB]"
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
            className={`relative flex h-36 w-32 sm:h-44 sm:w-36 flex-col justify-between rounded-2xl border-[2px] border-[#2B2724] p-4 shadow-[4px_6px_0px_#2B2724] transition-colors duration-300 ${
              isOpen ? 'bg-[#CFE3DD]' : 'bg-[#F4C6D0]'
            }`}
          >
            {/* Gáy sổ 3D dập nổi */}
            <div className="absolute top-0 bottom-0 left-3 w-1.5 border-r border-[#2B2724]/30 bg-black/5" />

            {/* Dây ruy-băng đánh dấu trang */}
            <div className="absolute -top-1 left-7 h-8 w-3 rounded-b-sm border border-[#2B2724] bg-[#F6E3A8]" />

            {/* Nhãn dán trên bìa sổ */}
            <div className="relative z-10 mx-auto mt-6 flex flex-col items-center rounded-xl border-[1.5px] border-[#2B2724] bg-[#FBFAF7] px-3 py-2 shadow-[2px_2px_0px_#2B2724]">
              <span className="font-mono text-[9px] tracking-widest text-[#7A736B] uppercase">DIARY</span>
              <span className="font-serif text-lg italic text-[#2B2724]">junhi ✿</span>
            </div>

            {/* Chữ gợi ý bấm mở */}
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#FBFAF7]/80 px-2.5 py-0.5 font-mono text-[9px] font-medium text-[#2B2724] tracking-wide">
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
          className="mt-3 h-3 w-28 rounded-full bg-[#2B2724]/20 blur-[2px]"
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
            className="relative mt-4 max-w-md rounded-2xl border-[1.5px] border-[#2B2724] bg-[#FBFAF7] p-4 text-center shadow-[3px_4px_0px_#2B2724]"
          >
            {/* Miếng băng keo washi trang trí */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-16 opacity-85"
              style={{
                backgroundColor: '#F6E3A8',
                clipPath: 'polygon(0% 20%, 5% 0%, 95% 0%, 100% 20%, 98% 80%, 95% 100%, 5% 100%, 0% 80%)',
              }}
            />

            <div className="pt-1">
              <p className="font-mono text-[10px] tracking-widest text-[#7A736B] uppercase">
                GỬI MỘT CHÚT DỊU DÀNG CHO BẠN HÔM NAY
              </p>
              <p className="mt-2 font-serif text-lg sm:text-xl italic text-[#2B2724] leading-relaxed">
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
                  className="rounded-full border-[1.5px] border-[#2B2724] bg-[#F6E3A8] px-3 py-1 font-sans text-xs text-[#2B2724] hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#2B2724] transition-all"
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
                  className="rounded-full border-[1.5px] border-[#2B2724]/40 bg-transparent px-3 py-1 font-sans text-xs text-[#7A736B] hover:border-[#2B2724] hover:text-[#2B2724] transition-all"
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
