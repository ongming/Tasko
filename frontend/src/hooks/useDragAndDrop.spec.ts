import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDragAndDrop } from './useDragAndDrop'

interface MockTask {
  id: string
  title: string
  statusId: string
}

describe('useDragAndDrop - Generic Hook Tests', () => {
  const mockTasks: MockTask[] = [
    { id: 'task-1', title: 'Task 1', statusId: 'col-todo' },
    { id: 'task-2', title: 'Task 2', statusId: 'col-doing' },
  ]

  it('1. Trạng thái ban đầu không có item nào đang kéo', () => {
    const onDropMove = vi.fn()
    const { result } = renderHook(() =>
      useDragAndDrop({
        items: mockTasks,
        getItemId: (t) => t.id,
        onDropMove,
      })
    )

    expect(result.current.activeItem).toBeNull()
    expect(result.current.activeId).toBeNull()
    expect(result.current.isDragging).toBe(false)
    expect(result.current.sensors).toBeDefined()
  })

  it('2. handleDragStart cập nhật activeItem và activeId', () => {
    const onDropMove = vi.fn()
    const { result } = renderHook(() =>
      useDragAndDrop({
        items: mockTasks,
        getItemId: (t) => t.id,
        onDropMove,
      })
    )

    act(() => {
      result.current.handleDragStart({
        active: { id: 'task-1', data: { current: {} }, rect: { current: { initial: null, translated: null } } },
      } as any)
    })

    expect(result.current.activeItem).toEqual(mockTasks[0])
    expect(result.current.activeId).toBe('task-1')
    expect(result.current.isDragging).toBe(true)
  })

  it('3. handleDragOver kích hoạt onHoverMove khi rê qua container khác', () => {
    const onDropMove = vi.fn()
    const onHoverMove = vi.fn()
    const { result } = renderHook(() =>
      useDragAndDrop({
        items: mockTasks,
        getItemId: (t) => t.id,
        onDropMove,
        onHoverMove,
      })
    )

    // Bắt đầu kéo task-1
    act(() => {
      result.current.handleDragStart({
        active: { id: 'task-1', data: { current: {} }, rect: { current: { initial: null, translated: null } } },
      } as any)
    })

    // Rê chuột qua col-doing
    act(() => {
      result.current.handleDragOver({
        active: { id: 'task-1', data: { current: {} }, rect: { current: { initial: null, translated: null } } },
        over: { id: 'col-doing', data: { current: {} }, rect: { initial: null, translated: null } } as any,
      } as any)
    })

    expect(onHoverMove).toHaveBeenCalledWith('task-1', 'col-doing', mockTasks[0])
  })

  it('4. handleDragEnd gọi onDropMove và dọn dẹp activeItem', async () => {
    const onDropMove = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useDragAndDrop({
        items: mockTasks,
        getItemId: (t) => t.id,
        onDropMove,
      })
    )

    // Bắt đầu kéo task-1
    act(() => {
      result.current.handleDragStart({
        active: { id: 'task-1', data: { current: {} }, rect: { current: { initial: null, translated: null } } },
      } as any)
    })

    expect(result.current.isDragging).toBe(true)

    // Thả chuột vào col-doing
    await act(async () => {
      await result.current.handleDragEnd({
        active: { id: 'task-1', data: { current: {} }, rect: { current: { initial: null, translated: null } } },
        over: { id: 'col-doing', data: { current: {} }, rect: { initial: null, translated: null } } as any,
      } as any)
    })

    expect(onDropMove).toHaveBeenCalledWith('task-1', 'col-doing', mockTasks[0])
    expect(result.current.activeItem).toBeNull()
    expect(result.current.activeId).toBeNull()
    expect(result.current.isDragging).toBe(false)
  })

  it('5. handleDragCancel hủy thao tác và đặt lại trạng thái ban đầu', () => {
    const onDropMove = vi.fn()
    const { result } = renderHook(() =>
      useDragAndDrop({
        items: mockTasks,
        getItemId: (t) => t.id,
        onDropMove,
      })
    )

    act(() => {
      result.current.handleDragStart({
        active: { id: 'task-1', data: { current: {} }, rect: { current: { initial: null, translated: null } } },
      } as any)
    })

    expect(result.current.isDragging).toBe(true)

    act(() => {
      result.current.handleDragCancel()
    })

    expect(result.current.activeItem).toBeNull()
    expect(result.current.isDragging).toBe(false)
  })

  it('6. Gọi onStartDrag khi bắt đầu kéo và onCancelDrag khi thả ra ngoài (!over) hoặc hủy', async () => {
    const onDropMove = vi.fn()
    const onStartDrag = vi.fn()
    const onCancelDrag = vi.fn()

    const { result } = renderHook(() =>
      useDragAndDrop({
        items: mockTasks,
        getItemId: (t) => t.id,
        onStartDrag,
        onDropMove,
        onCancelDrag,
      }),
    )

    act(() => {
      result.current.handleDragStart({
        active: { id: 'task-1', data: { current: {} }, rect: { current: { initial: null, translated: null } } },
      } as any)
    })

    expect(onStartDrag).toHaveBeenCalledWith('task-1', mockTasks[0])
    expect(result.current.shouldIgnoreClick()).toBe(true)

    await act(async () => {
      await result.current.handleDragEnd({
        active: { id: 'task-1', data: { current: {} }, rect: { current: { initial: null, translated: null } } },
        over: null,
      } as any)
    })

    expect(onDropMove).not.toHaveBeenCalled()
    expect(onCancelDrag).toHaveBeenCalledTimes(1)
  })

  it('7. scheduleDebounced chỉ thực thi 1 lần cuối cùng sau khoảng delay khi kéo liên tiếp', () => {
    vi.useFakeTimers()
    const onDropMove = vi.fn()
    const persistFn1 = vi.fn()
    const persistFn2 = vi.fn()

    const { result, unmount } = renderHook(() =>
      useDragAndDrop({
        items: mockTasks,
        getItemId: (t) => t.id,
        onDropMove,
        debounceMs: 600,
      }),
    )

    act(() => {
      result.current.scheduleDebounced('task-1', persistFn1)
    })

    // Sau 300ms kéo lại lần nữa -> phải hủy persistFn1
    act(() => {
      vi.advanceTimersByTime(300)
      result.current.scheduleDebounced('task-1', persistFn2)
    })

    act(() => {
      vi.advanceTimersByTime(599)
    })
    expect(persistFn1).not.toHaveBeenCalled()
    expect(persistFn2).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(persistFn1).not.toHaveBeenCalled()
    expect(persistFn2).toHaveBeenCalledTimes(1)

    // Test cleanup khi unmount không bị rò rỉ timer
    const persistFn3 = vi.fn()
    act(() => {
      result.current.scheduleDebounced('task-2', persistFn3)
    })
    unmount()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(persistFn3).not.toHaveBeenCalled()

    vi.useRealTimers()
  })
})
