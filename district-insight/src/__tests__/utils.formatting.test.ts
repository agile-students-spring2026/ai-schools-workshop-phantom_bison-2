import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRatio,
  formatStudentTeacherRatio,
} from '../utils/formatting'

describe('formatCurrency', () => {
  it('returns N/A for null', () => {
    expect(formatCurrency(null)).toBe('N/A')
  })
  it('returns N/A for undefined', () => {
    expect(formatCurrency(undefined)).toBe('N/A')
  })
  it('formats regular amount', () => {
    expect(formatCurrency(12345)).toMatch(/\$12,345/)
  })
  it('formats compact millions', () => {
    expect(formatCurrency(2_500_000, true)).toBe('$2.5M')
  })
  it('formats compact thousands', () => {
    expect(formatCurrency(15_000, true)).toBe('$15K')
  })
  it('formats small compact value as dollar', () => {
    expect(formatCurrency(500, true)).toMatch(/\$500/)
  })
})

describe('formatNumber', () => {
  it('returns N/A for null', () => {
    expect(formatNumber(null)).toBe('N/A')
  })
  it('returns N/A for undefined', () => {
    expect(formatNumber(undefined)).toBe('N/A')
  })
  it('formats with commas', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })
  it('rounds decimals', () => {
    expect(formatNumber(100.7)).toBe('101')
  })
})

describe('formatPercent', () => {
  it('returns N/A for null', () => {
    expect(formatPercent(null)).toBe('N/A')
  })
  it('returns N/A for undefined', () => {
    expect(formatPercent(undefined)).toBe('N/A')
  })
  it('formats with default decimals', () => {
    expect(formatPercent(45.6789)).toBe('45.7%')
  })
  it('formats with custom decimals', () => {
    expect(formatPercent(45.6789, 0)).toBe('46%')
  })
})

describe('formatRatio', () => {
  it('returns N/A for null numerator', () => {
    expect(formatRatio(null, 100)).toBe('N/A')
  })
  it('returns N/A for null denominator', () => {
    expect(formatRatio(5, null)).toBe('N/A')
  })
  it('returns N/A for zero denominator', () => {
    expect(formatRatio(5, 0)).toBe('N/A')
  })
  it('formats ratio', () => {
    expect(formatRatio(1, 20)).toBe('1:20')
  })
})

describe('formatStudentTeacherRatio', () => {
  it('returns N/A for null enrollment', () => {
    expect(formatStudentTeacherRatio(null, 10)).toBe('N/A')
  })
  it('returns N/A for null teachers', () => {
    expect(formatStudentTeacherRatio(100, null)).toBe('N/A')
  })
  it('returns N/A for zero teachers', () => {
    expect(formatStudentTeacherRatio(100, 0)).toBe('N/A')
  })
  it('formats ratio', () => {
    expect(formatStudentTeacherRatio(300, 15)).toBe('20.0:1')
  })
})
