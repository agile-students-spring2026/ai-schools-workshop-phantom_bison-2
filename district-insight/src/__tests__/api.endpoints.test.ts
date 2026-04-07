import { describe, it, expect } from 'vitest'
import { Endpoints } from '../api/endpoints'

describe('Endpoints', () => {
  it('districtDirectory without fips', () => {
    const url = Endpoints.districtDirectory(2022)
    expect(url).toContain('/school-districts/ccd/directory/2022/')
    expect(url).toContain('per_page=500')
    expect(url).not.toContain('fips=')
  })

  it('districtDirectory with fips', () => {
    const url = Endpoints.districtDirectory(2022, 6)
    expect(url).toContain('fips=6')
    expect(url).toContain('per_page=500')
  })

  it('districtDirectoryById', () => {
    const url = Endpoints.districtDirectoryById('0600001', 2022)
    expect(url).toContain('leaid=0600001')
    expect(url).toContain('/2022/')
  })

  it('districtEnrollmentByRace', () => {
    const url = Endpoints.districtEnrollmentByRace('0600001', 2022)
    expect(url).toContain('/enrollment/2022/race/')
    expect(url).toContain('leaid=0600001')
  })

  it('districtFinance', () => {
    const url = Endpoints.districtFinance('0600001', 2021)
    expect(url).toContain('/finance/2021/')
    expect(url).toContain('leaid=0600001')
  })

  it('districtAssessments', () => {
    const url = Endpoints.districtAssessments('0600001', 2022)
    expect(url).toContain('/edfacts/assessments/2022/')
    expect(url).toContain('leaid=0600001')
  })

  it('districtSAIPE', () => {
    const url = Endpoints.districtSAIPE('0600001', 2022)
    expect(url).toContain('/saipe/2022/')
    expect(url).toContain('leaid=0600001')
  })
})
