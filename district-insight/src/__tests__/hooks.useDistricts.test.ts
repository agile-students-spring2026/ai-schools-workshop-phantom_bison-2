import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDistricts, clearDistrictsCache } from '../hooks/useDistricts'
import type { DistrictDirectory } from '../types/district'

const mockDistrict: DistrictDirectory = {
  leaid: '0600001',
  lea_name: 'Test USD',
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

beforeEach(() => { clearDistrictsCache() })
afterEach(() => { vi.restoreAllMocks() })

describe('useDistricts', () => {
  it('returns empty state when fips is null', () => {
    const { result } = renderHook(() => useDistricts(null))
    expect(result.current.districts).toHaveLength(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches districts when fips is provided', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ count: 1, next: null, previous: null, results: [mockDistrict] }),
    } as Response)

    // Use a unique fips (701) that won't be in the module-level cache
    const { result } = renderHook(() => useDistricts(701))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.districts).toHaveLength(1)
    expect(result.current.districts[0].lea_name).toBe('Test USD')
    expect(result.current.error).toBeNull()
  })

  it('handles fetch errors', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({}),
    } as Response)

    // Use a unique fips (702) that won't be in the module-level cache
    const { result } = renderHook(() => useDistricts(702))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeTruthy()
  })
})
