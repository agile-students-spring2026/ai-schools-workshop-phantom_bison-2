import { describe, it, expect } from 'vitest'
import { computeCompositeScore, scoreToGrade, clamp } from '../utils/scoring'
import type { DistrictDetail } from '../types/district'

const baseDirectory = {
  leaid: '0600001',
  lea_name: 'Test District',
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

const goodDetail: DistrictDetail = {
  directory: baseDirectory,
  finance: {
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
  },
  assessments: [
    { leaid: '0600001', subject: 'math', grade: 4, pct_prof_low: 60, pct_prof_high: 70, pct_prof_midpt: 65, year: 2022 },
    { leaid: '0600001', subject: 'rla', grade: 4, pct_prof_low: 55, pct_prof_high: 65, pct_prof_midpt: 60, year: 2022 },
  ],
  saipe: {
    leaid: '0600001',
    saipe_pov_rate_5_17: 10,
    saipe_median_hh_inc: 70000,
    year: 2022,
  },
  enrollmentByRace: [],
}

const noDataDetail: DistrictDetail = {
  directory: { ...baseDirectory, enrollment: null, teachers_fte: null },
  finance: null,
  assessments: [],
  saipe: null,
  enrollmentByRace: [],
}

describe('clamp', () => {
  it('clamps below min', () => {
    expect(clamp(-10)).toBe(0)
  })
  it('clamps above max', () => {
    expect(clamp(110)).toBe(100)
  })
  it('passes through in-range values', () => {
    expect(clamp(50)).toBe(50)
  })
  it('respects custom min/max', () => {
    expect(clamp(5, 10, 90)).toBe(10)
    expect(clamp(95, 10, 90)).toBe(90)
  })
})

describe('scoreToGrade', () => {
  it('returns A for >= 90', () => {
    expect(scoreToGrade(90)).toBe('A')
    expect(scoreToGrade(100)).toBe('A')
  })
  it('returns B for 80-89', () => {
    expect(scoreToGrade(80)).toBe('B')
    expect(scoreToGrade(89)).toBe('B')
  })
  it('returns C for 70-79', () => {
    expect(scoreToGrade(70)).toBe('C')
  })
  it('returns D for 60-69', () => {
    expect(scoreToGrade(60)).toBe('D')
  })
  it('returns F for < 60', () => {
    expect(scoreToGrade(59)).toBe('F')
    expect(scoreToGrade(0)).toBe('F')
  })
})

describe('computeCompositeScore', () => {
  it('returns a valid score for a good district', () => {
    const score = computeCompositeScore(goodDetail)
    expect(score.overall).toBeGreaterThan(0)
    expect(score.overall).toBeLessThanOrEqual(100)
    expect(['A', 'B', 'C', 'D', 'F']).toContain(score.grade)
    expect(score.academics).toBeGreaterThan(0)
    expect(score.funding).toBeGreaterThan(0)
    expect(score.environment).toBeGreaterThan(0)
    expect(score.equity).toBeGreaterThan(0)
  })

  it('returns a default score when no data available', () => {
    const score = computeCompositeScore(noDataDetail)
    expect(score.overall).toBeGreaterThan(0)
    expect(score.overall).toBeLessThanOrEqual(100)
  })

  it('produces higher academic score for better proficiency', () => {
    const highProf: DistrictDetail = {
      ...goodDetail,
      assessments: [
        { leaid: '1', subject: 'math', grade: 4, pct_prof_low: 85, pct_prof_high: 95, pct_prof_midpt: 90, year: 2022 },
        { leaid: '1', subject: 'rla', grade: 4, pct_prof_low: 80, pct_prof_high: 90, pct_prof_midpt: 85, year: 2022 },
      ],
    }
    const lowProf: DistrictDetail = {
      ...goodDetail,
      assessments: [
        { leaid: '1', subject: 'math', grade: 4, pct_prof_low: 10, pct_prof_high: 20, pct_prof_midpt: 15, year: 2022 },
        { leaid: '1', subject: 'rla', grade: 4, pct_prof_low: 5, pct_prof_high: 15, pct_prof_midpt: 10, year: 2022 },
      ],
    }
    const highScore = computeCompositeScore(highProf)
    const lowScore = computeCompositeScore(lowProf)
    expect(highScore.academics).toBeGreaterThan(lowScore.academics)
  })

  it('handles zero teachers_fte gracefully', () => {
    const d: DistrictDetail = {
      ...goodDetail,
      directory: { ...baseDirectory, teachers_fte: 0 },
    }
    const score = computeCompositeScore(d)
    expect(score.environment).toBe(60)
  })

  it('handles zero enrollment in finance gracefully', () => {
    const d: DistrictDetail = {
      ...goodDetail,
      finance: {
        leaid: '1',
        rev_total: null,
        rev_fed_total: null,
        rev_state_total: null,
        rev_local_total: null,
        exp_total: 0,
        exp_current_instruction_total: null,
        salaries_instruction: null,
        enrollment: 0,
        exp_total_ppe: null,
        year: 2021,
      },
    }
    expect(() => computeCompositeScore(d)).not.toThrow()
  })

  it('handles zero total revenue in funding score', () => {
    const d: DistrictDetail = {
      ...goodDetail,
      finance: {
        ...goodDetail.finance!,
        rev_total: 0,
        exp_total_ppe: 15000,
      },
    }
    const score = computeCompositeScore(d)
    expect(score.funding).toBeGreaterThan(0)
  })
})
