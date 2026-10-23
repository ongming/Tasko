import React from 'react'

export function Footer() {
  return (
    <footer className="bg-[#f8faff] border-t border-slate-200/80 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 Tasko. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-800 transition-colors">
              Điều khoản sử dụng
            </a>
            <span>|</span>
            <a href="#" className="hover:text-slate-800 transition-colors">
              Chính sách bảo mật
            </a>
            <span>|</span>
            <a href="#" className="hover:text-slate-800 transition-colors">
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
