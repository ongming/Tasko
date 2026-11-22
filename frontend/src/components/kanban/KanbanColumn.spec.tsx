import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { KanbanColumn } from './KanbanColumn'
import type { BoardColumn } from '@/pages/project/KanbanBoardView'

describe('KanbanColumn - Component Tests', () => {
  const mockColumn: BoardColumn = {
    id: 'col-todo',
    title: 'Cần Làm',
    category: 'TODO',
    colorBadge: 'bg-slate-400',
    countBadgeClass: 'bg-slate-100 text-slate-700',
    wrapperClass: 'bg-slate-50',
    quickAddClass: 'border-slate-200',
    tasks: [],
  }

  const defaultProps = {
    column: mockColumn,
    isDraggingActive: false,
    quickAddColumnId: null,
    quickTaskTitle: '',
    setQuickTaskTitle: vi.fn(),
    setQuickAddColumnId: vi.fn(),
    handleQuickAddTask: vi.fn(),
    isSubmittingQuickAdd: false,
    onCardClick: vi.fn(),
    onOpenCreateModalWithStatus: vi.fn(),
  }

  it('renders column title and empty state message when tasks is empty', () => {
    render(<KanbanColumn {...defaultProps} />)

    expect(screen.getByText('cần làm')).toBeInTheDocument()
    expect(screen.getByText('Chưa có công việc')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Thêm công việc vào cột Cần Làm/i }),
    ).toBeInTheDocument()
  })

  it('renders quick add form when quickAddColumnId matches', () => {
    render(
      <KanbanColumn
        {...defaultProps}
        quickAddColumnId="col-todo"
        quickTaskTitle="Task thử nghiệm"
      />,
    )

    expect(screen.getByPlaceholderText('Nhập tiêu đề công việc...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Thêm thẻ/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hủy/i })).toBeInTheDocument()
  })
})
