import React, { useEffect, useMemo, useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  ConnectionMode,
  MarkerType,
  useNodesState,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  ArrowRight,
  LayoutGrid,
  Network,
  RotateCcw,
  Tag,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react'
import type { ProjectStatus } from '@/types/projectConfig'
import {
  computeAutoLayoutPositions,
  getTransitionKey,
  resolveOptimalHandles,
  sortStatusesForWorkflow,
  type DraftTransition,
  type WorkflowLayoutMap,
  type WorkflowNodePosition,
} from '@/utils/workflowLayout'
import {
  WorkflowStatusNode,
  type WorkflowStatusFlowNode,
} from './WorkflowStatusNode'
import {
  WorkflowTransitionEdge,
  type WorkflowTransitionFlowEdge,
} from './WorkflowTransitionEdge'

const NODE_TYPES: NodeTypes = {
  statusNode: WorkflowStatusNode,
}

const EDGE_TYPES: EdgeTypes = {
  transitionEdge: WorkflowTransitionEdge,
}

const QUICK_LABELS = ['Bắt đầu làm', 'Gửi kiểm thử', 'Nghiệm thu', 'Cần sửa lại']

export interface WorkflowDiagramCanvasProps {
  statuses: ProjectStatus[]
  draftMap: Record<string, DraftTransition>
  nodePositions: WorkflowLayoutMap
  onPositionChange: (statusId: string, pos: WorkflowNodePosition) => void
  onResetAutoLayout: () => void
  onAddOrUpdateTransition: (transition: DraftTransition) => void
  onRemoveTransition: (key: string) => void
  onApplySequentialFlow: () => void
  onAllowAll: () => void
  onClearAll: () => void
}

export const WorkflowDiagramCanvas: React.FC<WorkflowDiagramCanvasProps> = ({
  statuses,
  draftMap,
  nodePositions,
  onPositionChange,
  onResetAutoLayout,
  onAddOrUpdateTransition,
  onRemoveTransition,
  onApplySequentialFlow,
  onAllowAll,
  onClearAll,
}) => {
  const [selectedEdgeKey, setSelectedEdgeKey] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowStatusFlowNode>([])

  const orderedStatuses = useMemo(() => sortStatusesForWorkflow(statuses), [statuses])
  const fallbackPositions = useMemo(() => computeAutoLayoutPositions(statuses), [statuses])

  const statusById = useMemo(() => {
    const map = new Map<string, ProjectStatus>()
    statuses.forEach((s) => map.set(s.id, s))
    return map
  }, [statuses])

  // Thống kê số lượng mũi tên vào/ra trên mỗi trạng thái
  const connectionStats = useMemo(() => {
    const incoming: Record<string, number> = {}
    const outgoing: Record<string, number> = {}
    statuses.forEach((s) => {
      incoming[s.id] = 0
      outgoing[s.id] = 0
    })
    Object.values(draftMap).forEach((t) => {
      if (outgoing[t.fromStatusId] !== undefined) outgoing[t.fromStatusId] += 1
      if (incoming[t.toStatusId] !== undefined) incoming[t.toStatusId] += 1
    })
    return { incoming, outgoing }
  }, [statuses, draftMap])

  const orphanCount = useMemo(() => {
    if (statuses.length <= 1) return 0
    return statuses.filter(
      (s) => (connectionStats.incoming[s.id] || 0) === 0 && (connectionStats.outgoing[s.id] || 0) === 0,
    ).length
  }, [statuses, connectionStats])

  const initialStatusId = useMemo(() => {
    const explicitDefault = statuses.find((s) => s.is_default)
    return explicitDefault?.id || orderedStatuses[0]?.id || ''
  }, [statuses, orderedStatuses])

  // Đồng bộ danh sách Node với statuses, vị trí và thống kê vào/ra
  useEffect(() => {
    setNodes((prevNodes) => {
      const prevPosMap = new Map(prevNodes.map((n) => [n.id, n.position]))
      return orderedStatuses.map((st) => {
        const inCount = connectionStats.incoming[st.id] || 0
        const outCount = connectionStats.outgoing[st.id] || 0
        const pos =
          nodePositions[st.id] ||
          prevPosMap.get(st.id) ||
          fallbackPositions[st.id] || { x: 80, y: 120 }

        return {
          id: st.id,
          type: 'statusNode',
          position: pos,
          data: {
            status: st,
            isInitial: st.id === initialStatusId,
            isOrphan: statuses.length > 1 && inCount === 0 && outCount === 0,
            incomingCount: inCount,
            outgoingCount: outCount,
          },
        }
      })
    })
  }, [
    orderedStatuses,
    statuses.length,
    nodePositions,
    fallbackPositions,
    connectionStats,
    initialStatusId,
    setNodes,
  ])

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      onRemoveTransition(edgeId)
      setSelectedEdgeKey((prev) => (prev === edgeId ? null : prev))
    },
    [onRemoveTransition],
  )

  // Xây dựng danh sách Edges từ draftMap và vị trí hiện tại của các Node
  const currentPosLookup = useMemo(() => {
    const lookup: WorkflowLayoutMap = { ...fallbackPositions, ...nodePositions }
    nodes.forEach((n) => {
      lookup[n.id] = n.position
    })
    return lookup
  }, [fallbackPositions, nodePositions, nodes])

  const edges: WorkflowTransitionFlowEdge[] = useMemo(() => {
    return Object.values(draftMap)
      .filter(
        (t) =>
          statusById.has(t.fromStatusId) &&
          statusById.has(t.toStatusId) &&
          t.fromStatusId !== t.toStatusId,
      )
      .map((t) => {
        const key = getTransitionKey(t.fromStatusId, t.toStatusId)
        const reverseKey = getTransitionKey(t.toStatusId, t.fromStatusId)
        const isBidirectional = Boolean(draftMap[reverseKey])
        const isSelected = selectedEdgeKey === key

        const fromPos = currentPosLookup[t.fromStatusId] || { x: 0, y: 0 }
        const toPos = currentPosLookup[t.toStatusId] || { x: 300, y: 0 }
        const autoHandles = resolveOptimalHandles(fromPos, toPos)

        return {
          id: key,
          source: t.fromStatusId,
          target: t.toStatusId,
          sourceHandle: t.sourceHandle || autoHandles.sourceHandle,
          targetHandle: t.targetHandle || autoHandles.targetHandle,
          type: 'transitionEdge',
          selected: isSelected,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: isSelected ? '#4f46e5' : '#64748b',
          },
          data: {
            label: t.label,
            isBidirectional,
            onDeleteEdge: handleDeleteEdge,
            onSelectEdge: setSelectedEdgeKey,
          },
        }
      })
  }, [draftMap, statusById, selectedEdgeKey, currentPosLookup, handleDeleteEdge])

  // Xử lý kéo dây nối giữa 2 Node
  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return
      if (connection.source === connection.target) return

      const key = getTransitionKey(connection.source, connection.target)
      const existing = draftMap[key]

      onAddOrUpdateTransition({
        fromStatusId: connection.source,
        toStatusId: connection.target,
        label: existing?.label,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        conditions: existing?.conditions,
      })
      setSelectedEdgeKey(key)
    },
    [draftMap, onAddOrUpdateTransition],
  )

  // Hỗ trợ nhấn phím Delete / Backspace để xóa mũi tên đang chọn
  useEffect(() => {
    if (!selectedEdgeKey) return
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        handleDeleteEdge(selectedEdgeKey)
      } else if (e.key === 'Escape') {
        setSelectedEdgeKey(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedEdgeKey, handleDeleteEdge])

  const selectedTransition = selectedEdgeKey ? draftMap[selectedEdgeKey] || null : null
  const fromStatus = selectedTransition ? statusById.get(selectedTransition.fromStatusId) : null
  const toStatus = selectedTransition ? statusById.get(selectedTransition.toStatusId) : null

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden flex flex-col">
      {/* 1. Thanh công cụ phía trên Bảng vẽ */}
      <div className="px-4 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>
            Kéo từ <strong className="text-indigo-600">chấm tròn</strong> cạnh cột này sang cột khác để nối mũi tên • Nhấn vào mũi tên để đặt tên hoặc xóa.
          </span>
          {orphanCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              <span>{orphanCount} cột chưa có luồng</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onResetAutoLayout}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            title="Sắp xếp lại vị trí các khối ngay ngắn"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span>Sắp xếp tự động</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onApplySequentialFlow()
              setSelectedEdgeKey(null)
            }}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            title="Tạo luồng 1 chiều tuần tự theo thứ tự cột"
          >
            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
            <span>Luồng tuần tự</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onAllowAll()
              setSelectedEdgeKey(null)
            }}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            title="Cho phép chuyển đổi tự do giữa mọi trạng thái"
          >
            <Network className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nối tất cả</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClearAll()
              setSelectedEdgeKey(null)
            }}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-rose-200/80 bg-white hover:bg-rose-50 text-[11px] font-semibold text-rose-600 transition-colors cursor-pointer"
            title="Xóa toàn bộ mũi tên trên bảng"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Xóa hết</span>
          </button>
        </div>
      </div>

      {/* 2. Vùng Canvas kéo-thả & nối mũi tên */}
      <div className="relative h-[500px] w-full bg-slate-50/70">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onConnect={handleConnect}
          onNodeDragStop={(_event, node) => {
            onPositionChange(node.id, {
              x: Math.round(node.position.x),
              y: Math.round(node.position.y),
            })
          }}
          onEdgeClick={(_event, edge) => setSelectedEdgeKey(edge.id)}
          onPaneClick={() => setSelectedEdgeKey(null)}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          style={{ backgroundColor: '#f8fafc', colorScheme: 'light' }}
          connectionMode={ConnectionMode.Loose}
          deleteKeyCode={null}
          fitView
          fitViewOptions={{ padding: 0.24, maxZoom: 1.1 }}
          minZoom={0.45}
          maxZoom={1.75}
          snapToGrid
          snapGrid={[12, 12]}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'transitionEdge',
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={18}
            size={1.2}
            color="#cbd5e1"
            bgColor="#f8fafc"
          />
          <Controls
            showInteractive={false}
            className="!bg-white !border !border-slate-200/90 !rounded-xl !shadow-sm overflow-hidden"
          />
        </ReactFlow>

        {/* 3. Thanh Inspector chỉnh sửa nhanh khi đang chọn một mũi tên */}
        {selectedTransition && fromStatus && toStatus && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200 shadow-xl px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs min-w-0">
              <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="font-bold text-slate-800 truncate">{fromStatus.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-indigo-700 truncate">{toStatus.name}</span>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <input
                type="text"
                value={selectedTransition.label || ''}
                placeholder="Đặt tên bước chuyển (VD: Gửi QA, Duyệt...)"
                onChange={(e) =>
                  onAddOrUpdateTransition({
                    ...selectedTransition,
                    label: e.target.value,
                  })
                }
                className="flex-1 h-7 px-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />

              <div className="hidden md:flex items-center gap-1">
                {QUICK_LABELS.slice(0, 2).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      onAddOrUpdateTransition({
                        ...selectedTransition,
                        label: preset,
                      })
                    }
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 text-[10px] font-medium text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleDeleteEdge(selectedEdgeKey!)}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                title="Xóa mũi tên này"
              >
                <Trash2 className="w-3 h-3" />
                <span>Xóa</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEdgeKey(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md cursor-pointer"
                title="Đóng thanh chỉnh sửa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkflowDiagramCanvas
