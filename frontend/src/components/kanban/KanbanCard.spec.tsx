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
})
