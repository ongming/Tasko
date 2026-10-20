import React from 'react'

export function Logo({ className = 'w-8 h-8', size }) {
  const style = size ? { width: size, height: size } : undefined

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        {/* Top Piece Gradient (Soft Periwinkle / Violet) */}
        <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A2A7FF" />
          <stop offset="100%" stopColor="#737BF8" />
        </linearGradient>

        {/* Bottom Left Piece Gradient (Purple to Indigo) */}
        <linearGradient id="leftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#AA42E8" />
          <stop offset="100%" stopColor="#5849F3" />
        </linearGradient>

        {/* Bottom Right Piece Gradient (Royal Blue to Sky Blue) */}
        <linearGradient id="rightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4654F7" />
          <stop offset="100%" stopColor="#24A7F8" />
        </linearGradient>
      </defs>

      {/* 1. Phần mái trên (Nắp lục giác) */}
      <path
        d="M 243 47
           Q 256 39 269 47
           L 435 141
           Q 446 148 440 160
           Q 435 166 422 166
           H 90
           Q 77 166 72 160
           Q 66 148 77 141
           Z"
        fill="url(#topGradient)"
      />

      {/* 2. Khối dưới bên trái (Mặt trái lục giác) */}
      <path
        d="M 82 202
           H 220
           Q 235 202 235 217
           V 428
           Q 235 444 221 437
           L 79 360
           Q 66 353 66 338
           V 218
           Q 66 202 82 202
           Z"
        fill="url(#leftGradient)"
      />

      {/* 3. Khối dưới bên phải (Mặt phải lục giác) */}
      <path
        d="M 292 202
           H 430
           Q 446 202 446 218
           V 338
           Q 446 353 433 360
           L 291 437
           Q 277 444 277 428
           V 217
           Q 277 202 292 202
           Z"
        fill="url(#rightGradient)"
      />
    </svg>
  )
}

export default Logo
