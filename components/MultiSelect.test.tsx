import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MultiSelect } from './MultiSelect'

expect.extend(toHaveNoViolations)

describe('MultiSelect Accessibility', () => {
  const mockItems = [
    { id: '1', label: 'Item 1', group: 'Group A' },
    { id: '2', label: 'Item 2', group: 'Group B' },
    { id: '3', label: 'Item 3', group: 'Group A' },
  ]

  it('should not have accessibility violations when closed', async () => {
    const { container } = render(
      <MultiSelect
        items={mockItems}
        selectedIds={new Set()}
        onSelectionChange={() => {}}
      />
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations with selections', async () => {
    const { container } = render(
      <MultiSelect
        items={mockItems}
        selectedIds={new Set(['1', '2'])}
        onSelectionChange={() => {}}
      />
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have accessibility violations when open', async () => {
    const { container, getByRole } = render(
      <MultiSelect
        items={mockItems}
        selectedIds={new Set()}
        onSelectionChange={() => {}}
      />
    )

    const input = getByRole('combobox')
    input.focus()

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
