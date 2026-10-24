/**
 * Whimsical Cozy Design Tokens
 * Lấy cảm hứng từ "a little love for you" & "cafe pomodoro"
 */

export const COZY_COLORS = {
  // Nền & Chữ chính
  bgLight: '#F3F1EC', // Kem ấm dịu
  cardLight: '#FBFAF7', // Trắng ngà giấy sổ
  textLight: '#2B2724', // Nâu than
  textMutedLight: '#7A736B', // Xám ấm
  borderLight: '#2B2724', // Nét viền vẽ tay

  // Dark mode
  bgDark: '#1F1C1A', // Nâu đen ấm
  cardDark: '#282421', // Thẻ nâu sẫm
  textDark: '#EDE8E3', // Kem sáng
  textMutedDark: '#A8A199', // Xám khói
  borderDark: '#4A433E', // Viền nâu sáng

  // Bảng màu Pastel nhấn
  pastels: {
    pink: '#F4C6D0', // Hồng phấn
    mint: '#CFE3DD', // Xanh bạc hà
    butter: '#F6E3A8', // Vàng bơ
    sky: '#CFE0F1', // Xanh trời
    lavender: '#D9CFEA', // Tím lavender
  },

  // Thang điểm Mood 1-5
  moods: {
    1: { hex: '#E08A82', name: 'Mỏi mệt / Buồn nhẹ', doodle: '☁️', colorName: 'Đỏ đất' },
    2: { hex: '#F2B58B', name: 'Hơi chông chênh', doodle: '🌱', colorName: 'Cam đào' },
    3: { hex: '#F6E3A8', name: 'Bình yên / Tĩnh lặng', doodle: '☕', colorName: 'Vàng bơ' },
    4: { hex: '#BFDDCB', name: 'Nhẹ nhõm / Vui vẻ', doodle: '🌸', colorName: 'Xanh bạc hà' },
    5: { hex: '#8CC3A0', name: 'Ngập tràn ấm áp', doodle: '✨', colorName: 'Xanh lá dịu' },
  },
} as const

export const COZY_SPRING = {
  type: 'spring' as const,
  stiffness: 120,
  damping: 14,
}

export const STAGGER_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: COZY_SPRING,
    },
  },
}

export const DAILY_AFFIRMATIONS = [
  'Hôm nay hãy đối xử thật dịu dàng với chính mình nhé ✿',
  'Mỗi ngày trôi qua đều là một trang giấy mới thơm mùi trà ấm.',
  'Bạn đã cố gắng rất nhiều rồi, cho phép mình nghỉ ngơi một chút nha 🌱',
  'Dù chuyện gì xảy ra, góc nhỏ này luôn chào đón bạn trở về.',
  'Những điều tuyệt vời nhất thường bắt đầu từ những niềm vui giản dị nhất ☕',
  'Hít một hơi thật sâu, thở ra mọi muộn phiền... Hôm nay là một ngày đáng yêu ✨',
  'Cảm xúc nào cũng đáng được trân trọng và lắng nghe 🌸',
  'Bạn không cần phải hoàn hảo để xứng đáng được bình yên.',
]
