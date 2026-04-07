import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ComparisonGrid } from '../components/ui/ComparisonGrid'
import type { DistrictDetail, CompositeScore } from '../types/district'

const makeDir = (leaid: string, name: string) => ({
  leaid,
  lea_name: name,
  state_name: 'California',
  state_abbr: 'CA',
  fips: 6,
  city_location: 'San Francisco',
  zip_location: '94102',
  phone: null,
  website: null,
  enrollment: 5000,
  teachers_fte: 250,
  locale: 11,
  latitude: 37.77,
  longitude: -122.41,
  year: 2022,
})

const makeDetail = (leaid: string, name: string): DistrictDetail => ({
  directory: makeDir(leaid, name),
  finance: {
    leaid,
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
  },
  assessments: [
    { leaid, subject: 'math', grade: 4, pct_prof_low: 50, pct_prof_high: 70, pct_prof_midpt: 60, year: 2022 },
    { leaid, subject: 'rla', grade: 4, pct_prof_low: 45, pct_prof_high: 65, pct_prof_midpt: 55, year: 2022 },
  ],
  saipe: { leaid, saipe_pov_rate_5_17: 10, saipe_median_hh_inc: 70000, year: 2022 },
  enrollmentByRace: [],
})

const makeScore = (overall: number): CompositeScore => ({
  overall,
  grade: overall >= 90 ? 'A' : overall >= 80 ? 'B' : overall >= 70 ? 'C' : overall >= 60 ? 'D' : 'F',
  academics: overall,
  funding: overall,
  environment: overall,
  equity: overall,
})

const entries = [
  { detail: makeDetail('A001', 'District Alpha'), score: makeScore(85) },
  { detail: makeDetail('A002', 'District Beta'), score: makeScore(72) },
]

describe('ComparisonGrid', () => {
  it('renders nothing when entries are empty', () => {
    const { container } = render(
      <MemoryRouter>
        <ComparisonGrid entries={[]} onRemove={() => {}} />
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders district names', () => {
    render(
      <MemoryRouter>
        <ComparisonGrid entries={entries} onRemove={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByText('District Alpha')).toBeTruthy()
    expect(screen.getByText('District Beta')).toBeTruthy()
  })

  it('calls onRemove when Remove clicked', () => {
    const onRemove = vi.fn()
    render(
      <MemoryRouter>
        <ComparisonGrid entries={entries} onRemove={onRemove} />
      </MemoryRouter>
    )
    const removeButtons = screen.getAllByText('Remove')
    fireEvent.click(removeButtons[0])
    expect(onRemove).toHaveBeenCalledWith('A001')
  })

  it('renders metric labels', () => {
    render(
      <MemoryRouter>
        <ComparisonGrid entries={entries} onRemove={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByText('Overall Grade')).toBeTruthy()
    expect(screen.getByText('Enrollment')).toBeTruthy()
    expect(screen.getByText('Per-Pupil Spending')).toBeTruthy()
  })

  it('handles null finance gracefully', () => {
    const noFinanceEntries = [
      { detail: { ...makeDetail('C001', 'No Finance District'), finance: null }, score: makeScore(70) },
    ]
    render(
      <MemoryRouter>
        <ComparisonGrid entries={noFinanceEntries} onRemove={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByText('No Finance District')).toBeTruthy()
  })

  it('handles null saipe gracefully', () => {
    const noSaipe = [
      { detail: { ...makeDetail('D001', 'No SAIPE'), saipe: null }, score: makeScore(70) },
    ]
    render(
      <MemoryRouter>
        <ComparisonGrid entries={noSaipe} onRemove={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByText('No SAIPE')).toBeTruthy()
  })
})
