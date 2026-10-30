import React from 'react'
import { Plus } from 'lucide-react'
import teamPermissionsImg from '@/assets/imgs/undraw_team-permissions_1lrk.svg'

interface NoWorkspaceEmptyStateProps {
  onOpenCreateWorkspace: () => void
}

export const NoWorkspaceEmptyState: React.FC<NoWorkspaceEmptyStateProps> = ({
  onOpenCreateWorkspace,
}) => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-12 px-4 text-center select-none">
      {/* 1. Hình ảnh minh họa tinh gọn, cân đối */}
      <div className="max-w-xs sm:max-w-sm w-full mx-auto">
        <img
          src={teamPermissionsImg}
          alt="Chưa có không gian làm việc"
          className="w-full h-auto max-h-56 object-contain mx-auto pointer-events-none drop-shadow-xs"
        />
      </div>

      {/* 2. Tiêu đề và mô tả ngắn gọn */}
      <div className="mt-8 max-w-md mx-auto space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          Chưa có không gian làm việc nào
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Tạo không gian làm việc để bắt đầu quản lý dự án và cộng tác cùng các thành viên.
        </p>
      </div>

      {/* 3. Nút Tạo không gian làm việc - Tối giản, thanh lịch */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onOpenCreateWorkspace}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-semibold shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo không gian làm việc</span>
        </button>
      </div>
    </div>
  )
}

export default NoWorkspaceEmptyState
