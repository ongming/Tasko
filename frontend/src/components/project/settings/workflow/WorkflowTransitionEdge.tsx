import React, { memo } from 'react'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from '@xyflow/react'
import { X } from 'lucide-react'

export interface WorkflowTransitionEdgeData extends Record<string, unknown> {
  label?: string
  isBidirectional?: boolean
  onDeleteEdge?: (edgeId: string) => void
  onSelectEdge?: (edgeId: string) => void
}

export type WorkflowTransitionFlowEdge = Edge<WorkflowTransitionEdgeData, 'transitionEdge'>

export const WorkflowTransitionEdge: React.FC<EdgeProps<WorkflowTransitionFlowEdge>> = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    selected,
    data,
  }) => {
    const isBidirectional = Boolean(data?.isBidirectional)

    let edgePath = ''
    let labelX = 0
    let labelY = 0

    if (isBidirectional) {
      // Tách làn tự động cho cặp mũi tên ngược chiều (A -> B và B -> A) bằng đường cong bậc 2 đối xứng
      const dx = targetX - sourceX
      const dy = targetY - sourceY
      const len = Math.hypot(dx, dy) || 1
      const normX = -dy / len
      const normY = dx / len
      const offset = 38

      const midX = (sourceX + targetX) / 2
      const midY = (sourceY + targetY) / 2
      const ctrlX = midX + normX * offset
      const ctrlY = midY + normY * offset

      edgePath = `M ${sourceX} ${sourceY} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`
      labelX = 0.5 * midX + 0.5 * ctrlX
      labelY = 0.5 * midY + 0.5 * ctrlY
    } else {
      const [bezierPath, bx, by] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      })
      edgePath = bezierPath
      labelX = bx
      labelY = by
    }

    const strokeColor = selected ? '#4f46e5' : '#94a3b8'
    const strokeWidth = selected ? 2.2 : 1.6
    const hasLabel = Boolean(data?.label && data.label.trim())

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          interactionWidth={18}
          style={{
            stroke: strokeColor,
            strokeWidth,
            transition: 'stroke 150ms ease, stroke-width 150ms ease',
          }}
        />

        {(hasLabel || selected) && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="nodrag nopan z-20 flex items-center gap-1"
            >
              {hasLabel && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    data?.onSelectEdge?.(id)
                  }}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shadow-2xs transition-colors cursor-pointer ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white/95 text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                  }`}
                >
                  {data?.label}
                </button>
              )}

              {selected && data?.onDeleteEdge && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    data.onDeleteEdge?.(id)
                  }}
                  title="Xóa mũi tên chuyển trạng thái này"
                  aria-label="Xóa mũi tên chuyển trạng thái"
                  className="w-5 h-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    )
  },
)

WorkflowTransitionEdge.displayName = 'WorkflowTransitionEdge'

export default WorkflowTransitionEdge
