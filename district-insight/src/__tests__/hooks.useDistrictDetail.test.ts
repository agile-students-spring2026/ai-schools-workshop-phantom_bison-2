import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDistrictDetail, clearDistrictDetailCache } from '../hooks/useDistrictDetail'

const mockDir = {
  leaid: 'DETAIL_TEST_001',
  lea_name: 'Test USD',
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

function makeOkResponse(results: unknown[] = []) {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({ count: results.length, next: null, previous: null, results }),
  } as Response
}

beforeEach(() => { clearDistrictDetailCache() })
afterEach(() => { vi.restoreAllMocks() })

describe('useDistrictDetail', () => {
  it('returns null state when leaid is null', () => {
    const { result } = renderHook(() => useDistrictDetail(null))
    expect(result.current.detail).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches detail when leaid is provided', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(makeOkResponse([{ ...mockDir, leaid: 'DETAIL_TEST_001' }]))
      .mockResolvedValueOnce(makeOkResponse([]))
      .mockResolvedValueOnce(makeOkResponse([]))
      .mockResolvedValueOnce(makeOkResponse([]))
      .mockResolvedValueOnce(makeOkResponse([]))

    const { result } = renderHook(() => useDistrictDetail('DETAIL_TEST_001'))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.detail).not.toBeNull()
    expect(result.current.detail!.directory.lea_name).toBe('Test USD')
    expect(result.current.error).toBeNull()
  })

  it('handles missing directory (throws error)', async () => {
    vi.spyOn(global, 'fetch')
      .mockResolvedValue(makeOkResponse([]))

    const { result } = renderHook(() => useDistrictDetail('DETAIL_NOTFOUND_999'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeTruthy()
  })

  it('handles fetch error', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useDistrictDetail('DETAIL_NETWORK_ERR_999'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Network error')
  })
})
