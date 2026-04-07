import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { ScoreCard } from '../components/ui/ScoreCard'
import { MetricCard } from '../components/ui/MetricCard'
import { SearchBar } from '../components/ui/SearchBar'
import { FilterPanel } from '../components/ui/FilterPanel'
import { DistrictCard } from '../components/ui/DistrictCard'
import type { CompositeScore, DistrictDirectory } from '../types/district'

// ---------- LoadingSpinner ----------
describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />)
    expect(screen.getByRole('status')).toBeTruthy()
  })
  it('renders with message', () => {
    render(<LoadingSpinner message="Loading..." />)
    expect(screen.getByText('Loading...')).toBeTruthy()
  })
  it('renders sm size', () => {
    render(<LoadingSpinner size="sm" />)
    expect(screen.getByRole('status')).toBeTruthy()
  })
  it('renders lg size', () => {
    render(<LoadingSpinner size="lg" />)
    expect(screen.getByRole('status')).toBeTruthy()
  })
})

// ---------- ErrorMessage ----------
describe('ErrorMessage', () => {
  it('renders message', () => {
    render(<ErrorMessage message="Something failed" />)
    expect(screen.getByText('Something failed')).toBeTruthy()
  })
  it('renders default title', () => {
    render(<ErrorMessage message="Error" />)
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })
  it('renders custom title', () => {
    render(<ErrorMessage title="Custom Error" message="Error" />)
    expect(screen.getByText('Custom Error')).toBeTruthy()
  })
  it('renders retry button when onRetry provided', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage message="Error" onRetry={onRetry} />)
    const btn = screen.getByText('Try Again')
    fireEvent.click(btn)
    expect(onRetry).toHaveBeenCalled()
  })
  it('does not render retry button without onRetry', () => {
    render(<ErrorMessage message="Error" />)
    expect(screen.queryByText('Try Again')).toBeNull()
  })
})

// ---------- ScoreCard ----------
const makeScore = (grade: 'A' | 'B' | 'C' | 'D' | 'F', overall = 85): CompositeScore => ({
  overall,
  grade,
  academics: overall,
  funding: overall,
  environment: overall,
  equity: overall,
})

describe('ScoreCard', () => {
  it('renders grade A', () => {
    render(<ScoreCard score={makeScore('A', 95)} />)
    expect(screen.getByText('A')).toBeTruthy()
  })
  it('renders grade B', () => {
    render(<ScoreCard score={makeScore('B', 85)} />)
    expect(screen.getByText('B')).toBeTruthy()
  })
  it('renders grade C', () => {
    render(<ScoreCard score={makeScore('C', 75)} />)
    expect(screen.getByText('C')).toBeTruthy()
  })
  it('renders grade D', () => {
    render(<ScoreCard score={makeScore('D', 65)} />)
    expect(screen.getByText('D')).toBeTruthy()
  })
  it('renders grade F', () => {
    render(<ScoreCard score={makeScore('F', 55)} />)
    expect(screen.getByText('F')).toBeTruthy()
  })
  it('renders overall score', () => {
    render(<ScoreCard score={makeScore('A', 95)} />)
    expect(screen.getByText('Score: 95/100')).toBeTruthy()
  })
  it('renders breakdown when showBreakdown=true', () => {
    render(<ScoreCard score={makeScore('B', 85)} showBreakdown />)
    expect(screen.getByText('Academics')).toBeTruthy()
    expect(screen.getByText('Funding')).toBeTruthy()
    expect(screen.getByText('Environment')).toBeTruthy()
    expect(screen.getByText('Equity')).toBeTruthy()
  })
  it('renders lg size', () => {
    render(<ScoreCard score={makeScore('A', 95)} size="lg" />)
    expect(screen.getByText('A')).toBeTruthy()
  })
  it('renders sm size', () => {
    render(<ScoreCard score={makeScore('A', 95)} size="sm" />)
    expect(screen.getByText('A')).toBeTruthy()
  })
})

// ---------- MetricCard ----------
describe('MetricCard', () => {
  it('renders label and value', () => {
    render(<MetricCard label="Students" value="5,000" />)
    expect(screen.getByText('Students')).toBeTruthy()
    expect(screen.getByText('5,000')).toBeTruthy()
  })
  it('renders subtitle when provided', () => {
    render(<MetricCard label="Rate" value="20%" subtitle="Per year" />)
    expect(screen.getByText('Per year')).toBeTruthy()
  })
  it('renders with highlight prop', () => {
    const { container } = render(<MetricCard label="Val" value="99" highlight />)
    expect(container.firstChild).toBeTruthy()
  })
  it('renders icon when provided', () => {
    render(<MetricCard label="Val" value="99" icon={<span data-testid="icon">★</span>} />)
    expect(screen.getByTestId('icon')).toBeTruthy()
  })
})

