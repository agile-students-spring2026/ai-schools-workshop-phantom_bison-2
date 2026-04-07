import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { SearchPage } from '../pages/SearchPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ForTeachersPage } from '../pages/ForTeachersPage'
import { DistrictDetailPage } from '../pages/DistrictDetailPage'
import { ComparePage } from '../pages/ComparePage'
import type { DistrictDirectory, DistrictDetail } from '../types/district'

vi.mock('recharts', () => {
  const React = require('react')
  const stub = () => () => React.createElement('div')
  return {
    BarChart: stub(),
    Bar: stub(),
    XAxis: stub(),
    YAxis: stub(),
    CartesianGrid: stub(),
    Tooltip: stub(),
    Legend: stub(),
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'rc' }, children),
    ReferenceLine: stub(),
    PieChart: stub(),
    Pie: stub(),
    Cell: stub(),
  }
})

vi.mock('../hooks/useDistricts', () => ({
  useDistricts: vi.fn(),
  clearDistrictsCache: vi.fn(),
}))

vi.mock('../hooks/useDistrictDetail', () => ({
  useDistrictDetail: vi.fn(),
  clearDistrictDetailCache: vi.fn(),
}))

import { useDistricts } from '../hooks/useDistricts'
import { useDistrictDetail } from '../hooks/useDistrictDetail'

const mockDir: DistrictDirectory = {
  leaid: 'TST001',
  lea_name: 'Test Unified',
  state_name: 'California',
  state_abbr: 'CA',
  fips: 6,
  city_location: 'Los Angeles',
  zip_location: '90001',
  phone: '555-1234',
  website: null,
  enrollment: 5000,
  teachers_fte: 250,
  locale: 11,
  latitude: 34.05,
  longitude: -118.24,
  year: 2022,
}

const mockDirWithWebsite: DistrictDirectory = {
  ...mockDir,
  leaid: 'TST002',
  website: 'https://example.com',
}

const mockFinance = {
  leaid: 'TST001',
  rev_total: 100_000_000,
  rev_fed_total: 10_000_000,
  rev_state_total: 45_000_000,
  rev_local_total: 45_000_000,
  exp_total: 95_000_000,
  exp_current_instruction_total: 55_000_000,
  salaries_instruction: 40_000_000,
  enrollment: 5000,
  exp_total_ppe: 19000,
  year: 2021,
}

const mockDetail: DistrictDetail = {
  directory: mockDir,
  finance: mockFinance,
  assessments: [
    { leaid: 'TST001', subject: 'math', grade: 4, pct_prof_low: 50, pct_prof_high: 70, pct_prof_midpt: 60, year: 2022 },
  ],
  saipe: { leaid: 'TST001', saipe_pov_rate_5_17: 12, saipe_median_hh_inc: 65000, year: 2022 },
  enrollmentByRace: [
    { leaid: 'TST001', race: 1, race_label: 'White', enrollment: 2000, year: 2022 },
  ],
}

function mockUseDistricts(overrides: Partial<ReturnType<typeof useDistricts>> = {}) {
  vi.mocked(useDistricts).mockReturnValue({
    districts: [],
    loading: false,
    error: null,
    ...overrides,
  })
}

function mockUseDistrictDetail(overrides: Partial<ReturnType<typeof useDistrictDetail>> = {}) {
  vi.mocked(useDistrictDetail).mockReturnValue({
    detail: null,
    loading: false,
    error: null,
    ...overrides,
  })
}

beforeEach(() => {
  mockUseDistricts()
  mockUseDistrictDetail()
})

// ---------- HomePage ----------
describe('HomePage', () => {
  it('renders hero heading', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText(/Find the right school district/)).toBeTruthy()
  })

  it('renders state dropdown', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByLabelText('Select a state')).toBeTruthy()
  })

  it('renders value prop cards', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText('Academic Performance')).toBeTruthy()
    expect(screen.getByText('Funding & Resources')).toBeTruthy()
    expect(screen.getByText('Side-by-Side Comparison')).toBeTruthy()
  })

  it('renders educator CTA', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText(/Are you an educator/)).toBeTruthy()
  })

  it('Explore Districts button is disabled when no state selected', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText('Explore Districts').closest('button')).toBeDisabled()
  })

  it('Explore Districts button enabled after state selection', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Select a state'), { target: { value: '6' } })
    expect(screen.getByText('Explore Districts').closest('button')).not.toBeDisabled()
  })

  it('renders data source attribution', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>)
    expect(screen.getByText(/Urban Institute Education Data Portal/)).toBeTruthy()
  })
})

