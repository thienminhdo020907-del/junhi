import { DoodleFlower } from './DoodleIcons'

interface PageHeaderProps {
  title: string
  subtitle?: string
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8 flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <DoodleFlower size={18} className="text-[#F4C6D0]" />
        <h1 className="font-serif text-2xl sm:text-3xl font-normal italic text-[#2B2724] dark:text-[#EDE8E3]">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="font-sans text-xs sm:text-sm text-[#7A736B] dark:text-[#A8A199] pl-6">
          {subtitle}
        </p>
      )}
    </header>
  )
}
