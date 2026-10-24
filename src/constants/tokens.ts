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
  'Một ngụm nước ấm, một ánh nắng sớm, bạn đang làm rất tốt rồi.',
  'Hãy để trái tim bạn được thả lỏng như một đám mây trôi lững lờ ☁️',
  'Cứ bước từng bước nhỏ thôi, bạn không cần phải vội vã với cuộc đời.',
  'Đôi khi, dũng cảm nhất chính là cho phép bản thân được nghỉ ngơi.',
  'Mỗi sớm mai thức dậy là một món quà dịu êm chờ bạn mở ra 🌿',
  'Giữ cho tâm hồn một góc thanh tịnh, như đóa hoa lặng lẽ nở ban mai.',
  'Bạn là phiên bản độc nhất và quý giá nhất của chính mình ✿',
  'Nụ cười của bạn hôm nay có thể thắp sáng cả một góc trời nhỏ.',
  'Mọi giông bão ngoài kia rồi cũng sẽ nhường chỗ cho bầu trời xanh ngát.',
  'Gửi một cái ôm thật chặt đến bạn vì đã kiên trì đến tận hôm nay 🤍',
  'Hãy lắng nghe cơ thể, nó đang thì thầm những điều bạn cần chăm sóc.',
  'Không sao cả nếu hôm nay bạn chỉ muốn nằm im và nghe tiếng mưa rơi 🌧️',
  'Những hạt mầm hy vọng vẫn đang âm thầm lớn lên trong lòng bạn 🌱',
  'Đừng quên ngắm nhìn hoàng hôn rực rỡ chiều nay nhé.',
  'Hạnh phúc đôi khi chỉ là một chiếc chăn ấm và một cuốn sách hay 📖',
  'Bình yên không ở đâu xa, nó bắt đầu từ hơi thở dịu nhẹ của bạn.',
  'Cho dù ngày hôm nay thế nào, ngày mai vẫn là một khởi đầu hoàn toàn mới.',
  'Hãy tự hào về những nỗ lực thầm lặng mà chỉ riêng bạn thấu hiểu ✨',
  'Gieo một suy nghĩ dịu dàng, gặt một ngày an yên.',
  'Ánh trăng đêm nay sẽ xoa dịu mọi âu lo trong lòng bạn 🌙',
  'Uống một tách trà thơm, ngắm nhìn chiếc lá rơi, đời vẫn thật êm đềm ☕',
  'Mỗi vết nứt đều là nơi ánh sáng tìm đường rọi vào tâm hồn.',
  'Hãy yêu thương cả những ngày bạn cảm thấy mình chưa trọn vẹn.',
  'Thời gian sẽ xoa dịu tất cả, hãy kiên nhẫn với chính mình bạn nhé 🌸',
  'Bạn xứng đáng nhận được tất cả sự tử tế và ngọt ngào trên thế giới này.',
  'Cảm ơn bạn vì đã có mặt ở đây, trong khoảnh khắc bình yên này.',
  'Nhắm mắt lại, mỉm cười nhẹ... Mọi chuyện rồi sẽ ổn cả thôi ✿',
]

