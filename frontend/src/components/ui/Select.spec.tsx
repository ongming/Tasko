import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Select } from './Select'

describe('Select - Custom Combobox Component', () => {
  const options = [
    { value: 'LOW', label: 'Thấp (LOW)', dotColor: 'bg-blue-500' },
    { value: 'MEDIUM', label: 'Trung bình (MEDIUM)', dotColor: 'bg-amber-400' },
    { value: 'HIGH', label: 'Cao (HIGH)', dotColor: 'bg-orange-500' },
  ]

  it('opens custom listbox popup and selects an option cleanly', () => {
    const onChange = vi.fn()
    render(<Select value="MEDIUM" onChange={onChange} options={options} ariaLabel="Độ ưu tiên" />)

    const trigger = screen.getByRole('combobox', { name: 'Độ ưu tiên' })
    expect(trigger).toHaveTextContent('Trung bình (MEDIUM)')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: 'Cao (HIGH)' }))
    expect(onChange).toHaveBeenCalledWith('HIGH')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('closes popup on Escape key', () => {
    render(<Select value="LOW" onChange={vi.fn()} options={options} ariaLabel="Độ ưu tiên" />)
    fireEvent.click(screen.getByRole('combobox'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
