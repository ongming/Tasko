import { useState, useCallback, useRef, useEffect } from 'react'
import {
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

export interface UseDragAndDropOptions<T> {
  /**
   * Danh sách các phần tử dữ liệu (Tasks, Items, Cards...)
   */
  items: T[]

  /**
   * Hàm trích xuất ID định danh duy nhất của từng phần tử
   */
  getItemId: (item: T) => string

  /**
   * Callback kích hoạt khi bắt đầu kéo (dùng để lưu snapshot phục vụ rollback)
   */
  onStartDrag?: (activeId: string, activeItem: T) => void

  /**
   * Callback kích hoạt khi rê chuột qua một container/item khác (hiệu ứng dạt chỗ tức thì)
   */
  onHoverMove?: (activeId: string, overId: string, activeItem: T) => void

  /**
   * Callback kích hoạt khi người dùng thả chuột vào vùng hợp lệ (Drop).
   * Dùng chung cho:
   * - Kanban: Đổi cột trạng thái (statusId) & thứ tự (position)
   * - Backlog: Đổi Sprint (sprintId) & thứ tự ưu tiên (position)
   * - Calendar: Đổi ngày đến hạn (dueDate)
   */
  onDropMove: (activeId: string, overId: string, activeItem: T) => Promise<void> | void

  /**
   * Callback kích hoạt khi hủy kéo (nhấn ESC) hoặc thả ra ngoài vùng hợp lệ
   */
  onCancelDrag?: () => void

  /**
   * Khoảng cách chuột tối thiểu (pixel) để kích hoạt Drag.
   * Mặc định là 5px nhằm tránh xung đột với sự kiện Click mở Modal / Drawer.
   */
  activationDistance?: number

  /**
   * Thời gian giữ tay (ms) trên thiết bị cảm ứng để kích hoạt Drag (tránh xung đột cuộn trang).
   * Mặc định là 250ms.
   */
  touchDelayMs?: number

  /**
   * Thời gian Debounce mặc định (ms) cho helper scheduleDebounced. Mặc định 600ms.
   */
  debounceMs?: number
}

export interface UseDragAndDropReturn<T> {
  sensors: SensorDescriptor<SensorOptions>[]
  activeItem: T | null
  activeId: string | null
  isDragging: boolean
  shouldIgnoreClick: () => boolean
  scheduleDebounced: (
    key: string,
    action: () => Promise<void> | void,
    delayMs?: number,
  ) => void
  cancelDebounced: (key: string) => void
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => Promise<void>
  handleDragCancel: () => void
}

/**
 * Custom Hook dùng chung cho toàn bộ các chế độ xem Kéo - Thả (Kanban, Backlog/Sprint, Calendar, Timeline).
 * Đóng gói trọn vẹn: Cảm biến đa thiết bị (Mouse/Touch/Keyboard), DragOverlay, chặn click nhầm,
 * hủy/rollback an toàn và Debounce theo từng item.
 */
export function useDragAndDrop<T>({
  items,
  getItemId,
  onStartDrag,
  onHoverMove,
  onDropMove,
  onCancelDrag,
  activationDistance = 5,
  touchDelayMs = 250,
  debounceMs = 600,
}: UseDragAndDropOptions<T>): UseDragAndDropReturn<T> {
  const [activeItem, setActiveItem] = useState<T | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeItemRef = useRef<T | null>(null)
  const activeIdRef = useRef<string | null>(null)
  const justDraggedRef = useRef(false)
  const dragResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Dọn dẹp toàn bộ timer khi component unmount
  useEffect(() => {
    return () => {
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current)
      debounceTimersRef.current.forEach((timer) => clearTimeout(timer))
      debounceTimersRef.current.clear()
    }
  }, [])

  // Cảm biến linh hoạt: Chuột (Pointer), Cảm ứng Mobile (Touch long-press), Bàn phím (Keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: touchDelayMs,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const markDragEndedSoon = useCallback(() => {
    if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current)
    dragResetTimerRef.current = setTimeout(() => {
      justDraggedRef.current = false
    }, 100)
  }, [])

  const shouldIgnoreClick = useCallback(() => justDraggedRef.current, [])

  const cancelDebounced = useCallback((key: string) => {
    const existing = debounceTimersRef.current.get(key)
    if (existing) {
      clearTimeout(existing)
      debounceTimersRef.current.delete(key)
    }
  }, [])

  const scheduleDebounced = useCallback(
    (key: string, action: () => Promise<void> | void, delayMs = debounceMs) => {
      cancelDebounced(key)

      if (delayMs <= 0) {
        void action()
        return
      }

      const timer = setTimeout(() => {
        debounceTimersRef.current.delete(key)
        void action()
      }, delayMs)

      debounceTimersRef.current.set(key, timer)
    },
    [cancelDebounced, debounceMs],
  )

  // 1. Bắt đầu kéo: Lưu activeItem & thông báo onStartDrag để view lưu snapshot
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (dragResetTimerRef.current) clearTimeout(dragResetTimerRef.current)
      justDraggedRef.current = true

      const id = String(event.active.id)
      const found = items.find((item) => getItemId(item) === id) || null

      activeIdRef.current = id
      activeItemRef.current = found
      setActiveId(id)
      setActiveItem(found)

      if (found) {
        onStartDrag?.(id, found)
      }
    },
    [items, getItemId, onStartDrag],
  )

  // 2. Rê chuột bay qua vùng khác: Kích hoạt hiệu ứng dạt chỗ nếu view yêu cầu
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const currentItem = activeItemRef.current
      if (!event.over || !currentItem) return

      const currentActiveId = String(event.active.id)
      const currentOverId = String(event.over.id)

      if (currentActiveId === currentOverId) return
      onHoverMove?.(currentActiveId, currentOverId, currentItem)
    },
    [onHoverMove],
  )

  // 3. Thả chuột: Dọn dẹp DragOverlay, xử lý thả ngoài vùng hợp lệ hoặc gọi onDropMove
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      markDragEndedSoon()

      const currentItem = activeItemRef.current
      const currentActiveId = activeIdRef.current

      activeItemRef.current = null
      activeIdRef.current = null
      setActiveItem(null)
      setActiveId(null)

      if (!event.over || !currentActiveId || !currentItem) {
        onCancelDrag?.()
        return
      }

      const currentOverId = String(event.over.id)
      await onDropMove(currentActiveId, currentOverId, currentItem)
    },
    [markDragEndedSoon, onCancelDrag, onDropMove],
  )

  // 4. Hủy kéo (nhấn Escape hoặc hệ thống hủy)
  const handleDragCancel = useCallback(() => {
    markDragEndedSoon()
    activeItemRef.current = null
    activeIdRef.current = null
    setActiveItem(null)
    setActiveId(null)
    onCancelDrag?.()
  }, [markDragEndedSoon, onCancelDrag])

  return {
    sensors,
    activeItem,
    activeId,
    isDragging: Boolean(activeItem),
    shouldIgnoreClick,
    scheduleDebounced,
    cancelDebounced,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}

export default useDragAndDrop
