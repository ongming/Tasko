import React, { memo } from 'react'
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { AlertTriangle } from 'lucide-react'
import type { ProjectStatus } from '@/types/projectConfig'

export interface WorkflowStatusNodeData extends Record<string, unknown> {
  status: ProjectStatus
  isInitial: boolean
  isOrphan: boolean
  incomingCount: number
  outgoingCount: number
}

export type WorkflowStatusFlowNode = Node<WorkflowStatusNodeData, 'statusNode'>

const CATEGORY_META: Record<
  ProjectStatus['category'],
  { label: string; pillClass: string; ringClass: string }
> = {
  TODO: {
    label: 'Cần làm',
    pillClass: 'bg-slate-100 text-slate-700 border-slate-200/80',
    ringClass: 'hover:border-slate-400',
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    pillClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    ringClass: 'hover:border-indigo-400',
  },
  DONE: {
    label: 'Hoàn thành',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    ringClass: 'hover:border-emerald-400',
  },
}

const HANDLE_CLASS =
  '!w-2.5 !h-2.5 !bg-white !border-2 !border-indigo-500 transition-transform duration-150 hover:!scale-125 hover:!bg-indigo-600'

export const WorkflowStatusNode: React.FC<NodeProps<WorkflowStatusFlowNode>> = memo(
  ({ data, selected }) => {
    const { status, isInitial, isOrphan, incomingCount, outgoingCount } = data
    const meta = CATEGORY_META[status.category] || CATEGORY_META.TODO

    return (
      <div
        className={`group relative min-w-[188px] max-w-[220px] rounded-xl bg-white px-3.5 py-2.5 border transition-all duration-150 select-none ${
          selected
            ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md'
            : isOrphan
              ? 'border-amber-300 shadow-xs'
              : `border-slate-200/90 shadow-2xs ${meta.ringClass} hover:shadow-xs`
        }`}
      >
        {/* 4 cổng nối (kết hợp ConnectionMode.Loose cho phép kéo và thả ở mọi phía) */}
        <Handle id="top" type="source" position={Position.Top} className={HANDLE_CLASS} />
        <Handle id="right" type="source" position={Position.Right} className={HANDLE_CLASS} />
        <Handle id="bottom" type="source" position={Position.Bottom} className={HANDLE_CLASS} />
        <Handle id="left" type="source" position={Position.Left} className={HANDLE_CLASS} />

        {/* Hàng trên: Nhóm trạng thái & WIP / Khởi tạo */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-none ${meta.pillClass}`}
          >
            {meta.label}
          </span>

          <div className="flex items-center gap-1">
            {isInitial && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-white leading-none">
                Mặc định
              </span>
            )}
            {status.wipLimit ? (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80 leading-none">
                WIP {status.wipLimit}
              </span>
            ) : null}
          </div>
        </div>

        {/* Tên cột trạng thái */}
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-slate-100"
            style={{ backgroundColor: status.color || '#64748b' }}
          />
          <span className="text-xs font-bold text-slate-900 truncate" title={status.name}>
            {status.name}
          </span>
        </div>

        {/* Chân thẻ: Thống kê luồng vào / ra hoặc cảnh báo cô lập */}
        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
          {isOrphan ? (
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
              <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Chưa nối luồng</span>
            </span>
          ) : (
            <>
              <span className="font-mono text-slate-400">Vào: {incomingCount}</span>
              <span className="font-mono text-slate-400">Ra: {outgoingCount}</span>
            </>
          )}
        </div>
      </div>
    )
  },
)

WorkflowStatusNode.displayName = 'WorkflowStatusNode'

export default WorkflowStatusNode
