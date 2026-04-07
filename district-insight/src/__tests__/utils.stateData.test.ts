import { describe, it, expect } from 'vitest'
import { STATES, getStateByFips, getStateByAbbr, getStateByName } from '../utils/stateData'

describe('STATES', () => {
  it('has 51 entries (50 states + DC)', () => {
    expect(STATES.length).toBe(51)
  })
  it('contains California', () => {
    const ca = STATES.find(s => s.abbr === 'CA')
    expect(ca).toBeDefined()
    expect(ca!.fips).toBe(6)
    expect(ca!.name).toBe('California')
  })
})

describe('getStateByFips', () => {
  it('finds state by FIPS', () => {
    const tx = getStateByFips(48)
    expect(tx?.name).toBe('Texas')
  })
  it('returns undefined for unknown FIPS', () => {
    expect(getStateByFips(999)).toBeUndefined()
  })
})

describe('getStateByAbbr', () => {
  it('finds state by abbreviation (uppercase)', () => {
    const ny = getStateByAbbr('NY')
    expect(ny?.name).toBe('New York')
  })
  it('finds state by abbreviation (lowercase)', () => {
    const ny = getStateByAbbr('ny')
    expect(ny?.name).toBe('New York')
  })
  it('returns undefined for unknown abbreviation', () => {
    expect(getStateByAbbr('ZZ')).toBeUndefined()
  })
})

describe('getStateByName', () => {
  it('finds state by name', () => {
    const fl = getStateByName('Florida')
    expect(fl?.abbr).toBe('FL')
  })
  it('finds state by lowercase name', () => {
    const fl = getStateByName('florida')
    expect(fl?.abbr).toBe('FL')
  })
  it('returns undefined for unknown name', () => {
    expect(getStateByName('Neverland')).toBeUndefined()
  })
})
