import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { KanbanCard } from './KanbanCard'
import type { TaskItem } from '@/types/task'

describe('KanbanCard - Component Tests', () => {
  const mockTask: TaskItem = {
    id: 'task-123',
    title: 'Thử nghiệm kéo thả Kanban',
    taskKey: 'TEST-12',
    statusId: 'status-todo',
    priority: 'HIGH',
    storyPoints: 5,
    assignee: {
      id: 'user-1',
      name: 'Nguyễn Văn A',
      email: 'a@example.com',
      avatarUrl: null,
    },
    type: {
      id: 'type-1',
      name: 'Task',
    },
  }

  it('renders card title, key and story points correctly', () => {
    render(<KanbanCard task={mockTask} />)

    expect(screen.getByText('Thử nghiệm kéo thả Kanban')).toBeInTheDocument()
    expect(screen.getByText('TEST-12')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('N')).toBeInTheDocument() // Initials of Nguyễn Văn A
  })

  it('renders overlay mode with floating styles when isOverlay is true', () => {
    render(<KanbanCard task={mockTask} isOverlay={true} />)

    expect(screen.getByText('Thử nghiệm kéo thả Kanban')).toBeInTheDocument()
    expect(screen.getByText('TEST-12')).toBeInTheDocument()
  })

  it('renders up to 3 label pills and +N overflow badge', () => {
    const taskWithLabels: TaskItem = {
      ...mockTask,
      labels: [
        { id: 'l1', projectId: 'p1', name: 'Frontend', color: '#4f46e5' },
        { id: 'l2', projectId: 'p1', name: 'Urgent', color: '#ef4444' },
        { id: 'l3', projectId: 'p1', name: 'UI/UX', color: '#10b981' },
        { id: 'l4', projectId: 'p1', name: 'Backend', color: '#f59e0b' },
      ],
    }
    render(<KanbanCard task={taskWithLabels} />)

    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Urgent')).toBeInTheDocument()
    expect(screen.getByText('UI/UX')).toBeInTheDocument()
    expect(screen.queryByText('Backend')).not.toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
  })
})
