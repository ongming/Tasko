import React from 'react'

// Nét vẽ mũi tên uốn lượn chỉ vào bảng (bên trái)
export function DoodleArrowLeft({ className = '' }) {
  return (
    <svg
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-indigo-400 pointer-events-none select-none ${className}`}
    >
      {/* Đường cong uốn lượn mềm mại */}
      <path
        d="M 20 110 C 15 50, 45 20, 85 28 C 115 35, 110 75, 75 75 C 55 75, 60 105, 115 95"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Đầu mũi tên chỉ sang phải vào bảng */}
      <path
        d="M 102 85 L 118 95 L 108 108"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 2 tia nhấn nhẹ */}
      <path d="M 25 25 L 35 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M 40 15 L 45 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Họa tiết ngôi sao lấp lánh & tia sáng vẽ tay (bên phải)
export function DoodleSparksRight({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-indigo-400 pointer-events-none select-none ${className}`}
    >
      {/* Ngôi sao vẽ tay 4 cánh (Hand-drawn sparkle) */}
      <path
        d="M 50 15 Q 50 35, 70 35 Q 50 35, 50 55 Q 50 35, 30 35 Q 50 35, 50 15 Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vệt cung lượn sóng */}
      <path
        d="M 40 70 Q 75 45, 105 75"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Các tia sáng nhỏ tỏa ra */}
      <path d="M 85 25 L 98 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 95 42 L 108 42" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M 82 58 L 94 66" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}
