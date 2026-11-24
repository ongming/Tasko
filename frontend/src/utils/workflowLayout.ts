import type { ProjectStatus, WorkflowTransition } from '@/types/projectConfig'

export interface WorkflowNodePosition {
  x: number
  y: number
}

export type WorkflowLayoutMap = Record<string, WorkflowNodePosition>

export interface DraftTransition {
  fromStatusId: string
  toStatusId: string
  label?: string
  sourceHandle?: string
  targetHandle?: string
  conditions?: Record<string, any>
}

const CATEGORY_ORDER: Record<ProjectStatus['category'], number> = {
  TODO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
}

export function getTransitionKey(fromStatusId: string, toStatusId: string): string {
  return `${fromStatusId}->${toStatusId}`
}

/**
 * Sắp xếp danh sách trạng thái theo thứ tự luồng chuẩn (TODO -> IN_PROGRESS -> DONE) rồi tới position.
 */
export function sortStatusesForWorkflow(statuses: ProjectStatus[]): ProjectStatus[] {
  return [...statuses].sort((a, b) => {
    const catDiff = (CATEGORY_ORDER[a.category] ?? 1) - (CATEGORY_ORDER[b.category] ?? 1)
    if (catDiff !== 0) return catDiff
    return (a.position ?? 0) - (b.position ?? 0)
  })
}

/**
 * Tính toán vị trí (x, y) tự động sao cho không có 3 node thẳng hàng gây đè mũi tên chéo.
 */
export function computeAutoLayoutPositions(statuses: ProjectStatus[]): WorkflowLayoutMap {
  const ordered = sortStatusesForWorkflow(statuses)
  const n = ordered.length
  const map: WorkflowLayoutMap = {}

  if (n === 0) return map

  if (n === 1) {
    map[ordered[0].id] = { x: 240, y: 160 }
    return map
  }

  if (n === 2) {
    map[ordered[0].id] = { x: 100, y: 165 }
    map[ordered[1].id] = { x: 460, y: 165 }
    return map
  }

  if (n === 3) {
    // Bố cục vòm tam giác cân: mũi tên từ Cột 1 <-> Cột 3 đi bên dưới không cắt ngang Cột 2
    map[ordered[0].id] = { x: 70, y: 195 }
    map[ordered[1].id] = { x: 370, y: 70 }
    map[ordered[2].id] = { x: 670, y: 195 }
    return map
  }

  if (n === 4) {
    // Bố cục lượn sóng 4 điểm không thẳng hàng
    map[ordered[0].id] = { x: 55, y: 165 }
    map[ordered[1].id] = { x: 315, y: 65 }
    map[ordered[2].id] = { x: 565, y: 255 }
    map[ordered[3].id] = { x: 825, y: 145 }
    return map
  }

  // Từ 5 trạng thái trở lên: chia cột 2 hàng so le nhẹ
  ordered.forEach((st, idx) => {
    const col = Math.floor(idx / 2)
    const row = idx % 2
    map[st.id] = {
      x: 55 + col * 285,
      y: 70 + row * 185 + (col % 2 === 1 ? 35 : 0),
    }
  })

  return map
}

/**
 * Chọn cặp cổng nối (Handle) tối ưu dựa trên vị trí tương đối giữa 2 Node.
 */
export function resolveOptimalHandles(
  sourcePos: WorkflowNodePosition,
  targetPos: WorkflowNodePosition,
): { sourceHandle: string; targetHandle: string } {
  const dx = targetPos.x - sourcePos.x
  const dy = targetPos.y - sourcePos.y

  if (Math.abs(dx) >= Math.abs(dy) * 0.75) {
    return dx >= 0
      ? { sourceHandle: 'right', targetHandle: 'left' }
      : { sourceHandle: 'left', targetHandle: 'right' }
  }

  return dy >= 0
    ? { sourceHandle: 'bottom', targetHandle: 'top' }
    : { sourceHandle: 'top', targetHandle: 'bottom' }
}

/**
 * Chuyển danh sách WorkflowTransition từ API sang map DraftTransition dùng chung cho cả Sơ đồ và Ma trận.
 */
export function transitionsToDraftMap(
  transitions?: WorkflowTransition[],
): Record<string, DraftTransition> {
  const result: Record<string, DraftTransition> = {}
  if (!transitions) return result

  for (const t of transitions) {
    if (!t.fromStatusId || !t.toStatusId || t.fromStatusId === t.toStatusId) continue
    const key = getTransitionKey(t.fromStatusId, t.toStatusId)
    const cond = t.conditions && typeof t.conditions === 'object' ? t.conditions : {}
    result[key] = {
      fromStatusId: t.fromStatusId,
      toStatusId: t.toStatusId,
      label: typeof cond.label === 'string' ? cond.label : undefined,
      sourceHandle: typeof cond.sourceHandle === 'string' ? cond.sourceHandle : undefined,
      targetHandle: typeof cond.targetHandle === 'string' ? cond.targetHandle : undefined,
      conditions: cond,
    }
  }

  return result
}

/**
 * Chuyển map DraftTransition về mảng payload gửi lên API Backend.
 */
export function draftMapToTransitionPayload(
  draftMap: Record<string, DraftTransition>,
): Array<{ fromStatusId: string; toStatusId: string; conditions: Record<string, any> }> {
  return Object.values(draftMap)
    .filter((item) => item.fromStatusId && item.toStatusId && item.fromStatusId !== item.toStatusId)
    .map((item) => {
      const nextConditions: Record<string, any> = { ...(item.conditions || {}) }
      if (item.label && item.label.trim()) {
        nextConditions.label = item.label.trim()
      } else {
        delete nextConditions.label
      }
      if (item.sourceHandle) nextConditions.sourceHandle = item.sourceHandle
      if (item.targetHandle) nextConditions.targetHandle = item.targetHandle

      return {
        fromStatusId: item.fromStatusId,
        toStatusId: item.toStatusId,
        conditions: nextConditions,
      }
    })
}