// ---------- SearchBar ----------
describe('SearchBar', () => {
  it('renders input with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search..." />)
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy()
  })
  it('calls onChange on input', () => {
    const onChange = vi.fn()
    render(<SearchBar value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledWith('test')
  })
  it('shows clear button when value is set and onClear provided', () => {
    const onClear = vi.fn()
    render(<SearchBar value="hello" onChange={() => {}} onClear={onClear} />)
    const clearBtn = screen.getByLabelText('Clear search')
    fireEvent.click(clearBtn)
    expect(onClear).toHaveBeenCalled()
  })
  it('does not show clear button without value', () => {
    render(<SearchBar value="" onChange={() => {}} onClear={() => {}} />)
    expect(screen.queryByLabelText('Clear search')).toBeNull()
  })
  it('does not show clear button without onClear', () => {
    render(<SearchBar value="hello" onChange={() => {}} />)
    expect(screen.queryByLabelText('Clear search')).toBeNull()
  })
})

// ---------- FilterPanel ----------
describe('FilterPanel', () => {
  it('renders state dropdown', () => {
    render(
      <FilterPanel
        selectedFips={null}
        onStateChange={() => {}}
        sortBy="name"
        onSortChange={() => {}}
      />
    )
    expect(screen.getByLabelText('State')).toBeTruthy()
  })
  it('calls onStateChange on state selection', () => {
    const onStateChange = vi.fn()
    render(
      <FilterPanel
        selectedFips={null}
        onStateChange={onStateChange}
        sortBy="name"
        onSortChange={() => {}}
      />
    )
    fireEvent.change(screen.getByLabelText('State'), { target: { value: '6' } })
    expect(onStateChange).toHaveBeenCalledWith(6)
  })
  it('calls onStateChange with null when empty value selected', () => {
    const onStateChange = vi.fn()
    render(
      <FilterPanel
        selectedFips={6}
        onStateChange={onStateChange}
        sortBy="name"
        onSortChange={() => {}}
      />
    )
    fireEvent.change(screen.getByLabelText('State'), { target: { value: '' } })
    expect(onStateChange).toHaveBeenCalledWith(null)
  })
  it('calls onSortChange on sort selection', () => {
    const onSortChange = vi.fn()
    render(
      <FilterPanel
        selectedFips={null}
        onStateChange={() => {}}
        sortBy="name"
        onSortChange={onSortChange}
      />
    )
    fireEvent.change(screen.getByLabelText('Sort By'), { target: { value: 'enrollment' } })
    expect(onSortChange).toHaveBeenCalledWith('enrollment')
  })
})

// ---------- DistrictCard ----------
const mockDistrict: DistrictDirectory = {
  leaid: '0600001',
  lea_name: 'Test Unified School District',
  state_name: 'California',
  state_abbr: 'CA',
  fips: 6,
  city_location: 'Los Angeles',
  zip_location: '90001',
  phone: null,
  website: null,
  enrollment: 5000,
  teachers_fte: 250,
  locale: 11,
  latitude: 34.05,
  longitude: -118.24,
  year: 2022,
}

describe('DistrictCard', () => {
  it('renders district name', () => {
    render(
      <MemoryRouter>
        <DistrictCard district={mockDistrict} />
      </MemoryRouter>
    )
    expect(screen.getByText('Test Unified School District')).toBeTruthy()
  })
  it('renders city and state', () => {
    render(
      <MemoryRouter>
        <DistrictCard district={mockDistrict} />
      </MemoryRouter>
    )
    expect(screen.getByText('Los Angeles, CA')).toBeTruthy()
  })
  it('renders locale label', () => {
    render(
      <MemoryRouter>
        <DistrictCard district={mockDistrict} />
      </MemoryRouter>
    )
    expect(screen.getByText('City: Large')).toBeTruthy()
  })
  it('renders grade when score provided', () => {
    render(
      <MemoryRouter>
        <DistrictCard district={mockDistrict} score={makeScore('B', 85)} />
      </MemoryRouter>
    )
    expect(screen.getByText('B')).toBeTruthy()
  })
  it('renders compare button when callbacks provided', () => {
    render(
      <MemoryRouter>
        <DistrictCard district={mockDistrict} onCompareAdd={() => {}} onCompareRemove={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByText('Compare')).toBeTruthy()
  })
  it('calls onCompareAdd when Compare clicked', () => {
    const onAdd = vi.fn()
    render(
      <MemoryRouter>
        <DistrictCard district={mockDistrict} onCompareAdd={onAdd} onCompareRemove={() => {}} />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Compare'))
    expect(onAdd).toHaveBeenCalledWith('0600001')
  })
  it('calls onCompareRemove when Comparing clicked', () => {
    const onRemove = vi.fn()
    render(
      <MemoryRouter>
        <DistrictCard district={mockDistrict} onCompareAdd={() => {}} onCompareRemove={onRemove} isInCompare />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('✓ Comparing'))
    expect(onRemove).toHaveBeenCalledWith('0600001')
  })
  it('disables compare button when compareDisabled', () => {
    render(
      <MemoryRouter>
        <DistrictCard district={mockDistrict} onCompareAdd={() => {}} onCompareRemove={() => {}} compareDisabled />
      </MemoryRouter>
    )
    expect(screen.getByText('Compare').closest('button')).toBeDisabled()
  })
  it('renders without locale when locale is null', () => {
    const noLocale = { ...mockDistrict, locale: null }
    render(
      <MemoryRouter>
        <DistrictCard district={noLocale} />
      </MemoryRouter>
    )
    expect(screen.getByText('Test Unified School District')).toBeTruthy()
  })
})
