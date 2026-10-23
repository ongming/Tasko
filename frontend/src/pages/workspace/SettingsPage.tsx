import React from 'react'

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Cài đặt không gian làm việc
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cấu hình thông tin nhóm, thông báo và tích hợp hệ thống.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-base font-bold text-slate-900">Thông tin chung</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tên Workspace</label>
              <input
                type="text"
                defaultValue="Marketing Team"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Mã định danh URL</label>
              <input
                type="text"
                defaultValue="marketing-team"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Tích hợp Tasko Gemini AI</h3>
            <p className="text-xs text-slate-500">Tự động gợi ý phân rã User Story và dự báo rủi ro Sprint</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            Đang kích hoạt
          </span>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