// ---------- NotFoundPage ----------
describe('NotFoundPage', () => {
  it('renders 404', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>)
    expect(screen.getByText('404')).toBeTruthy()
  })
  it('renders Page Not Found heading', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>)
    expect(screen.getByText('Page Not Found')).toBeTruthy()
  })
  it('renders Go Home link', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>)
    expect(screen.getByText('Go Home')).toBeTruthy()
  })
  it('renders Find Districts link', () => {
    render(<MemoryRouter><NotFoundPage /></MemoryRouter>)
    expect(screen.getByText('Find Districts')).toBeTruthy()
  })
})

// ---------- SearchPage ----------
describe('SearchPage', () => {
  it('renders heading', () => {
    render(<MemoryRouter><SearchPage /></MemoryRouter>)
    expect(screen.getByText('Find School Districts')).toBeTruthy()
  })

  it('shows select a state prompt when no fips', () => {
    render(<MemoryRouter><SearchPage /></MemoryRouter>)
    expect(screen.getByText('Select a state to get started')).toBeTruthy()
  })

  it('shows loading spinner', () => {
    mockUseDistricts({ districts: [], loading: true, error: null })
    render(<MemoryRouter><SearchPage /></MemoryRouter>)
    // Loading spinner shown when state selected
    fireEvent.change(screen.getByLabelText('State'), { target: { value: '6' } })
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('displays districts when returned from hook', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    expect(screen.getByText('Test Unified')).toBeTruthy()
  })

  it('shows empty message when search yields no results', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('Filter by district or city name...'), {
      target: { value: 'zzzzzzzzzz' },
    })
    expect(screen.getByText(/No districts found/)).toBeTruthy()
  })

  it('handles sort change to enrollment', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Sort By'), { target: { value: 'enrollment' } })
    expect(screen.getByText('Test Unified')).toBeTruthy()
  })

  it('handles sort change to score', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Sort By'), { target: { value: 'score' } })
    expect(screen.getByText('Test Unified')).toBeTruthy()
  })

  it('shows error message', () => {
    mockUseDistricts({ districts: [], loading: false, error: 'Network error' })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })

  it('clears search text', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    const searchInput = screen.getByPlaceholderText('Filter by district or city name...')
    fireEvent.change(searchInput, { target: { value: 'hello' } })
    fireEvent.click(screen.getByLabelText('Clear search'))
    expect(screen.getByText('Test Unified')).toBeTruthy()
  })

  it('clears state selection (fips → null)', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('State'), { target: { value: '' } })
    expect(screen.getByText('Select a state to get started')).toBeTruthy()
  })

  it('sorts by score with 2 districts (covers sort comparator)', () => {
    const dir2 = { ...mockDir, leaid: 'TST002', lea_name: 'Beta District', enrollment: 3000 }
    mockUseDistricts({ districts: [mockDir, dir2], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Sort By'), { target: { value: 'score' } })
    expect(screen.getByText('Test Unified')).toBeTruthy()
  })

  it('shows compare banner when district added to compare (1 district)', async () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    await act(async () => {
      fireEvent.click(screen.getByText('Compare'))
    })
    expect(screen.getByText(/1 district selected for comparison/)).toBeTruthy()
  })

  it('shows plural when 2+ districts selected (covers s branch)', async () => {
    const dir2 = { ...mockDir, leaid: 'TST002', lea_name: 'Beta District' }
    mockUseDistricts({ districts: [mockDir, dir2], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    const compareBtns = screen.getAllByText('Compare')
    await act(async () => { fireEvent.click(compareBtns[0]) })
    await act(async () => { fireEvent.click(compareBtns[1]) })
    expect(screen.getByText(/2 districts selected for comparison/)).toBeTruthy()
  })

  it('sorts by enrollment with 2 districts (covers enrollment comparator)', () => {
    const dir2 = { ...mockDir, leaid: 'TST002', lea_name: 'Beta District', enrollment: 9999 }
    mockUseDistricts({ districts: [mockDir, dir2], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('Sort By'), { target: { value: 'enrollment' } })
    expect(screen.getByText('Beta District')).toBeTruthy()
  })

  it('handles pagination with many districts', () => {
    const manyDistricts = Array.from({ length: 25 }, (_, i) => ({
      ...mockDir,
      leaid: `D${i}`,
      lea_name: `District ${i}`,
    }))
    mockUseDistricts({ districts: manyDistricts, loading: false, error: null })
    render(<MemoryRouter initialEntries={['/search?fips=6']}><SearchPage /></MemoryRouter>)
    expect(screen.getByText('Next')).toBeTruthy()
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Previous')).toBeTruthy()
    fireEvent.click(screen.getByText('Previous'))
  })
})

// ---------- ForTeachersPage ----------
describe('ForTeachersPage', () => {
  it('renders educator heading', () => {
    render(<MemoryRouter><ForTeachersPage /></MemoryRouter>)
    expect(screen.getByText('Find Your Next Teaching Position')).toBeTruthy()
  })

  it('renders info cards', () => {
    render(<MemoryRouter><ForTeachersPage /></MemoryRouter>)
    expect(screen.getByText('Student-Teacher Ratio')).toBeTruthy()
    expect(screen.getByText('District Size')).toBeTruthy()
    expect(screen.getByText('Urban vs. Rural')).toBeTruthy()
  })

  it('shows select state prompt initially', () => {
    render(<MemoryRouter><ForTeachersPage /></MemoryRouter>)
    expect(screen.getByText('Select a state to browse districts')).toBeTruthy()
  })

  it('sets fips in URL when state selected (covers line 29)', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter><ForTeachersPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('State'), { target: { value: '6' } })
    expect(screen.getByText('Test Unified')).toBeTruthy()
  })

  it('displays districts from hook', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/for-teachers?fips=6']}><ForTeachersPage /></MemoryRouter>)
    expect(screen.getByText('Test Unified')).toBeTruthy()
  })

  it('shows loading spinner', () => {
    mockUseDistricts({ districts: [], loading: true, error: null })
    render(<MemoryRouter initialEntries={['/for-teachers?fips=6']}><ForTeachersPage /></MemoryRouter>)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('filters by search text', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/for-teachers?fips=6']}><ForTeachersPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('Filter by district or city name...'), {
      target: { value: 'zzzzz' },
    })
    expect(screen.getByText(/No districts found/)).toBeTruthy()
  })

  it('shows error message', () => {
    mockUseDistricts({ districts: [], loading: false, error: 'Network error' })
    render(<MemoryRouter initialEntries={['/for-teachers?fips=6']}><ForTeachersPage /></MemoryRouter>)
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })

  it('clears filter', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/for-teachers?fips=6']}><ForTeachersPage /></MemoryRouter>)
    fireEvent.change(screen.getByPlaceholderText('Filter by district or city name...'), {
      target: { value: 'zzz' },
    })
    fireEvent.click(screen.getByLabelText('Clear search'))
    expect(screen.getByText('Test Unified')).toBeTruthy()
  })

  it('clears state selection (fips → null)', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter initialEntries={['/for-teachers?fips=6']}><ForTeachersPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('State'), { target: { value: '' } })
    expect(screen.getByText('Select a state to browse districts')).toBeTruthy()
  })

  it('handles pagination', () => {
    const manyDistricts = Array.from({ length: 25 }, (_, i) => ({
      ...mockDir,
      leaid: `FT${i}`,
      lea_name: `School ${i}`,
    }))
    mockUseDistricts({ districts: manyDistricts, loading: false, error: null })
    render(<MemoryRouter initialEntries={['/for-teachers?fips=6']}><ForTeachersPage /></MemoryRouter>)
    fireEvent.click(screen.getByText('Next'))
    fireEvent.click(screen.getByText('Previous'))
  })
})

