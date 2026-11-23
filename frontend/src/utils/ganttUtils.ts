import type { TaskItem } from '@/types/task'

export type GanttDragMode = 'move' | 'resize-start' | 'resize-end'

export interface GanttNode {
  task: TaskItem
  children: GanttNode[]
  depth: number
  progressPercent: number
  effectiveStartDate: string | null
  effectiveDueDate: string | null
  isSummary: boolean
  hasOwnDates: boolean
}

export interface GanttVisibleRow {
  node: GanttNode
  parentId: string | null
  rowIndex: number
  isExpanded: boolean
}

export interface GanttBarGeometry {
  leftPercent: number
  widthPercent: number
  isClampedLeft: boolean
  isClampedRight: boolean
  isOutOfRange: boolean
  hasDates: boolean
  startDayOffset: number
  durationDays: number
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Chuẩn hóa chuỗi ngày (ISO hoặc YYYY-MM-DD) hoặc Date về chuỗi "YYYY-MM-DD".
 * Trả về null nếu không hợp lệ.
 */
export function normalizeDateKey(input?: string | Date | null): string | null {
  if (!input) return null

  if (typeof input === 'string') {
    const trimmed = input.trim()
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)
    if (match) {
      const y = Number(match[1])
      const m = Number(match[2])
      const d = Number(match[3])
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return `${match[1]}-${match[2]}-${match[3]}`
      }
    }
    const parsed = new Date(trimmed)
    if (Number.isNaN(parsed.getTime())) return null
    return dateToKey(parsed)
  }

  if (Number.isNaN(input.getTime())) return null
  return dateToKey(input)
}

function dateToKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Chuyển chuỗi "YYYY-MM-DD" hoặc Date thành chỉ số ngày UTC nguyên (tránh sai lệch DST).
 */
export function toDayIndex(input: string | Date): number {
  const key = normalizeDateKey(input)
  if (!key) return 0
  const [y, m, d] = key.split('-').map(Number)
  return Math.floor(Date.UTC(y, m - 1, d) / MS_PER_DAY)
}

/**
 * Chuyển chỉ số ngày UTC nguyên về chuỗi "YYYY-MM-DD".
 */
