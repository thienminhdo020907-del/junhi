/**
 * Web Audio API Synth cho âm thanh "whimsical / cozy"
 * Hoạt động 100% offline, không cần tải file mp3 bên ngoài, không phụ thuộc mạng.
 */

let audioCtx: AudioContext | null = null
let lofiInterval: number | null = null
let lofiGainNode: GainNode | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('junhi_sound_enabled') === 'true'
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('junhi_sound_enabled', enabled ? 'true' : 'false')
  if (enabled) {
    startLofiAmbience()
    playPopSound()
  } else {
    stopLofiAmbience()
  }
}

/**
 * Tiếng "pop" bọt bong bóng nhỏ khi click nút
 */
export function playPopSound(): void {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // Tần số từ 440Hz trượt nhanh lên 660Hz rồi rơi nhẹ tạo tiếng "pop"
    const now = ctx.currentTime
    osc.frequency.setValueAtTime(480, now)
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.04)
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.1)

    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.12)
  } catch {
    // Silent fail if audio blocked
  }
}

/**
 * Tiếng chuông gió / sparkle dịu dàng khi chọn mood hoặc lưu nhật ký
 */
export function playChimeSound(): void {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    const now = ctx.currentTime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * 0.06)

      gain.gain.setValueAtTime(0.001, now + idx * 0.06)
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.06 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.06)
      osc.stop(now + idx * 0.06 + 0.55)
    })
  } catch {
    // Silent fail
  }
}

/**
 * Hợp âm Lo-fi cozy ấm áp (Cmaj7 -> Am7 -> Dm7 -> G7) lặp nhẹ nhàng
 */
function playLofiChord(frequencies: number[]): void {
  const ctx = getAudioContext()
  if (!ctx || !lofiGainNode) return

  const now = ctx.currentTime
  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)

    // Low-pass filter tạo chất âm ấm áp cổ điển của băng từ / vinyl
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(650, now)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.025, now + 0.8)
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 3.8)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(lofiGainNode!)

    osc.start(now)
    osc.stop(now + 3.9)
  })
}

export function startLofiAmbience(): void {
  const ctx = getAudioContext()
  if (!ctx || lofiInterval) return

  lofiGainNode = ctx.createGain()
  lofiGainNode.gain.setValueAtTime(0.4, ctx.currentTime)
  lofiGainNode.connect(ctx.destination)

  // 4 hợp âm jazz/lo-fi thư giãn: Cmaj7, Am7, Dm7, G7sus4
  const chords = [
    [261.63, 329.63, 392.0, 493.88], // Cmaj7 (C4, E4, G4, B4)
    [220.0, 261.63, 329.63, 392.0],  // Am7 (A3, C4, E4, G4)
    [146.83, 220.0, 261.63, 349.23], // Dm7 (D3, A3, C4, F4)
    [196.0, 261.63, 293.66, 392.0],  // G7sus4 (G3, C4, D4, G4)
  ]

  let step = 0
  playLofiChord(chords[0])
  step = 1

  lofiInterval = window.setInterval(() => {
    playLofiChord(chords[step % chords.length])
    step++
  }, 4000)
}

export function stopLofiAmbience(): void {
  if (lofiInterval) {
    clearInterval(lofiInterval)
    lofiInterval = null
  }
  if (lofiGainNode) {
    try {
      lofiGainNode.disconnect()
    } catch {
      // Ignored
    }
    lofiGainNode = null
  }
}
