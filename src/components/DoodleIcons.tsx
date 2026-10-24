import type { SVGProps } from 'react'

interface DoodleProps extends SVGProps<SVGSVGElement> {
  size?: number
  color?: string
}

/**
 * 5 Khuôn mặt cảm xúc vẽ tay (Hand-drawn Doodle Faces)
 * Nét bút mực đen hữu cơ không đều, má ửng màu pastel
 */

// Mood 1: Mỏi mệt / Buồn nhẹ (Màu nền đỏ đất #E08A82)
export function DoodleMood1({ size = 48, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...props}>
      {/* Vòng tròn mặt vẽ tay lượn sóng */}
      <path
        d="M24 5C13.5 5.2 5.2 13.8 5 24.2C4.8 34.8 13.2 43 23.8 43C34.2 43 42.8 34.5 43 24C43.2 13.5 34.5 4.8 24 5Z"
        fill="#FDF8F7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mắt buồn nhắm nhẹ */}
      <path d="M15 22C17 20 19 20 21 22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M27 22C29 20 31 20 33 22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Má hồng phớt */}
      <ellipse cx="14" cy="27" rx="3.5" ry="2" fill="#E08A82" opacity="0.6" />
      <ellipse cx="34" cy="27" rx="3.5" ry="2" fill="#E08A82" opacity="0.6" />
      {/* Miệng hơi xịu nhẹ cute */}
      <path d="M19 33C21.5 30.5 26.5 30.5 29 33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Giọt nước mắt nhỏ xíu */}
      <path d="M34 23C34 23 35.5 25.5 35.5 26.5C35.5 27.3 34.8 28 34 28C33.2 28 32.5 27.3 32.5 26.5C32.5 25.5 34 23 34 23Z" fill="#CFE0F1" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

// Mood 2: Hơi chông chênh (Màu nền cam đào #F2B58B)
export function DoodleMood2({ size = 48, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...props}>
      <path
        d="M24.2 5.1C13.8 4.9 5.1 13.4 5 23.9C4.9 34.5 13.4 43 24 42.9C34.5 42.8 43 34.3 42.9 23.8C42.8 13.2 34.7 5.3 24.2 5.1Z"
        fill="#FEFAF7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mắt tròn chấm mực nhỏ */}
      <circle cx="17.5" cy="22" r="2.2" fill="currentColor" />
      <circle cx="30.5" cy="22" r="2.2" fill="currentColor" />
      {/* Má cam đào */}
      <ellipse cx="14" cy="27" rx="3.5" ry="2" fill="#F2B58B" opacity="0.65" />
      <ellipse cx="34" cy="27" rx="3.5" ry="2" fill="#F2B58B" opacity="0.65" />
      {/* Miệng ngang lượn sóng nhẹ */}
      <path d="M19 31C21 32 23 30 25 31C27 32 29 31 30 30.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Mood 3: Bình yên / Tĩnh lặng (Màu nền vàng bơ #F6E3A8)
export function DoodleMood3({ size = 48, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...props}>
      <path
        d="M24 5C13.4 5 5 13.5 5.1 24.1C5.2 34.6 13.7 43 24.2 42.9C34.7 42.8 43.1 34.4 43 23.9C42.9 13.3 34.6 5 24 5Z"
        fill="#FFFDF7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mắt nhắm cong thanh thản */}
      <path d="M15 22C17 24 20 24 22 22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M26 22C28 24 31 24 33 22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Má vàng bơ ấm */}
      <ellipse cx="14" cy="26" rx="3.5" ry="2" fill="#F6E3A8" opacity="0.85" />
      <ellipse cx="34" cy="26" rx="3.5" ry="2" fill="#F6E3A8" opacity="0.85" />
      {/* Miệng mỉm cười thanh bình nhỏ */}
      <path d="M21 30C23 32 25 32 27 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Mood 4: Nhẹ nhõm / Vui vẻ (Màu nền xanh bạc hà #BFDDCB)
export function DoodleMood4({ size = 48, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...props}>
      <path
        d="M24.1 5.2C13.6 5 5 13.5 5.2 24.1C5.4 34.6 13.9 43 24.4 42.9C34.9 42.8 43.2 34.3 43 23.7C42.8 13.2 34.6 5.4 24.1 5.2Z"
        fill="#F7FCF9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mắt cười cong tít */}
      <path d="M14.5 21C17 18 20 18 22.5 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M25.5 21C28 18 31 18 33.5 21" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* Má hồng phớt */}
      <ellipse cx="13" cy="26" rx="3.8" ry="2.2" fill="#F4C6D0" opacity="0.75" />
      <ellipse cx="35" cy="26" rx="3.8" ry="2.2" fill="#F4C6D0" opacity="0.75" />
      {/* Nụ cười vui vẻ */}
      <path d="M19 28C21.5 33 26.5 33 29 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Mood 5: Ngập tràn ấm áp (Màu nền xanh lá dịu #8CC3A0)
export function DoodleMood5({ size = 48, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className} {...props}>
      <path
        d="M24 5C13.5 5.1 5.1 13.6 5.1 24.2C5.1 34.7 13.6 43.1 24.1 43C34.6 42.9 43 34.4 43 23.8C43 13.3 34.5 4.9 24 5Z"
        fill="#F5FAF6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Mắt sao lấp lánh vẽ tay */}
      <path d="M18 19L19.5 22.5L23 23L19.5 23.5L18 27L16.5 23.5L13 23L16.5 22.5Z" fill="#F6E3A8" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M30 19L31.5 22.5L35 23L31.5 23.5L30 27L28.5 23.5L25 23L28.5 22.5Z" fill="#F6E3A8" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Má hồng hào tươi tắn */}
      <ellipse cx="12" cy="27" rx="4" ry="2.5" fill="#F4C6D0" opacity="0.8" />
      <ellipse cx="36" cy="27" rx="4" ry="2.5" fill="#F4C6D0" opacity="0.8" />
      {/* Miệng cười thật to, hàm răng nhỏ */}
      <path d="M17.5 28C19.5 35 28.5 35 30.5 28Z" fill="#E08A82" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M20 28C22 30 26 30 28 28" fill="#FFFDF7" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

/**
 * Họa tiết trang trí vẽ tay nét không đều (Whimsical Decorative Doodles)
 */

export function DoodleStar({ size = 24, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <path
        d="M12 2C12.5 7 14.5 9.5 20 10.5C14.5 11.5 12.5 14 12 20C11.5 14 9.5 11.5 4 10.5C9.5 9.5 11.5 7 12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DoodleMoon({ size = 28, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} {...props}>
      <path
        d="M19.5 5C13 5.5 8 10.8 8 17.5C8 24.5 13.5 30 20.5 30C23.5 30 26.2 28.9 28.2 27.2C21.5 27.2 16.5 22 16.5 15.5C16.5 10.8 19 6.8 22.8 5.2C21.7 5.1 20.6 5 19.5 5Z"
        fill="#F6E3A8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Chi tiết mặt ngủ yên trên trăng */}
      <path d="M14 14C14.8 15 15.8 15 16.5 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="13" cy="18" rx="1.5" ry="1" fill="#F4C6D0" opacity="0.8" />
    </svg>
  )
}

export function DoodleSun({ size = 32, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className={className} {...props}>
      <circle cx="18" cy="18" r="8" fill="#F6E3A8" stroke="currentColor" strokeWidth="1.8" />
      {/* Tia nắng vẽ tay */}
      <path d="M18 4V7M18 29V32M4 18H7M29 18H32M8 8L10.5 10.5M25.5 25.5L28 28M8 28L10.5 25.5M25.5 10.5L28 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Mặt cười trên mặt trời */}
      <circle cx="15.5" cy="17" r="1" fill="currentColor" />
      <circle cx="20.5" cy="17" r="1" fill="currentColor" />
      <path d="M16 20.5C17 21.5 19 21.5 20 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function DoodleCloud({ size = 32, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 24" fill="none" className={className} {...props}>
      <path
        d="M9 19H27C29.8 19 32 16.8 32 14C32 11.4 30.1 9.3 27.5 9.1C26.8 5.6 23.7 3 20 3C16.8 3 14 4.8 12.8 7.5C8.9 7.7 5.8 10.8 5.8 14.7C5.8 17.1 7.2 19 9 19Z"
        fill="#FBFAF7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DoodleFlower({ size = 20, className = '', ...props }: DoodleProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      {/* 5 cánh hoa */}
      <circle cx="12" cy="7" r="3.5" fill="#F4C6D0" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="16.5" cy="10.5" r="3.5" fill="#F4C6D0" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="15" cy="16" r="3.5" fill="#F4C6D0" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="9" cy="16" r="3.5" fill="#F4C6D0" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="7.5" cy="10.5" r="3.5" fill="#F4C6D0" stroke="currentColor" strokeWidth="1.3" />
      {/* Nhụy hoa */}
      <circle cx="12" cy="12" r="3" fill="#F6E3A8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

export function DoodleWashiTape({ className = '', color = '#F6E3A8' }: { className?: string; color?: string }) {
  return (
    <div
      className={`h-4 w-16 opacity-80 shadow-sm ${className}`}
      style={{
        backgroundColor: color,
        clipPath: 'polygon(0% 15%, 5% 0%, 95% 0%, 100% 15%, 98% 85%, 95% 100%, 5% 100%, 0% 85%)',
      }}
    />
  )
}
