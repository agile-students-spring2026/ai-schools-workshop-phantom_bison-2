import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  ProficiencyChart,
  formatPctTick,
  formatAllGradeTooltip,
  formatGradeTooltip,
} from '../components/charts/ProficiencyChart'
import { FinanceChart, makeFinanceTooltipFormatter } from '../components/charts/FinanceChart'
import { EnrollmentChart, formatEnrollmentTooltip } from '../components/charts/EnrollmentChart'
import type { DistrictAssessment, DistrictFinance, EnrollmentByRace } from '../types/district'

vi.mock('recharts', () => {
  const React = require('react')
  const stub = (name: string) => ({ children, ...props }: Record<string, unknown>) =>
    React.createElement('div', { 'data-testid': name, ...props }, children as React.ReactNode)
  return {
    BarChart: stub('BarChart'),
    Bar: stub('Bar'),
    XAxis: stub('XAxis'),
    YAxis: stub('YAxis'),
    CartesianGrid: stub('CartesianGrid'),
    Tooltip: stub('Tooltip'),
    Legend: stub('Legend'),
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'ResponsiveContainer' }, children),
    ReferenceLine: stub('ReferenceLine'),
    PieChart: stub('PieChart'),
    Pie: stub('Pie'),
    Cell: stub('Cell'),
  }
})

// ---------- Exported formatter functions ----------
describe('formatPctTick', () => {
  it('formats number as percent string', () => {
    expect(formatPctTick(50)).toBe('50%')
    expect(formatPctTick(0)).toBe('0%')
    expect(formatPctTick(100)).toBe('100%')
  })
})

describe('formatAllGradeTooltip', () => {
  it('formats value with 1 decimal', () => {
    const [label] = formatAllGradeTooltip(65.4)
    expect(label).toBe('65.4%')
  })
  it('returns Proficiency as key', () => {
    const [, key] = formatAllGradeTooltip(50)
    expect(key).toBe('Proficiency')
  })
})

describe('formatGradeTooltip', () => {
  it('formats non-null value', () => {
    const [label] = formatGradeTooltip(72.3)
    expect(label).toBe('72.3%')
  })
  it('returns N/A for null', () => {
    const [label] = formatGradeTooltip(null)
    expect(label).toBe('N/A')
  })
  it('returns empty key', () => {
    const [, key] = formatGradeTooltip(50)
    expect(key).toBe('')
  })
})

describe('makeFinanceTooltipFormatter', () => {
  it('formats value with currency and percent', () => {
    const fmt = makeFinanceTooltipFormatter(100_000_000)
    const [label] = fmt(10_000_000)
    expect(label).toContain('10.0%')
    expect(label).toContain('$10.0M')
  })
  it('returns empty string key', () => {
    const fmt = makeFinanceTooltipFormatter(100)
    const [, key] = fmt(50)
    expect(key).toBe('')
  })
})

describe('formatEnrollmentTooltip', () => {
  it('formats with count and pct', () => {
    const [label, key] = formatEnrollmentTooltip(1500, '', { payload: { pct: '30.0' } })
    expect(label).toContain('1,500')
    expect(label).toContain('30.0%')
    expect(key).toBe('Students')
  })
  it('handles missing pct gracefully', () => {
    const [label] = formatEnrollmentTooltip(1000, '', {})
    expect(label).toContain('1,000')
    expect(label).toContain('%')
  })
})