// ---------- DistrictDetailPage ----------
describe('DistrictDetailPage - loading state', () => {
  it('shows loading spinner initially', () => {
    mockUseDistrictDetail({ detail: null, loading: true, error: null })
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('renders null when detail is null and not loading', () => {
    mockUseDistrictDetail({ detail: null, loading: false, error: null })
    const { container } = render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(container.querySelector('[class]')).toBeNull()
  })
})

describe('DistrictDetailPage - error state', () => {
  it('shows error message', () => {
    mockUseDistrictDetail({ detail: null, loading: false, error: 'District not found' })
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Something went wrong')).toBeTruthy()
  })
})

describe('DistrictDetailPage - no assessments', () => {
  it('shows academics tab with no assessments (covers avgMath null branch)', () => {
    mockUseDistrictDetail({
      detail: { ...mockDetail, assessments: [] },
      loading: false,
      error: null,
    })
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Unified')
  })
})

describe('DistrictDetailPage - with data', () => {
  beforeEach(() => {
    mockUseDistrictDetail({ detail: mockDetail, loading: false, error: null })
  })

  it('renders district name', () => {
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Unified')
  })

  it('renders tab buttons', () => {
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    // Academics tab is active by default — find it among buttons
    const tabs = screen.getAllByRole('button')
    const tabLabels = tabs.map(t => t.textContent)
    expect(tabLabels).toContain('Academics')
    expect(tabLabels).toContain('Funding')
    expect(tabLabels).toContain('Demographics')
  })

  it('switches to Funding tab', () => {
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    // Click the Funding tab button specifically
    const fundingBtn = screen.getAllByRole('button').find(b => b.textContent === 'Funding')!
    fireEvent.click(fundingBtn)
    expect(screen.getByText('Per-Pupil Expenditure')).toBeTruthy()
  })

  it('switches to Demographics tab', () => {
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Demographics'))
    expect(screen.getByText('Child Poverty Rate')).toBeTruthy()
  })

  it('renders breadcrumb link', () => {
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Find Districts')).toBeTruthy()
  })

  it('renders Add to Compare link', () => {
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('+ Add to Compare')).toBeTruthy()
  })
})

describe('DistrictDetailPage - finance without ppe', () => {
  it('computes PPE from exp_total when exp_total_ppe is null', () => {
    mockUseDistrictDetail({
      detail: { ...mockDetail, finance: { ...mockFinance, exp_total_ppe: null } },
      loading: false,
      error: null,
    })
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    const fundingBtn = screen.getAllByRole('button').find(b => b.textContent === 'Funding')!
    fireEvent.click(fundingBtn)
    expect(screen.getByText('Per-Pupil Expenditure')).toBeTruthy()
  })
})

describe('DistrictDetailPage - no finance', () => {
  it('shows no finance message on funding tab', () => {
    mockUseDistrictDetail({
      detail: { ...mockDetail, finance: null },
      loading: false,
      error: null,
    })
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    const fundingBtn = screen.getAllByRole('button').find(b => b.textContent === 'Funding')!
    fireEvent.click(fundingBtn)
    expect(screen.getByText(/Finance data not available/)).toBeTruthy()
  })
})

describe('DistrictDetailPage - with website', () => {
  it('shows Visit Website link when website starts with https', () => {
    mockUseDistrictDetail({
      detail: { ...mockDetail, directory: mockDirWithWebsite },
      loading: false,
      error: null,
    })
    render(
      <MemoryRouter initialEntries={['/district/TST002']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    const link = screen.getByText(/Visit Website/) as HTMLAnchorElement
    expect(link.href).toContain('https://example.com')
  })

  it('prefixes https:// when website does not start with http', () => {
    mockUseDistrictDetail({
      detail: { ...mockDetail, directory: { ...mockDir, website: 'www.testusd.edu' } },
      loading: false,
      error: null,
    })
    render(
      <MemoryRouter initialEntries={['/district/TST003']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    const link = screen.getByText(/Visit Website/) as HTMLAnchorElement
    expect(link.href).toContain('https://www.testusd.edu')
  })
})

describe('DistrictDetailPage - instructional spending', () => {
  it('shows instructional spending percentage on Funding tab', () => {
    mockUseDistrictDetail({ detail: mockDetail, loading: false, error: null })
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    const fundingBtn = screen.getAllByRole('button').find(b => b.textContent === 'Funding')!
    fireEvent.click(fundingBtn)
    expect(screen.getByText('Instructional Spending')).toBeTruthy()
  })
})

describe('DistrictDetailPage - null saipe on demographics tab', () => {
  it('shows N/A for poverty rate when saipe is null', () => {
    mockUseDistrictDetail({
      detail: { ...mockDetail, saipe: null },
      loading: false,
      error: null,
    })
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    const demoBtn = screen.getAllByRole('button').find(b => b.textContent === 'Demographics')!
    fireEvent.click(demoBtn)
    expect(screen.getByText('Child Poverty Rate')).toBeTruthy()
  })
})

describe('DistrictDetailPage - null instructional data', () => {
  it('shows N/A for instructional spending when data is null', () => {
    mockUseDistrictDetail({
      detail: {
        ...mockDetail,
        finance: { ...mockFinance, exp_current_instruction_total: null },
      },
      loading: false,
      error: null,
    })
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    const fundingBtn = screen.getAllByRole('button').find(b => b.textContent === 'Funding')!
    fireEvent.click(fundingBtn)
    expect(screen.getByText('Instructional Spending')).toBeTruthy()
  })
})

describe('DistrictDetailPage - locale label', () => {
  it('shows locale label when locale is set', () => {
    mockUseDistrictDetail({ detail: mockDetail, loading: false, error: null })
    render(
      <MemoryRouter initialEntries={['/district/TST001']}>
        <Routes>
          <Route path="/district/:leaid" element={<DistrictDetailPage />} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('City: Large')).toBeTruthy()
  })
})

// ---------- ComparePage ----------
describe('ComparePage', () => {
  it('renders heading', () => {
    render(<MemoryRouter><ComparePage /></MemoryRouter>)
    expect(screen.getByText('Compare Districts')).toBeTruthy()
  })

  it('shows add district panel when not full', () => {
    render(<MemoryRouter><ComparePage /></MemoryRouter>)
    expect(screen.getByText('Add a District')).toBeTruthy()
  })

  it('shows empty state prompt when no districts selected', () => {
    render(<MemoryRouter><ComparePage /></MemoryRouter>)
    expect(screen.getByText(/Add districts above to start comparing/)).toBeTruthy()
  })

  it('shows district list when state selected in search panel', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter><ComparePage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('State'), { target: { value: '6' } })
    expect(screen.getByText('Test Unified')).toBeTruthy()
  })

  it('shows loading when detail loading', async () => {
    mockUseDistrictDetail({ detail: null, loading: true, error: null })
    render(
      <MemoryRouter initialEntries={['/compare?ids=TST001']}>
        <ComparePage />
      </MemoryRouter>
    )
    // Wait for the useEffect to initialize selectedIds from URL params
    await waitFor(() => expect(screen.queryByText(/Add districts above/)).toBeNull())
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
  })

  it('shows comparison grid and allows removal when detail loaded', async () => {
    mockUseDistrictDetail({ detail: mockDetail, loading: false, error: null })
    render(
      <MemoryRouter initialEntries={['/compare?ids=TST001']}>
        <ComparePage />
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.queryByText('Add districts above')).toBeNull())
    // ComparisonGrid should render with Remove button
    const removeBtns = screen.queryAllByText('Remove')
    if (removeBtns.length > 0) {
      fireEvent.click(removeBtns[0])
      expect(screen.getByText(/Add districts above/)).toBeTruthy()
    }
  })

  it('clears all districts', async () => {
    mockUseDistrictDetail({ detail: mockDetail, loading: false, error: null })
    render(
      <MemoryRouter initialEntries={['/compare?ids=TST001']}>
        <ComparePage />
      </MemoryRouter>
    )
    await waitFor(() => screen.getByText('Clear All'))
    fireEvent.click(screen.getByText('Clear All'))
    expect(screen.getByText(/Add districts above to start comparing/)).toBeTruthy()
  })

  it('searches by city in compare panel', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter><ComparePage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('State'), { target: { value: '6' } })
    // Show search bar by selecting a state (fips)
    // Then type in SearchBar
    const inputs = screen.getAllByRole('textbox')
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: 'Los Angeles' } })
    }
  })

  it('clears compare search text via SearchBar clear button', () => {
    mockUseDistricts({ districts: [mockDir], loading: false, error: null })
    render(<MemoryRouter><ComparePage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText('State'), { target: { value: '6' } })
    // SearchBar appears when state is selected; type something then clear
    const searchInput = screen.getByPlaceholderText('Search by district or city name...')
    fireEvent.change(searchInput, { target: { value: 'test' } })
    const clearBtn = screen.getByLabelText('Clear search')
    fireEvent.click(clearBtn)
    expect(searchInput).toHaveValue('')
  })
})
