export type Mood = 1 | 2 | 3 | 4 | 5

export const MOODS: Mood[] = [1, 2, 3, 4, 5]

export const MOOD_LABEL: Record<Mood, string> = {
  1: 'Rất tệ',
  2: 'Không tốt',
  3: 'Bình thường',
  4: 'Tốt',
  5: 'Rất tốt',
}

export const MOOD_EMOJI: Record<Mood, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }

/** Màu lấy từ biến CSS --mood-N trong index.css (có bản dark mode) */
export const moodColor = (m: Mood) => `var(--mood-${m})`
