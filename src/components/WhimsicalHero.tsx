import { motion } from 'framer-motion'
import { COZY_SPRING } from '@/constants/tokens'
import { playPopSound } from '@/lib/sound'
import Hero3DBook from './Hero3DBook'
import { DoodleWashiTape, DoodleFlower } from './DoodleIcons'

interface WhimsicalHeroProps {
  onScrollToEntry?: () => void
}

export default function WhimsicalHero({ onScrollToEntry }: WhimsicalHeroProps) {
  const cards = [
    {
      tapeColor: '#F4C6D0',
      tilt: '-rotate-[1.2deg]',
      icon: '🌸',
      title: 'hiểu giấc ngủ của bạn',
      desc: 'vòng tròn đồng hồ vẽ tay giúp bạn lắng nghe nhịp điệu nghỉ ngơi tự nhiên của cơ thể.',
    },
    {
      tapeColor: '#CFE3DD',
      tilt: 'rotate-[1.5deg]',
      icon: '🍃',
      title: 'nhìn lại theo năm tháng',
      desc: 'những miếng sticker cảm xúc xếp thành bức tranh màu sắc dịu mát theo từng tuần, tháng và năm.',
    },
    {
      tapeColor: '#CFE0F1',
      tilt: '-rotate-[1deg]',
      icon: '☁️',
      title: 'luôn ở bên bạn mọi nơi',
      desc: 'đồng bộ nhẹ nhàng lên đám mây riêng tư hoặc lưu hoàn toàn trên máy của bạn.',
    },
    {
      tapeColor: '#F6E3A8',
      tilt: 'rotate-[1.2deg]',
      icon: '🔒',
      title: 'chỉ mình bạn đọc được',
      desc: 'mã khóa PIN bảo vệ và dữ liệu cô lập tuyệt đối, chỉ dành riêng cho bạn tĩnh lặng.',
    },
  ]

  return (
    <section className="mb-12 text-center">
      {/* Tiêu đề trộn hai kiểu chữ (sans nhỏ + serif nghiêng cỡ lớn) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={COZY_SPRING}
        className="mx-auto max-w-xl px-4"
      >
        <span className="font-mono text-[10px] tracking-[0.25em] text-[#7A736B] dark:text-[#A8A199] uppercase">
          A LITTLE LOVE FOR YOUR HEART
        </span>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl font-normal italic text-[#2B2724] dark:text-[#EDE8E3] leading-tight">
          nơi lắng nghe từng cảm xúc nhỏ ✿
        </h1>
        <p className="mt-3 font-sans text-sm sm:text-base text-[#7A736B] dark:text-[#A8A199] max-w-md mx-auto leading-relaxed">
          một góc nhỏ ấm áp, thủ công và bình yên để bạn gửi gắm tâm sự mỗi ngày.
        </p>
      </motion.div>

      {/* Quyển sổ 3D pastel lơ lửng ở giữa */}
      <div className="my-6">
        <Hero3DBook />
      </div>

      {/* Nút CTA "make your first entry ✿" */}
      {onScrollToEntry && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...COZY_SPRING, delay: 0.2 }}
          className="mb-10"
        >
          <button
            type="button"
            onClick={() => {
              playPopSound()
              onScrollToEntry()
            }}
            className="group inline-flex items-center gap-2 rounded-full border-[1.5px] border-[#2B2724] bg-[#F4C6D0] px-6 py-2.5 font-sans text-sm font-medium text-[#2B2724] shadow-[2px_3px_0px_#2B2724] transition-all hover:-translate-y-0.5 hover:shadow-[3px_4px_0px_#2B2724] active:translate-y-0"
          >
            <DoodleFlower size={16} className="text-[#2B2724] transition-transform group-hover:rotate-45" />
            <span>ghi nhật ký hôm nay ✿</span>
          </button>
        </motion.div>
      )}

      {/* 4 Thẻ lợi ích nghiêng nhẹ 1-2 độ như giấy note dán băng keo washi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-2 pt-2">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...COZY_SPRING, delay: 0.1 * i }}
            whileHover={{ scale: 1.03, rotate: 0 }}
            className={`relative rounded-3xl border-[1.5px] border-[#2B2724]/20 bg-[#FBFAF7] p-5 pt-7 text-left shadow-[2px_3px_0px_rgba(43,39,36,0.08)] transition-all dark:border-white/20 dark:bg-[#282421] dark:shadow-none ${c.tilt}`}
          >
            {/* Miếng băng dán washi tape dán ở mép trên */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <DoodleWashiTape color={c.tapeColor} />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{c.icon}</span>
              <h3 className="font-serif text-lg italic text-[#2B2724] dark:text-[#EDE8E3]">
                {c.title}
              </h3>
            </div>
            <p className="font-sans text-xs text-[#7A736B] dark:text-[#A8A199] leading-relaxed">
              {c.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
