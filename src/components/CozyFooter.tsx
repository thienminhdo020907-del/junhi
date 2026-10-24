import { DoodleFlower, DoodleStar } from './DoodleIcons'

export default function CozyFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--border)] py-10 text-center select-none">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-center gap-3 px-4">
        {/* Dãy ký tự ✕✕✕✕✕✕✕✕✕✕ dạng mono */}
        <div className="flex items-center gap-2 text-[var(--text-muted)]/60">
          <DoodleFlower size={14} className="text-[var(--pastel-pink)]" />
          <span className="font-mono text-[11px] tracking-[0.35em] uppercase">
            ✕✕✕✕✕✕✕✕✕✕
          </span>
          <DoodleStar size={14} className="text-[var(--pastel-butter)]" />
        </div>

        {/* Dòng chữ cảm xúc theo yêu cầu */}
        <p className="font-serif text-sm italic text-[var(--text-muted)]">
          made slowly, by hand · a little cozy place for your heart ✿
        </p>

        {/* Chi tiết nhỏ font mono */}
        <p className="font-mono text-[9px] tracking-widest text-[var(--text-muted)]/60 uppercase">
          JUNHI MOOD JOURNAL · ALL YOUR THOUGHTS ARE SAFE HERE
        </p>
      </div>
    </footer>
  )
}