export function fromDayIndex(dayIndex: number): string {
  const dt = new Date(dayIndex * MS_PER_DAY)
  const y = dt.getUTCFullYear()
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const d = String(dt.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Cộng/trừ số ngày vào một ngày bất kỳ và trả về chuỗi "YYYY-MM-DD".
 */
export function addDaysToKey(input: string | Date, deltaDays: number): string {
  return fromDayIndex(toDayIndex(input) + Math.round(deltaDays))
}

function getLeafProgress(task: TaskItem): number {
  const category = task.status?.category
  if (category === 'DONE') return 100
  if (category === 'IN_PROGRESS') return 50
  return 0
}

/**
 * Xây dựng cấu trúc cây cha–con cho Gantt Chart dựa trên parentTaskId.
 * - Phòng tránh vòng lặp vô hạn (self-loop, 2-cycle, n-cycle).
 * - Task có parentTaskId không nằm trong danh sách hiện tại được xử lý như node gốc.
 * - Tự động tính progressPercent và suy diễn Summary span [min(start), max(due)] cho Task cha.
 */
export function buildGanttHierarchy(tasks: TaskItem[]): GanttNode[] {
  if (!tasks || tasks.length === 0) return []

  const taskMap = new Map<string, TaskItem>()
  for (const t of tasks) {
    taskMap.set(t.id, t)
  }

  // Xác định liên kết cha hợp lệ, chặn vòng lặp vô hạn
  const acceptedParent = new Map<string, string>()
  for (const task of tasks) {
    const pid = task.parentTaskId
    if (!pid || pid === task.id || !taskMap.has(pid)) continue

    let curr: string | undefined = pid
    let createsCycle = false
    const seen = new Set<string>()
    while (curr) {
      if (curr === task.id) {
        createsCycle = true
        break
      }
      if (seen.has(curr)) break
      seen.add(curr)
      curr = acceptedParent.get(curr)
    }

    if (!createsCycle) {
      acceptedParent.set(task.id, pid)
    }
  }

  // Gom nhóm children theo parentId, giữ nguyên thứ tự gốc
  const childrenMap = new Map<string, TaskItem[]>()
  const rootTasks: TaskItem[] = []

  for (const task of tasks) {
    const pid = acceptedParent.get(task.id)
    if (pid) {
      const list = childrenMap.get(pid) || []
      list.push(task)
      childrenMap.set(pid, list)
    } else {
      rootTasks.push(task)
    }
  }

  const buildNode = (task: TaskItem, depth: number): GanttNode => {
    const childTasks = childrenMap.get(task.id) || []
    const children = childTasks.map((c) => buildNode(c, depth + 1))

    const ownStart = normalizeDateKey(task.startDate)
    const ownDue = normalizeDateKey(task.dueDate)
    const hasOwnDates = Boolean(ownStart || ownDue)

    if (children.length === 0) {
      return {
        task,
        children: [],
        depth,
        progressPercent: getLeafProgress(task),
        effectiveStartDate: ownStart ?? ownDue,
        effectiveDueDate: ownDue ?? ownStart,
        isSummary: false,
        hasOwnDates,
      }
    }

    // Tiến độ Task cha: % số task con trực tiếp có status.category === 'DONE'
    const doneCount = children.filter((c) => c.task.status?.category === 'DONE').length
    const progressPercent = Math.round((doneCount / children.length) * 100)

    // Suy diễn Summary span từ các task con nếu cha thiếu startDate hoặc dueDate
    let minChildStart: string | null = null
    let maxChildDue: string | null = null

    for (const child of children) {
      if (child.effectiveStartDate) {
        if (!minChildStart || child.effectiveStartDate < minChildStart) {
          minChildStart = child.effectiveStartDate
        }
      }
      if (child.effectiveDueDate) {
        if (!maxChildDue || child.effectiveDueDate > maxChildDue) {
          maxChildDue = child.effectiveDueDate
        }
      }
    }

    let effectiveStartDate = ownStart ?? minChildStart
    let effectiveDueDate = ownDue ?? maxChildDue

    // Đảm bảo nếu chỉ có 1 đầu ngày thì đồng bộ đầu còn lại để vẽ thanh hợp lệ
    if (effectiveStartDate && !effectiveDueDate) {
      effectiveDueDate = effectiveStartDate
    } else if (!effectiveStartDate && effectiveDueDate) {
      effectiveStartDate = effectiveDueDate
    }

    // Nếu cả 2 tồn tại nhưng start > due do dữ liệu chưa khớp, chuẩn hóa
    if (effectiveStartDate && effectiveDueDate && effectiveStartDate > effectiveDueDate) {
      effectiveDueDate = effectiveStartDate
    }

    return {
      task,
      children,
      depth,
      progressPercent,
      effectiveStartDate,
      effectiveDueDate,
      isSummary: true,
      hasOwnDates,
    }
  }

  return rootTasks.map((root) => buildNode(root, 0))
}

/**
 * Trải phẳng cây Gantt thành danh sách hàng đang hiển thị dựa trên tập expandedIds.
 */
export function flattenVisibleGanttRows(
  roots: GanttNode[],
  expandedIds: Set<string>,
): GanttVisibleRow[] {
  const rows: GanttVisibleRow[] = []

  const visit = (node: GanttNode, parentId: string | null) => {
    const isExpanded = expandedIds.has(node.task.id)
    rows.push({
      node,
      parentId,
      rowIndex: rows.length,
      isExpanded,
    })

    if (node.children.length > 0 && isExpanded) {
      for (const child of node.children) {
        visit(child, node.task.id)
      }
    }
  }

  for (const root of roots) {
    visit(root, null)
  }

  return rows
}

/**
 * Tính toán hình học thanh Gantt (leftPercent, widthPercent, trạng thái kẹp biên, hasDates).
 */
export function calculateGanttBar(
  startDate: string | Date | null | undefined,
  dueDate: string | Date | null | undefined,
  windowStart: Date,
  totalDays: number,
): GanttBarGeometry {
  const safeTotalDays = Math.max(1, totalDays)
  const normStart = normalizeDateKey(startDate)
  const normDue = normalizeDateKey(dueDate)

  if (!normStart && !normDue) {
    return {
      leftPercent: 0,
      widthPercent: 0,
      isClampedLeft: false,
      isClampedRight: false,
      isOutOfRange: false,
      hasDates: false,
      startDayOffset: 0,
      durationDays: 0,
    }
  }

  const sDay = toDayIndex(normStart ?? normDue!)
  const eDay = Math.max(sDay, toDayIndex(normDue ?? normStart!))
  const windowStartDay = toDayIndex(windowStart)

  const rawStart = sDay - windowStartDay
  const durationDays = eDay - sDay + 1
  const rawEnd = rawStart + durationDays

  const isOutOfRange = rawEnd <= 0 || rawStart >= safeTotalDays
  const isClampedLeft = rawStart < 0
  const isClampedRight = rawEnd > safeTotalDays

  if (isOutOfRange) {
    return {
      leftPercent: rawEnd <= 0 ? 0 : 100,
      widthPercent: 0,
      isClampedLeft,
      isClampedRight,
      isOutOfRange: true,
      hasDates: true,
      startDayOffset: rawStart,
      durationDays,
    }
  }

  const clampedStart = Math.max(0, Math.min(safeTotalDays, rawStart))
  const clampedEnd = Math.max(clampedStart, Math.min(safeTotalDays, rawEnd))

  const leftPercent = (clampedStart / safeTotalDays) * 100
  const widthPercent = ((clampedEnd - clampedStart) / safeTotalDays) * 100

  return {
    leftPercent,
    widthPercent,
    isClampedLeft,
    isClampedRight,
    isOutOfRange: false,
    hasDates: true,
    startDayOffset: rawStart,
    durationDays,
  }
}

/**
 * Áp dụng bước dịch chuyển theo số ngày nguyên (1-day snap) cho 3 chế độ kéo thả:
 * - move: dời đồng thời startDate và dueDate giữ nguyên thời lượng
 * - resize-start: chỉnh startDate, đảm bảo startDate <= dueDate
 * - resize-end: chỉnh dueDate, đảm bảo dueDate >= startDate
 */
export function applyDragDelta(
  origStart: string,
  origDue: string,
  mode: GanttDragMode,
  deltaDays: number,
): { startDate: string; dueDate: string } {
  const sDay = toDayIndex(origStart)
  const eDay = Math.max(sDay, toDayIndex(origDue))
  const step = Math.round(deltaDays)

  let nextStart = sDay
  let nextDue = eDay

  if (mode === 'move') {
    nextStart = sDay + step
    nextDue = eDay + step
  } else if (mode === 'resize-start') {
    nextStart = Math.min(sDay + step, eDay)
    nextDue = eDay
  } else if (mode === 'resize-end') {
    nextStart = sDay
    nextDue = Math.max(eDay + step, sDay)
  }

  return {
    startDate: fromDayIndex(nextStart),
    dueDate: fromDayIndex(nextDue),
  }
}
