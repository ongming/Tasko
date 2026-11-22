import { useState, useCallback } from 'react'
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
  items: T[];

  /**
   * Hàm trích xuất ID định danh duy nhất của từng phần tử
   */
  getItemId: (item: T) => string;

  /**
   * Callback kích hoạt khi người dùng thả chuột (Drop).
   * Dùng chung cho:
   * - Kanban: Đổi cột trạng thái (statusId)
   * - Backlog: Đổi Sprint (sprintId) hoặc thứ tự ưu tiên
   * - Calendar: Đổi ngày đến hạn (dueDate)
   */
  onDropMove: (activeId: string, overId: string, activeItem: T) => Promise<void> | void;

  /**
   * Callback kích hoạt khi rê chuột qua một container/item khác (tùy chọn cho hiệu ứng dạt chỗ tức thì)
   */
  onHoverMove?: (activeId: string, overId: string, activeItem: T) => void;

  /**
   * Khoảng cách chuột tối thiểu (pixel) để kích hoạt Drag.
   * Mặc định là 5px nhằm tránh xung đột với sự kiện Click mở Modal / Drawer.
   */
  activationDistance?: number;
}

export interface UseDragAndDropReturn<T> {
  sensors: SensorDescriptor<SensorOptions>[];
  activeItem: T | null;
  activeId: string | null;
  isDragging: boolean;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => Promise<void>;
  handleDragCancel: () => void;
}

/**
 * Custom Hook dùng chung cho toàn bộ các chế độ xem Kéo - Thả (Kanban, Backlog/Sprint, Calendar, Timeline)
 * Tách biệt hoàn toàn logic cảm biến và xử lý sự kiện khỏi giao diện UI.
 */
export function useDragAndDrop<T>({
  items,
  getItemId,
  onDropMove,
  onHoverMove,
  activationDistance = 5,
}: UseDragAndDropOptions<T>): UseDragAndDropReturn<T> {
  const [activeItem, setActiveItem] = useState<T | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Cảm biến linh hoạt: Chuột / Bút (Pointer), Cảm ứng màn hình (Touch), Bàn phím (Keyboard trợ năng)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: activationDistance,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 1. Bắt đầu kéo: Lưu lại item đang kéo để DragOverlay hiển thị bóng
  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const id = String(event.active.id)
      setActiveId(id)
      const found = items.find((item) => getItemId(item) === id) || null
      setActiveItem(found)
    },
    [items, getItemId]
  )

  // 2. Rê chuột bay qua vùng khác: Kích hoạt hiệu ứng dạt chỗ nếu view yêu cầu
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (!event.over || !activeItem) return
      const currentActiveId = String(event.active.id)
      const currentOverId = String(event.over.id)

      if (currentActiveId === currentOverId) return
      onHoverMove?.(currentActiveId, currentOverId, activeItem)
    },
    [activeItem, onHoverMove]
  )

  // 3. Thả chuột: Dọn dẹp DragOverlay và gọi callback nghiệp vụ của từng View
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const currentItem = activeItem
      const currentActiveId = activeId

      // Dọn dẹp trạng thái kéo ngay lập tức để giao diện mượt mà
      setActiveItem(null)
      setActiveId(null)

      if (!event.over || !currentActiveId || !currentItem) return

      const currentOverId = String(event.over.id)
      await onDropMove(currentActiveId, currentOverId, currentItem)
    },
    [activeItem, activeId, onDropMove]
  )

  // 4. Hủy kéo (ví dụ người dùng bấm phím Escape hoặc trỏ chuột ra ngoài vùng an toàn)
  const handleDragCancel = useCallback(() => {
    setActiveItem(null)
    setActiveId(null)
  }, [])

  return {
    sensors,
    activeItem,
    activeId,
    isDragging: Boolean(activeItem),
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  }
}

export default useDragAndDrop
