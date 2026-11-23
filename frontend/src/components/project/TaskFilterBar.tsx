import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  X,
  User,
  AlertCircle,
  Tag,
  Check,
  RotateCcw,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Select } from '@/components/ui/Select'
import type { TaskFilterParams, TaskPriority } from '@/types/task'
import type { ProjectMember } from '@/types/member'
import type { ProjectWorkType } from '@/types/projectConfig'

interface TaskFilterBarProps {
  filters: TaskFilterParams
  onFilterChange: (filters: TaskFilterParams) => void
  members?: ProjectMember[]
  workTypes?: ProjectWorkType[]
  totalCount?: number
  filteredCount?: number
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onFilterChange,
  members = [],
  workTypes = [],
  totalCount = 0,
  filteredCount = 0,
}) => {
  const currentUser = useAuthStore((s) => s.user)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // Debounce search input 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onFilterChange({ ...filters, search: searchInput.trim() || undefined })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, filters, onFilterChange])

  // Đồng bộ searchInput nếu filters.search thay đổi từ ngoài (ví dụ khi reset filter)
  useEffect(() => {
    setSearchInput(filters.search || '')
  }, [filters.search])

  const hasActiveFilters = Boolean(
    (filters.search && filters.search.trim()) ||
      filters.assigneeId ||
      filters.priority ||
      filters.workTypeId,
  )

  const isMyTasksActive = filters.assigneeId === currentUser?.id

  const handleToggleMyTasks = () => {
    if (isMyTasksActive) {
      onFilterChange({ ...filters, assigneeId: undefined })
    } else if (currentUser?.id) {
      onFilterChange({ ...filters, assigneeId: currentUser.id })
    }
  }

  const handleClearFilters = () => {
    setSearchInput('')
    onFilterChange({
      sprintId: filters.sprintId,
      isBacklog: filters.isBacklog,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    })
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2.5 w-full py-1">
      {/* Cụm Tìm kiếm + Lọc */}
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-[280px]">
        {/* Search input with debounce */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc mã công việc..."
            aria-label="Tìm kiếm công việc"
            className="w-full h-8 pl-8 pr-7 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-2xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput('')
                onFilterChange({ ...filters, search: undefined })
              }}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Nút lọc nhanh: Việc của tôi */}
        {currentUser?.id && (
          <button
            type="button"
            onClick={handleToggleMyTasks}
            className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs border ${
              isMyTasksActive
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-100'
                : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Việc của tôi</span>
          </button>
        )}

        {/* Dropdown Lọc Người thực hiện (Assignee) */}
        <Select
          value={filters.assigneeId || ''}
          onChange={(val) =>
            onFilterChange({
              ...filters,
              assigneeId: val ? val : undefined,
            })
          }
          className="min-w-[160px]"
          buttonClassName={
            filters.assigneeId && !isMyTasksActive
              ? 'border-indigo-300 text-indigo-700 font-semibold bg-indigo-50/40'
              : 'text-slate-600'
          }
          options={[
            { value: '', label: 'Người thực hiện: Tất cả' },
            { value: 'unassigned', label: 'Chưa giao (Unassigned)' },
            ...members.map((m) => {
              const uId = m.userId || m.user?.id || m.id
              return {
                value: uId,
                label: m.user?.fullName || m.user?.email || uId,
              }
            }),
          ]}
        />

        {/* Dropdown Lọc Độ ưu tiên (Priority) */}
        <Select
          value={filters.priority || ''}
          onChange={(val) =>
            onFilterChange({
              ...filters,
              priority: val ? (val as TaskPriority) : undefined,
            })
          }
          className="min-w-[150px]"
          buttonClassName={
            filters.priority
              ? 'border-indigo-300 text-indigo-700 font-semibold bg-indigo-50/40'
              : 'text-slate-600'
          }
          options={[
            { value: '', label: 'Độ ưu tiên: Tất cả' },
            { value: 'URGENT', label: 'Khẩn cấp (URGENT)', dotColor: 'bg-rose-500' },
            { value: 'HIGH', label: 'Cao (HIGH)', dotColor: 'bg-orange-500' },
            { value: 'MEDIUM', label: 'Trung bình (MEDIUM)', dotColor: 'bg-amber-400' },
            { value: 'LOW', label: 'Thấp (LOW)', dotColor: 'bg-blue-500' },
          ]}
        />

        {/* Dropdown Lọc Loại công việc (WorkType) */}
        {workTypes.length > 0 && (
          <Select
            value={filters.workTypeId || ''}
            onChange={(val) =>
              onFilterChange({
                ...filters,
                workTypeId: val ? val : undefined,
              })
            }
            className="min-w-[150px]"
            buttonClassName={
              filters.workTypeId
                ? 'border-indigo-300 text-indigo-700 font-semibold bg-indigo-50/40'
                : 'text-slate-600'
            }
            options={[
              { value: '', label: 'Loại công việc: Tất cả' },
              ...workTypes.map((wt) => ({
                value: wt.id,
                label: wt.name,
              })),
            ]}
          />
        )}

        {/* Nút Xóa bộ lọc khi có điều kiện active */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer border border-rose-200"
            title="Xóa tất cả điều kiện lọc"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa bộ lọc</span>
          </button>
        )}
      </div>

      {/* Bộ đếm kết quả khớp điều kiện */}
      <div className="text-[11px] font-semibold text-slate-400 shrink-0">
        Hiển thị <strong className="text-slate-700 font-bold">{filteredCount}</strong> / {totalCount} công việc
      </div>
    </div>
  )
}

export default TaskFilterBar
