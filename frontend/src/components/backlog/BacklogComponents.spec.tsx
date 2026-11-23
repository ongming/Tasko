import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BacklogIssueRow } from './BacklogIssueRow'
import { BacklogDroppableContainer } from './BacklogDroppableContainer'
import type { TaskItem } from '@/types/task'

describe('BacklogIssueRow & BacklogDroppableContainer', () => {
  const mockIssue: TaskItem = {
    id: 'issue-1',
    title: 'Thiết kế API Backlog',
    taskKey: 'TSK-10',
    statusId: 'status-todo',
    priority: 'MEDIUM',
    storyPoints: 3,
    sprintId: null,
    status: { id: 'status-todo', name: 'Cần làm', category: 'TODO' },
  }

  it('renders BacklogIssueRow inside BacklogDroppableContainer and triggers click/dropdown', () => {
    const onClickRow = vi.fn()
    const onMoveSprintDropdown = vi.fn()

    render(
      <BacklogDroppableContainer id="backlog">
        <BacklogIssueRow
          issue={mockIssue}
          sprints={[{ id: 'sp-1', name: 'Sprint 1', status: 'PLANNED' } as any]}
          isEditingPoints={false}
          tempPoints=""
          setTempPoints={vi.fn()}
          onStartEditPoints={vi.fn()}
          onSavePoints={vi.fn()}
          onCancelEditPoints={vi.fn()}
          onMoveSprintDropdown={onMoveSprintDropdown}
          onClickRow={onClickRow}
          renderIssueIcon={() => <span data-testid="issue-icon" />}
        />
      </BacklogDroppableContainer>,
    )

    expect(screen.getByText('TSK-10')).toBeInTheDocument()
    expect(screen.getByText('Thiết kế API Backlog')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Thiết kế API Backlog'))
    expect(onClickRow).toHaveBeenCalledWith('issue-1')

    const select = screen.getByRole('combobox', { name: 'Chuyển công việc sang Sprint khác hoặc Backlog' })
    fireEvent.click(select)
    fireEvent.click(screen.getByRole('option', { name: 'Sprint 1' }))
    expect(onMoveSprintDropdown).toHaveBeenCalledWith('issue-1', 'sp-1')
  })

  it('renders overlay variant cleanly', () => {
    render(
      <BacklogIssueRow
        issue={mockIssue}
        sprints={[]}
        isEditingPoints={false}
        tempPoints=""
        setTempPoints={vi.fn()}
        onStartEditPoints={vi.fn()}
        onSavePoints={vi.fn()}
        onCancelEditPoints={vi.fn()}
        onMoveSprintDropdown={vi.fn()}
        onClickRow={vi.fn()}
        renderIssueIcon={() => null}
        isOverlay
      />,
    )

    expect(screen.getByText('TSK-10')).toBeInTheDocument()
    expect(screen.getByText('Thiết kế API Backlog')).toBeInTheDocument()
  })
})
