export type Mood = 1 | 2 | 3 | 4 | 5

export const MOODS: Mood[] = [1, 2, 3, 4, 5]

export const MOOD_LABEL: Record<Mood, string> = {
  1: 'Mỏi mệt / Buồn nhẹ',
  2: 'Hơi chông chênh',
  3: 'Bình yên / Tĩnh lặng',
  4: 'Nhẹ nhõm / Vui vẻ',
  5: 'Ngập tràn ấm áp',
}

export const MOOD_EMOJI: Record<Mood, string> = {
  1: '☁️',
  2: '🌱',
  3: '☕',
  4: '🌸',
  5: '✨',
}

/** Màu lấy từ biến CSS --mood-N trong index.css */
export const moodColor = (m: Mood) => `var(--mood-${m})`
