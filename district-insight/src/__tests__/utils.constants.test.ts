import { describe, it, expect } from 'vitest'
import {
  DATA_YEAR,
  FINANCE_YEAR,
  SAIPE_YEAR,
  GRADE_THRESHOLDS,
  SCORE_WEIGHTS,
  LOCALE_LABELS,
  RACE_LABELS,
  NATIONAL_AVG_PROFICIENCY,
  TYPICAL_PPE,
  IDEAL_STUDENT_TEACHER_RATIO,
} from '../utils/constants'

describe('constants', () => {
  it('DATA_YEAR is a number', () => {
    expect(typeof DATA_YEAR).toBe('number')
  })
  it('FINANCE_YEAR is a number', () => {
    expect(typeof FINANCE_YEAR).toBe('number')
  })
  it('SAIPE_YEAR is a number', () => {
    expect(typeof SAIPE_YEAR).toBe('number')
  })
  it('GRADE_THRESHOLDS has A/B/C/D', () => {
    expect(GRADE_THRESHOLDS.A).toBeGreaterThan(GRADE_THRESHOLDS.B)
    expect(GRADE_THRESHOLDS.B).toBeGreaterThan(GRADE_THRESHOLDS.C)
    expect(GRADE_THRESHOLDS.C).toBeGreaterThan(GRADE_THRESHOLDS.D)
  })
  it('SCORE_WEIGHTS sum to 1', () => {
    const sum = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1)
  })
  it('LOCALE_LABELS has entries', () => {
    expect(Object.keys(LOCALE_LABELS).length).toBeGreaterThan(0)
    expect(LOCALE_LABELS[11]).toBe('City: Large')
  })
  it('RACE_LABELS has entries', () => {
    expect(Object.keys(RACE_LABELS).length).toBeGreaterThan(0)
  })
  it('NATIONAL_AVG_PROFICIENCY has math and reading', () => {
    expect(NATIONAL_AVG_PROFICIENCY.math).toBeGreaterThan(0)
    expect(NATIONAL_AVG_PROFICIENCY.reading).toBeGreaterThan(0)
  })
  it('TYPICAL_PPE ordering is correct', () => {
    expect(TYPICAL_PPE.low).toBeLessThan(TYPICAL_PPE.median)
    expect(TYPICAL_PPE.median).toBeLessThan(TYPICAL_PPE.high)
  })
  it('IDEAL_STUDENT_TEACHER_RATIO is a positive number', () => {
    expect(IDEAL_STUDENT_TEACHER_RATIO).toBeGreaterThan(0)
  })
})
