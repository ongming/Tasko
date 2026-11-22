import { arrayMove } from '@dnd-kit/sortable'

/**
 * Tính toán position mới theo thuật toán Midpoint (Điểm giữa) chuẩn Jira.
 * Dùng chung cho Kanban Board, Backlog/Sprint và các danh sách có sắp xếp thứ tự.
 */
export function calculateNewPosition<T extends { position?: number | null }>(
  targetItems: T[],
  targetIndex: number,
): number {
  if (targetItems.length === 0) return 1000

  if (targetIndex <= 0) {
    const firstPos = targetItems[0].position ?? 1000
    return firstPos > 1 ? Math.round(firstPos / 2) : firstPos - 1000
  }

  if (targetIndex >= targetItems.length) {
    const lastPos = targetItems[targetItems.length - 1].position ?? 1000
    return lastPos + 1000
  }

  const prevPos = targetItems[targetIndex - 1].position ?? 1000
  const nextPos = targetItems[targetIndex].position ?? prevPos + 2000
  return Math.round((prevPos + nextPos) / 2)
}

/**
 * Xác định chính xác position mới khi thả item (xử lý đúng cả kéo từ trên xuống dưới cùng lẫn từ dưới lên trên).
 */
export function resolveDropPosition<T extends { id: string; position?: number | null }>(
  targetContainerItemsSorted: T[],
  activeId: string,
  overId: string,
): number {
  const withoutActive = targetContainerItemsSorted.filter((item) => item.id !== activeId)
  const oldIndex = targetContainerItemsSorted.findIndex((item) => item.id === activeId)
  const overIndex = targetContainerItemsSorted.findIndex((item) => item.id === overId)

  let finalIndex: number
  if (overIndex === -1) {
    finalIndex = withoutActive.length
  } else if (oldIndex >= 0) {
    const reordered = arrayMove(targetContainerItemsSorted, oldIndex, overIndex)
    finalIndex = reordered.findIndex((item) => item.id === activeId)
  } else {
    finalIndex = overIndex
  }

  return calculateNewPosition(withoutActive, finalIndex)
}
