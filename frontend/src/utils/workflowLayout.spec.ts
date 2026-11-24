import { describe, it, expect } from 'vitest'
import {
  computeAutoLayoutPositions,
  draftMapToTransitionPayload,
  resolveOptimalHandles,
  transitionsToDraftMap,
} from './workflowLayout'
import type { ProjectStatus } from '@/types/projectConfig'

describe('workflowLayout utilities', () => {
  const mockStatuses: ProjectStatus[] = [
    { id: 's-done', project_id: 'p1', name: 'Done', category: 'DONE', color: '#10b981', position: 3, is_default: false },
    { id: 's-todo', project_id: 'p1', name: 'To Do', category: 'TODO', color: '#94a3b8', position: 1, is_default: true },
    { id: 's-prog', project_id: 'p1', name: 'In Progress', category: 'IN_PROGRESS', color: '#4f46e5', position: 2, is_default: false },
  ]

  it('orders statuses by category (TODO -> IN_PROGRESS -> DONE) and produces non-collinear arc for 3 nodes', () => {
    const pos = computeAutoLayoutPositions(mockStatuses)
    expect(pos['s-todo'].x).toBeLessThan(pos['s-prog'].x)
    expect(pos['s-prog'].x).toBeLessThan(pos['s-done'].x)
    expect(pos['s-prog'].y).not.toBe(pos['s-todo'].y)
  })

  it('resolves optimal source/target handles based on relative node coordinates', () => {
    expect(resolveOptimalHandles({ x: 50, y: 100 }, { x: 350, y: 100 })).toEqual({
      sourceHandle: 'right',
      targetHandle: 'left',
    })
    expect(resolveOptimalHandles({ x: 350, y: 100 }, { x: 50, y: 100 })).toEqual({
      sourceHandle: 'left',
      targetHandle: 'right',
    })
    expect(resolveOptimalHandles({ x: 100, y: 50 }, { x: 110, y: 300 })).toEqual({
      sourceHandle: 'bottom',
      targetHandle: 'top',
    })
  })

  it('round-trips transition labels and handles inside conditions jsonb cleanly', () => {
    const draft = transitionsToDraftMap([
      {
        fromStatusId: 's-todo',
        toStatusId: 's-prog',
        conditions: { label: 'Bắt đầu làm', sourceHandle: 'right', targetHandle: 'left' },
      },
    ])
    expect(draft['s-todo->s-prog'].label).toBe('Bắt đầu làm')

    const payload = draftMapToTransitionPayload(draft)
    expect(payload).toEqual([
      {
        fromStatusId: 's-todo',
        toStatusId: 's-prog',
        conditions: { label: 'Bắt đầu làm', sourceHandle: 'right', targetHandle: 'left' },
      },
    ])
  })
})
