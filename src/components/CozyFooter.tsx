import { DoodleFlower, DoodleStar } from './DoodleIcons'

export default function CozyFooter() {
  return (
    <footer className="mt-16 border-t border-[#2B2724]/10 py-10 text-center select-none dark:border-white/10">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-center gap-3 px-4">
        {/* Dãy ký tự ✕✕✕✕✕✕✕✕✕✕ dạng mono */}
        <div className="flex items-center gap-2 text-[#7A736B]/60 dark:text-[#A8A199]/40">
          <DoodleFlower size={14} className="text-[#F4C6D0]" />
          <span className="font-mono text-[11px] tracking-[0.35em] uppercase">
            ✕✕✕✕✕✕✕✕✕✕
          </span>
          <DoodleStar size={14} className="text-[#F6E3A8]" />
        </div>

        {/* Dòng chữ cảm xúc theo yêu cầu */}
        <p className="font-serif text-sm italic text-[#7A736B] dark:text-[#A8A199]">
          made slowly, by hand · a little cozy place for your heart ✿
        </p>

        {/* Chi tiết nhỏ font mono */}
        <p className="font-mono text-[9px] tracking-widest text-[#7A736B]/60 dark:text-[#A8A199]/50 uppercase">
          JUNHI MOOD JOURNAL · ALL YOUR THOUGHTS ARE SAFE HERE
        </p>
      </div>
    </footer>
  )
}
