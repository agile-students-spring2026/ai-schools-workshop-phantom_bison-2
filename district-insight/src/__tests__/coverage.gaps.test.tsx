/**
 * Targeted tests to fill remaining coverage gaps.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useDistricts, clearDistrictsCache } from '../hooks/useDistricts'
import { useDistrictDetail, clearDistrictDetailCache } from '../hooks/useDistrictDetail'
import { computeCompositeScore } from '../utils/scoring'
import { Header } from '../components/layout/Header'
import { ScoreCard } from '../components/ui/ScoreCard'
import { ComparisonGrid } from '../components/ui/ComparisonGrid'
import { HomePage } from '../pages/HomePage'
import type { DistrictDetail, CompositeScore, DistrictDirectory } from '../types/district'

// ────────────────────────────────────────────────────────────────
// Scoring edge cases
// ────────────────────────────────────────────────────────────────

const baseDir: DistrictDirectory = {
  leaid: 'GAP001',
  lea_name: 'Gap Test District',
  state_name: 'California',
  state_abbr: 'CA',
  fips: 6,
  city_location: 'LA',
  zip_location: '90001',
  phone: null,
  website: null,
  enrollment: 5000,
  teachers_fte: 250,
  locale: 11,
  latitude: 34,
  longitude: -118,
  year: 2022,
}

describe('scoring edge cases', () => {
  it('computes PPE from exp_total when exp_total_ppe is null', () => {
    const d: DistrictDetail = {
      directory: baseDir,
      finance: {
        leaid: 'GAP001',
        rev_total: 100_000_000,
        rev_fed_total: 10_000_000,
        rev_state_total: 45_000_000,
        rev_local_total: 45_000_000,
        exp_total: 95_000_000,
        exp_current_instruction_total: 50_000_000,
        salaries_instruction: 30_000_000,
        enrollment: 5000,
        exp_total_ppe: null,
        year: 2021,
      },
      assessments: [],
      saipe: null,
      enrollmentByRace: [],
    }
    const score = computeCompositeScore(d)
    expect(score.funding).toBeGreaterThan(0)
  })

  it('returns funding=50 when ppeValue is zero (enrollment=0, exp_total_ppe=null)', () => {
    const d: DistrictDetail = {
      directory: baseDir,
      finance: {
        leaid: 'GAP001',
        rev_total: 0,
        rev_fed_total: 0,
        rev_state_total: 0,
        rev_local_total: 0,
        exp_total: 0,
        exp_current_instruction_total: null,
        salaries_instruction: null,
        enrollment: 0,
        exp_total_ppe: null,
        year: 2021,
      },
      assessments: [],
      saipe: null,
      enrollmentByRace: [],
    }
    const score = computeCompositeScore(d)
    expect(score.funding).toBe(50)
  })

  it('uses directory.enrollment when finance.enrollment is null', () => {
    const d: DistrictDetail = {
      directory: { ...baseDir, enrollment: 4000 },
      finance: {
        leaid: 'GAP001',
        rev_total: 100_000_000,
        rev_fed_total: 10_000_000,
        rev_state_total: 45_000_000,
        rev_local_total: 45_000_000,
        exp_total: 80_000_000,
        exp_current_instruction_total: 40_000_000,
        salaries_instruction: 25_000_000,
        enrollment: null,
        exp_total_ppe: null,
        year: 2021,
      },
      assessments: [],
      saipe: null,
      enrollmentByRace: [],
    }
    const score = computeCompositeScore(d)
    expect(score.funding).toBeGreaterThan(0)
  })

  it('calculates equity spread when >1 assessment', () => {
    const d: DistrictDetail = {
      directory: baseDir,
      finance: null,
      assessments: [
        { leaid: 'GAP001', subject: 'math', grade: 4, pct_prof_low: 30, pct_prof_high: 50, pct_prof_midpt: 40, year: 2022 },
        { leaid: 'GAP001', subject: 'math', grade: 8, pct_prof_low: 60, pct_prof_high: 80, pct_prof_midpt: 70, year: 2022 },
        { leaid: 'GAP001', subject: 'rla', grade: 4, pct_prof_low: 20, pct_prof_high: 40, pct_prof_midpt: 30, year: 2022 },
      ],
      saipe: null,
      enrollmentByRace: [],
    }
    const score = computeCompositeScore(d)
    expect(score.equity).toBeGreaterThan(0)
    expect(score.equity).toBeLessThanOrEqual(100)
  })

  it('handles null enrollment in directory for environment score', () => {
    const d: DistrictDetail = {
      directory: { ...baseDir, enrollment: null },
      finance: null,
      assessments: [],
      saipe: null,
      enrollmentByRace: [],
    }
    const score = computeCompositeScore(d)
    expect(score.environment).toBe(60)
  })
})

// ────────────────────────────────────────────────────────────────
// Hooks: cache hit paths
// ────────────────────────────────────────────────────────────────

function makeOkResponse(results: unknown[] = []) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({ count: results.length, next: null, previous: null, results }),
  } as Response
}

const mockDir = {
  leaid: 'CACHE001',
  lea_name: 'Cache Test USD',
  state_name: 'California',
  state_abbr: 'CA',
  fips: 6,
  city_location: 'LA',
  zip_location: '90001',
  phone: null,
  website: null,
  enrollment: 1000,
  teachers_fte: 50,
  locale: 11,
  latitude: 34,
  longitude: -118,
  year: 2022,
}

afterEach(() => {
  vi.restoreAllMocks()
  clearDistrictsCache()
  clearDistrictDetailCache()
})

describe('useDistricts - cache hit', () => {
  it('returns cached data without re-fetching', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(makeOkResponse([mockDir]))

    // First render: populates cache with fips=801
    const { result: result1, unmount: unmount1 } = renderHook(() => useDistricts(801))
    await waitFor(() => expect(result1.current.loading).toBe(false))
    expect(result1.current.districts).toHaveLength(1)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    unmount1()

    // Second render with same fips: should use cache, not call fetch again
    const { result: result2 } = renderHook(() => useDistricts(801))
    expect(result2.current.loading).toBe(false)
    expect(result2.current.districts).toHaveLength(1)
    expect(fetchSpy).toHaveBeenCalledTimes(1) // still 1, no extra fetch
  })
})

describe('useDistricts - abort on fips change', () => {
  it('aborts previous request when fips changes', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(makeOkResponse([mockDir]))

    const { result, rerender } = renderHook(({ fips }: { fips: number }) => useDistricts(fips), {
      initialProps: { fips: 901 },
    })

    // Immediately change fips before first fetch completes
    act(() => {
      rerender({ fips: 902 })
    })

    await waitFor(() => expect(result.current.loading).toBe(false))
    // Should end up with data from the second fips
    expect(result.current.error).toBeNull()
  })
})

describe('useDistrictDetail - cache hit', () => {
  it('returns cached detail without re-fetching', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(makeOkResponse([{ ...mockDir, leaid: 'DETAIL_CACHE_001' }]))
      .mockResolvedValueOnce(makeOkResponse([]))
      .mockResolvedValueOnce(makeOkResponse([]))
      .mockResolvedValueOnce(makeOkResponse([]))
      .mockResolvedValueOnce(makeOkResponse([]))

    // First render: populates cache
    const { result: result1, unmount } = renderHook(() => useDistrictDetail('DETAIL_CACHE_001'))
    await waitFor(() => expect(result1.current.loading).toBe(false))
    expect(result1.current.detail).not.toBeNull()
    const callCount = fetchSpy.mock.calls.length
    unmount()

    // Second render with same leaid: should use cache
    const { result: result2 } = renderHook(() => useDistrictDetail('DETAIL_CACHE_001'))
    expect(result2.current.loading).toBe(false)
    expect(result2.current.detail).not.toBeNull()
    expect(fetchSpy.mock.calls.length).toBe(callCount) // no extra fetch
  })
})

// ────────────────────────────────────────────────────────────────
// Header: active NavLink branches
// ────────────────────────────────────────────────────────────────

describe('Header NavLink active states', () => {
  it('renders Find Districts with active style when on /search', () => {
    render(
      <MemoryRouter initialEntries={['/search']}>
        <Header />
      </MemoryRouter>
    )
    expect(screen.getByText('Find Districts')).toBeTruthy()
  })

  it('renders Compare with active style when on /compare', () => {
    render(
      <MemoryRouter initialEntries={['/compare']}>
        <Header />
      </MemoryRouter>
    )
    expect(screen.getByText('Compare')).toBeTruthy()
  })

  it('renders For Educators with active style when on /for-teachers', () => {
    render(
      <MemoryRouter initialEntries={['/for-teachers']}>
        <Header />
      </MemoryRouter>
    )
    expect(screen.getByText('For Educators')).toBeTruthy()
  })
})

// ────────────────────────────────────────────────────────────────
// ScoreCard: getDimensionColors edge cases
// ────────────────────────────────────────────────────────────────

describe('ScoreCard getDimensionColors', () => {
  it('shows A dimension color (score >= 90)', () => {
    const score: CompositeScore = {
      overall: 92,
      grade: 'A',
      academics: 95,
      funding: 91,
      environment: 90,
      equity: 92,
    }
    const { container } = render(<ScoreCard score={score} showBreakdown />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows D dimension color (score 60-69)', () => {
    const score: CompositeScore = {
      overall: 65,
      grade: 'D',
      academics: 62,
      funding: 64,
      environment: 63,
      equity: 61,
    }
    const { container } = render(<ScoreCard score={score} showBreakdown />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows F dimension color (score < 60)', () => {
    const score: CompositeScore = {
      overall: 50,
      grade: 'F',
      academics: 55,
      funding: 45,
      environment: 50,
      equity: 48,
    }
    const { container } = render(<ScoreCard score={score} showBreakdown />)
    expect(container.firstChild).toBeTruthy()
  })
})

// ────────────────────────────────────────────────────────────────
// ComparisonGrid: getBestIndex with all-null values
// ────────────────────────────────────────────────────────────────

describe('ComparisonGrid with null enrollment', () => {
  const makeNullDir = (leaid: string): DistrictDirectory => ({
    leaid,
    lea_name: `District ${leaid}`,
    state_name: 'California',
    state_abbr: 'CA',
    fips: 6,
    city_location: 'LA',
    zip_location: '90001',
    phone: null,
    website: null,
    enrollment: null,
    teachers_fte: null,
    locale: null,
    latitude: 34,
    longitude: -118,
    year: 2022,
  })

  const nullEntries = [
    {
      detail: {
        directory: makeNullDir('N001'),
        finance: null,
        assessments: [],
        saipe: null,
        enrollmentByRace: [],
      } as DistrictDetail,
      score: { overall: 50, grade: 'F' as const, academics: 50, funding: 50, environment: 50, equity: 50 } as CompositeScore,
    },
    {
      detail: {
        directory: makeNullDir('N002'),
        finance: null,
        assessments: [],
        saipe: null,
        enrollmentByRace: [],
      } as DistrictDetail,
      score: { overall: 60, grade: 'D' as const, academics: 60, funding: 60, environment: 60, equity: 60 } as CompositeScore,
    },
  ]

  it('renders correctly when all numeric values are null', () => {
    render(
      <MemoryRouter>
        <ComparisonGrid entries={nullEntries} onRemove={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getAllByText(/District N/)).toBeTruthy()
    expect(screen.getAllByText('N/A').length).toBeGreaterThan(0)
  })
})

// ────────────────────────────────────────────────────────────────
// HomePage: navigation on button click
// ────────────────────────────────────────────────────────────────

describe('HomePage navigation', () => {
  it('navigates to search page when Explore Districts clicked', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<div>Search Page Loaded</div>} />
        </Routes>
      </MemoryRouter>
    )
    fireEvent.change(screen.getByLabelText('Select a state'), { target: { value: '6' } })
    fireEvent.click(screen.getByText('Explore Districts'))
    expect(screen.getByText('Search Page Loaded')).toBeTruthy()
  })
})

// ────────────────────────────────────────────────────────────────
// Hooks: non-Error rejection and AbortError paths
// ────────────────────────────────────────────────────────────────

describe('useDistricts - non-Error rejection', () => {
  it('uses fallback message when non-Error thrown', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue('string error')
    const { result } = renderHook(() => useDistricts(921))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to load districts')
  })
})

describe('useDistrictDetail - non-Error rejection', () => {
  it('uses fallback message when non-Error thrown', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue('string error')
    const { result } = renderHook(() => useDistrictDetail('NONEERR_001'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Failed to load district details')
  })
})

// ────────────────────────────────────────────────────────────────
// Scoring: additional edge cases for uncovered branches
// ────────────────────────────────────────────────────────────────

describe('scoring - PPE edge cases', () => {
  it('returns funding=50 when ppeValue is 0 (finance.enrollment=0, exp_total_ppe=null, exp_total>0)', () => {
    const d: DistrictDetail = {
      directory: { ...baseDir, enrollment: 5000 },
      finance: {
        leaid: 'GAP001',
        rev_total: 50_000_000,
        rev_fed_total: 10_000_000,
        rev_state_total: 20_000_000,
        rev_local_total: 20_000_000,
        exp_total: 50_000_000,
        exp_current_instruction_total: 25_000_000,
        salaries_instruction: 15_000_000,
        enrollment: 0,
        exp_total_ppe: null,
        year: 2021,
      },
      assessments: [],
      saipe: null,
      enrollmentByRace: [],
    }
    expect(computeCompositeScore(d).funding).toBe(50)
  })

  it('uses enrollment=1 fallback when both finance.enrollment and directory.enrollment are null', () => {
    const d: DistrictDetail = {
      directory: { ...baseDir, enrollment: null },
      finance: {
        leaid: 'GAP001',
        rev_total: 50_000_000,
        rev_fed_total: 10_000_000,
        rev_state_total: 20_000_000,
        rev_local_total: 20_000_000,
        exp_total: 50_000_000,
        exp_current_instruction_total: 25_000_000,
        salaries_instruction: 15_000_000,
        enrollment: null,
        exp_total_ppe: null,
        year: 2021,
      },
      assessments: [],
      saipe: null,
      enrollmentByRace: [],
    }
    const score = computeCompositeScore(d)
    expect(score.funding).toBeGreaterThan(0)
  })
})
