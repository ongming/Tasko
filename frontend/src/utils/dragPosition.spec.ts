import { describe, it, expect } from 'vitest'
import { calculateNewPosition, resolveDropPosition } from './dragPosition'

describe('calculateNewPosition - Shared Midpoint Utility', () => {
  it('returns 1000 for an empty list', () => {
    expect(calculateNewPosition([], 0)).toBe(1000)
  })

  it('calculates midpoint when dropped at index 0', () => {
    expect(calculateNewPosition([{ position: 2000 }, { position: 4000 }], 0)).toBe(1000)
    expect(calculateNewPosition([{ position: 1 }], 0)).toBe(-999)
  })

  it('calculates position when dropped at the end', () => {
    expect(calculateNewPosition([{ position: 1000 }, { position: 3000 }], 2)).toBe(4000)
  })

  it('calculates midpoint when dropped in between two items', () => {
    expect(calculateNewPosition([{ position: 1000 }, { position: 2000 }], 1)).toBe(1500)
  })
})

describe('resolveDropPosition - Reordering Direction Tests', () => {
  const items = [
    { id: 't1', position: 1000 },
    { id: 't2', position: 2000 },
    { id: 't3', position: 3000 },
  ]

  it('moves item above the last item DOWN to the very end (after t3)', () => {
    // Kéo t2 (index 1) xuống thả lên t3 (index 2) -> phải thành cuối cùng (4000)
    expect(resolveDropPosition(items, 't2', 't3')).toBe(4000)
  })

  it('moves first item DOWN to the very end (after t3)', () => {
    // Kéo t1 (index 0) xuống thả lên t3 (index 2) -> phải thành cuối cùng (4000)
    expect(resolveDropPosition(items, 't1', 't3')).toBe(4000)
  })

  it('moves last item UP to the top (before t1)', () => {
    // Kéo t3 (index 2) lên thả lên t1 (index 0) -> phải lên đầu (500)
    expect(resolveDropPosition(items, 't3', 't1')).toBe(500)
  })

  it('moves item into empty space of container -> places at end', () => {
    expect(resolveDropPosition(items, 't1', 'col-1')).toBe(4000)
  })
})