// ---------- ProficiencyChart ----------
describe('ProficiencyChart', () => {
  it('shows no data message when assessments empty', () => {
    render(<ProficiencyChart assessments={[]} />)
    expect(screen.getByText('No assessment data available')).toBeTruthy()
  })

  it('renders with grade-level assessments', () => {
    const assessments: DistrictAssessment[] = [
      { leaid: '1', subject: 'math', grade: 4, pct_prof_low: 50, pct_prof_high: 70, pct_prof_midpt: 60, year: 2022 },
      { leaid: '1', subject: 'rla', grade: 4, pct_prof_low: 45, pct_prof_high: 65, pct_prof_midpt: 55, year: 2022 },
    ]
    render(<ProficiencyChart assessments={assessments} />)
    expect(screen.getByTestId('ResponsiveContainer')).toBeTruthy()
  })

  it('renders all-grade assessment (no grade breakdown)', () => {
    const assessments: DistrictAssessment[] = [
      { leaid: '1', subject: 'math', grade: 'all', pct_prof_low: 50, pct_prof_high: 70, pct_prof_midpt: 60, year: 2022 },
      { leaid: '1', subject: 'rla', grade: 'all', pct_prof_low: 45, pct_prof_high: 65, pct_prof_midpt: 55, year: 2022 },
    ]
    render(<ProficiencyChart assessments={assessments} />)
    expect(screen.getByTestId('ResponsiveContainer')).toBeTruthy()
  })

  it('renders with null pct_prof_midpt filtered out', () => {
    const assessments: DistrictAssessment[] = [
      { leaid: '1', subject: 'math', grade: 4, pct_prof_low: null, pct_prof_high: null, pct_prof_midpt: null, year: 2022 },
    ]
    render(<ProficiencyChart assessments={assessments} />)
    expect(screen.getByText('No assessment data available')).toBeTruthy()
  })

  it('renders math-only all-grade (no reading)', () => {
    const assessments: DistrictAssessment[] = [
      { leaid: '1', subject: 'math', grade: 'all', pct_prof_low: 50, pct_prof_high: 70, pct_prof_midpt: 60, year: 2022 },
    ]
    render(<ProficiencyChart assessments={assessments} />)
    expect(screen.getByTestId('ResponsiveContainer')).toBeTruthy()
  })

  it('renders grade-level chart with multiple grades for both subjects (covers sort callbacks)', () => {
    const assessments: DistrictAssessment[] = [
      { leaid: '1', subject: 'math', grade: 8, pct_prof_low: 45, pct_prof_high: 65, pct_prof_midpt: 55, year: 2022 },
      { leaid: '1', subject: 'math', grade: 4, pct_prof_low: 50, pct_prof_high: 70, pct_prof_midpt: 60, year: 2022 },
      { leaid: '1', subject: 'rla', grade: 8, pct_prof_low: 40, pct_prof_high: 60, pct_prof_midpt: 50, year: 2022 },
      { leaid: '1', subject: 'rla', grade: 4, pct_prof_low: 45, pct_prof_high: 65, pct_prof_midpt: 55, year: 2022 },
    ]
    render(<ProficiencyChart assessments={assessments} />)
    expect(screen.getByTestId('ResponsiveContainer')).toBeTruthy()
  })
})

// ---------- FinanceChart ----------
const mockFinance: DistrictFinance = {
  leaid: '0600001',
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

describe('FinanceChart', () => {
  it('renders chart with valid finance data', () => {
    render(<FinanceChart finance={mockFinance} />)
    expect(screen.getByTestId('ResponsiveContainer')).toBeTruthy()
  })

  it('shows no data message when all revenues are zero', () => {
    render(
      <FinanceChart
        finance={{ ...mockFinance, rev_fed_total: 0, rev_state_total: 0, rev_local_total: 0 }}
      />
    )
    expect(screen.getByText('No revenue data available')).toBeTruthy()
  })

  it('renders with null revenue values treated as zero', () => {
    render(
      <FinanceChart
        finance={{ ...mockFinance, rev_fed_total: null, rev_state_total: null, rev_local_total: null }}
      />
    )
    expect(screen.getByText('No revenue data available')).toBeTruthy()
  })

  it('filters out zero-value entries from pie data', () => {
    render(
      <FinanceChart
        finance={{ ...mockFinance, rev_fed_total: 0, rev_state_total: 50_000_000, rev_local_total: 50_000_000 }}
      />
    )
    expect(screen.getByTestId('ResponsiveContainer')).toBeTruthy()
  })
})

// ---------- EnrollmentChart ----------
describe('EnrollmentChart', () => {
  it('shows no data message when empty', () => {
    render(<EnrollmentChart enrollmentByRace={[]} />)
    expect(screen.getByText('No enrollment breakdown available')).toBeTruthy()
  })

  it('renders with valid enrollment data', () => {
    const data: EnrollmentByRace[] = [
      { leaid: '1', race: 1, race_label: 'White', enrollment: 2000, year: 2022 },
      { leaid: '1', race: 3, race_label: 'Hispanic', enrollment: 1500, year: 2022 },
    ]
    render(<EnrollmentChart enrollmentByRace={data} />)
    expect(screen.getByTestId('ResponsiveContainer')).toBeTruthy()
  })

  it('filters out total-row races (9 and 99)', () => {
    const data: EnrollmentByRace[] = [
      { leaid: '1', race: 9, race_label: 'Total', enrollment: 5000, year: 2022 },
      { leaid: '1', race: 99, race_label: 'Total', enrollment: 5000, year: 2022 },
    ]
    render(<EnrollmentChart enrollmentByRace={data} />)
    expect(screen.getByText('No enrollment breakdown available')).toBeTruthy()
  })

  it('filters out zero-enrollment entries', () => {
    const data: EnrollmentByRace[] = [
      { leaid: '1', race: 1, race_label: 'White', enrollment: 0, year: 2022 },
    ]
    render(<EnrollmentChart enrollmentByRace={data} />)
    expect(screen.getByText('No enrollment breakdown available')).toBeTruthy()
  })

  it('handles null race_label', () => {
    const data: EnrollmentByRace[] = [
      { leaid: '1', race: 7, race_label: null as unknown as string, enrollment: 300, year: 2022 },
    ]
    render(<EnrollmentChart enrollmentByRace={data} />)
    expect(screen.getByTestId('ResponsiveContainer')).toBeTruthy()
  })
})
