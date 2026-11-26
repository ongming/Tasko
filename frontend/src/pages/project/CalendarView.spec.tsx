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

  it('renders startDate-only tasks, date-range spans, and unscheduled panel', async () => {
    vi.mocked(taskService.getProjectTasks).mockResolvedValue([
      {
        id: 't-range',
        title: 'Task nhiều ngày',
        taskKey: 'CAL-2',
        statusId: 'st-1',
        priority: 'MEDIUM',
        startDate: `${year}-${month}-10T00:00:00.000Z`,
        dueDate: `${year}-${month}-12T00:00:00.000Z`,
      } as any,
      {
        id: 't-start-only',
        title: 'Chỉ có ngày bắt đầu',
        taskKey: 'CAL-3',
        statusId: 'st-1',
        priority: 'LOW',
        startDate: `${year}-${month}-14T00:00:00.000Z`,
      } as any,
      {
        id: 't-unsched',
        title: 'Task chưa lên lịch',
        taskKey: 'CAL-4',
        statusId: 'st-1',
        priority: 'LOW',
      } as any,
    ])

    render(
      <MemoryRouter initialEntries={['/workspace/CAL/calendar']}>
        <Routes>
          <Route path="/workspace/:projectKey/calendar" element={<CalendarView />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      // CAL-2 spans 10, 11, 12 -> appears 3 times
      expect(screen.getAllByText('CAL-2')).toHaveLength(3)
      // CAL-3 has only startDate -> still shown
      expect(screen.getByText('CAL-3')).toBeInTheDocument()
      // CAL-4 has no dates -> in Unscheduled panel
      expect(screen.getAllByText('Chưa lên lịch (1)').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('CAL-4')).toBeInTheDocument()
    })
  })
})
