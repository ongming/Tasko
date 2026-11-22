import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CalendarView } from './CalendarView'
import { taskService } from '@/services/taskService'

vi.mock('@/services/taskService', () => ({
  taskService: {
    getProjectTasks: vi.fn(),
    updateProjectTask: vi.fn(),
  },
}))

describe('CalendarView - Drag & Drop & Display Tests', () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const dueDateStr = `${year}-${month}-15T00:00:00.000Z`

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(taskService.getProjectTasks).mockResolvedValue([
      {
        id: 'task-cal-1',
        title: 'Task trên lịch',
        taskKey: 'CAL-1',
        statusId: 'st-1',
        priority: 'HIGH',
        dueDate: dueDateStr,
      } as any,
    ])
  })

  it('renders calendar grid with tasks mapped by dueDate', async () => {
    render(
      <MemoryRouter initialEntries={['/workspace/CAL/calendar']}>
        <Routes>
          <Route path="/workspace/:projectKey/calendar" element={<CalendarView />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('CAL-1')).toBeInTheDocument()
      expect(screen.getByText('Task trên lịch')).toBeInTheDocument()
    })
  })
})
