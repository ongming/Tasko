import { describe, it, expect } from 'vitest'
import type { TaskItem } from '@/types/task'
import {
  buildGanttHierarchy,
  calculateGanttBar,
  applyDragDelta,
  flattenVisibleGanttRows,
} from './ganttUtils'

function makeTask(overrides: Partial<TaskItem> & { id: string }): TaskItem {
  return {
    id: overrides.id,
    projectId: 'proj-1',
    taskKey: overrides.taskKey ?? `TSK-${overrides.id}`,
    title: overrides.title ?? `Task ${overrides.id}`,
    statusId: 'st-1',
    status: overrides.status ?? { id: 'st-1', name: 'To Do', category: 'TODO', color: '#94a3b8' },
    priority: overrides.priority ?? 'MEDIUM',
    position: overrides.position ?? 1000,
    parentTaskId: overrides.parentTaskId ?? null,
    startDate: overrides.startDate ?? null,
    dueDate: overrides.dueDate ?? null,
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    ...overrides,
  }
}

describe('ganttUtils - Pure Functions Unit Tests', () => {
  describe('buildGanttHierarchy()', () => {
    it('gom nhóm đúng cấu trúc cha-con và tính chính xác progressPercent', () => {
      const tasks: TaskItem[] = [
        makeTask({
          id: 'parent-1',
          taskKey: 'TSK-1',
          title: 'Epic Frontend',
          status: { id: 'st-2', name: 'In Progress', category: 'IN_PROGRESS', color: '#3b82f6' },
        }),
        makeTask({
          id: 'child-1',
          parentTaskId: 'parent-1',
          status: { id: 'st-3', name: 'Done', category: 'DONE', color: '#10b981' },
          startDate: '2026-11-05',
          dueDate: '2026-11-08',
        }),
        makeTask({
          id: 'child-2',
          parentTaskId: 'parent-1',
          status: { id: 'st-2', name: 'In Progress', category: 'IN_PROGRESS', color: '#3b82f6' },
          startDate: '2026-11-03',
          dueDate: '2026-11-12',
        }),
        makeTask({
          id: 'child-3',
          parentTaskId: 'parent-1',
          status: { id: 'st-1', name: 'To Do', category: 'TODO', color: '#94a3b8' },
          startDate: '2026-11-10',
          dueDate: '2026-11-15',
        }),
        makeTask({
          id: 'leaf-1',
          status: { id: 'st-3', name: 'Done', category: 'DONE', color: '#10b981' },
          startDate: '2026-11-01',
          dueDate: '2026-11-02',
        }),
      ]

      const roots = buildGanttHierarchy(tasks)

      expect(roots).toHaveLength(2)
      const parentNode = roots[0]
      expect(parentNode.task.id).toBe('parent-1')
      expect(parentNode.isSummary).toBe(true)
      expect(parentNode.children).toHaveLength(3)
      // 1 trong 3 task con DONE => Math.round(1/3 * 100) = 33
      expect(parentNode.progressPercent).toBe(33)
      // Summary span suy diễn từ min(children.startDate) đến max(children.dueDate)
      expect(parentNode.effectiveStartDate).toBe('2026-11-03')
      expect(parentNode.effectiveDueDate).toBe('2026-11-15')

      // Tiến độ task lá
      expect(parentNode.children[0].progressPercent).toBe(100) // DONE
      expect(parentNode.children[1].progressPercent).toBe(50)  // IN_PROGRESS
      expect(parentNode.children[2].progressPercent).toBe(0)   // TODO

      // Leaf gốc
      expect(roots[1].task.id).toBe('leaf-1')
      expect(roots[1].isSummary).toBe(false)
      expect(roots[1].progressPercent).toBe(100)
    })

    it('chống vòng lặp vô hạn khi parentTaskId bị lỗi vòng lặp (self-loop và cycle A <-> B)', () => {
      const tasks: TaskItem[] = [
        makeTask({ id: 'self', parentTaskId: 'self' }),
        makeTask({ id: 'a', parentTaskId: 'b' }),
        makeTask({ id: 'b', parentTaskId: 'a' }),
      ]

      const roots = buildGanttHierarchy(tasks)

      // Không bị stack overflow và không làm mất task nào
      const flattened = flattenVisibleGanttRows(roots, new Set(['self', 'a', 'b']))
      expect(flattened.map((r) => r.node.task.id).sort()).toEqual(['a', 'b', 'self'])
    })

    it('xử lý task mồ côi (parentTaskId không tồn tại trong danh sách) như node gốc', () => {
      const tasks: TaskItem[] = [
        makeTask({ id: 'orphan-1', parentTaskId: 'missing-parent-999', startDate: '2026-11-05', dueDate: '2026-11-07' }),
      ]

      const roots = buildGanttHierarchy(tasks)
      expect(roots).toHaveLength(1)
      expect(roots[0].task.id).toBe('orphan-1')
      expect(roots[0].depth).toBe(0)
    })
  })

  describe('calculateGanttBar()', () => {
    const windowStart = new Date(2026, 10, 1) // 2026-11-01

    it('tính đúng leftPercent và widthPercent cho thanh nằm trọn trong cửa sổ 30 ngày', () => {
      const bar = calculateGanttBar('2026-11-04', '2026-11-09', windowStart, 30)
      expect(bar.hasDates).toBe(true)
      expect(bar.isClampedLeft).toBe(false)
      expect(bar.isClampedRight).toBe(false)
      expect(bar.isOutOfRange).toBe(false)
      // Offset = 3 ngày => 3/30 = 10%
      expect(bar.leftPercent).toBeCloseTo(10, 4)
      // Duration = 6 ngày (từ ngày 4 đến hết ngày 9) => 6/30 = 20%
      expect(bar.widthPercent).toBeCloseTo(20, 4)
    })

    it('đánh dấu isClampedLeft / isClampedRight khi thanh vượt ra ngoài cửa sổ', () => {
      const bar = calculateGanttBar('2026-10-28', '2026-12-05', windowStart, 30)
      expect(bar.hasDates).toBe(true)
      expect(bar.isClampedLeft).toBe(true)
      expect(bar.isClampedRight).toBe(true)
      expect(bar.leftPercent).toBe(0)
      expect(bar.widthPercent).toBe(100)
    })

    it('trả về hasDates = false khi thiếu cả startDate và dueDate', () => {
      const bar = calculateGanttBar(null, null, windowStart, 30)
      expect(bar.hasDates).toBe(false)
      expect(bar.widthPercent).toBe(0)
    })
  })

  describe('applyDragDelta()', () => {
    it('chế độ move: dời đồng thời cả startDate và dueDate giữ nguyên thời lượng', () => {
      const forward = applyDragDelta('2026-11-10', '2026-11-15', 'move', 3)
      expect(forward).toEqual({ startDate: '2026-11-13', dueDate: '2026-11-18' })

      const backward = applyDragDelta('2026-11-10', '2026-11-15', 'move', -4)
      expect(backward).toEqual({ startDate: '2026-11-06', dueDate: '2026-11-11' })
    })

    it('chế độ resize-start: thay đổi startDate và không cho vượt quá dueDate', () => {
      const expanded = applyDragDelta('2026-11-10', '2026-11-15', 'resize-start', -2)
      expect(expanded).toEqual({ startDate: '2026-11-08', dueDate: '2026-11-15' })

      // Kéo quá dueDate => bị chặn tại dueDate
      const clamped = applyDragDelta('2026-11-10', '2026-11-15', 'resize-start', 10)
      expect(clamped).toEqual({ startDate: '2026-11-15', dueDate: '2026-11-15' })
    })

    it('chế độ resize-end: thay đổi dueDate và không cho nhỏ hơn startDate', () => {
      const extended = applyDragDelta('2026-11-10', '2026-11-15', 'resize-end', 4)
      expect(extended).toEqual({ startDate: '2026-11-10', dueDate: '2026-11-19' })

      // Kéo ngược nhỏ hơn startDate => bị chặn tại startDate
      const clamped = applyDragDelta('2026-11-10', '2026-11-15', 'resize-end', -20)
      expect(clamped).toEqual({ startDate: '2026-11-10', dueDate: '2026-11-10' })
    })
  })
})
