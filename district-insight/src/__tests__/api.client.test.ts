import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchApi, fetchAllPages, fetchFirstResult, ApiError } from '../api/client'

const mockResponse = (data: unknown, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    statusText: ok ? 'OK' : 'Not Found',
    json: () => Promise.resolve(data),
  } as Response)

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('ApiError', () => {
  it('constructs with status and message', () => {
    const err = new ApiError(404, 'Not found')
    expect(err.status).toBe(404)
    expect(err.message).toBe('Not found')
    expect(err.name).toBe('ApiError')
  })
})

describe('fetchApi', () => {
  it('returns parsed data on success', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      mockResponse({ count: 1, next: null, previous: null, results: [{ id: 1 }] })
    )
    const result = await fetchApi<{ id: number }>('http://example.com/api')
    expect(result.count).toBe(1)
    expect(result.results).toHaveLength(1)
  })

  it('throws ApiError on non-ok response', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      mockResponse({}, false, 404)
    )
    await expect(fetchApi('http://example.com/api')).rejects.toThrow(ApiError)
  })
})

describe('fetchAllPages', () => {
  it('fetches single page with no next', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      mockResponse({ count: 2, next: null, previous: null, results: [{ id: 1 }, { id: 2 }] })
    )
    const results = await fetchAllPages<{ id: number }>('http://example.com/api')
    expect(results).toHaveLength(2)
  })

  it('follows next page links', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      .mockImplementationOnce(() =>
        mockResponse({ count: 3, next: 'http://example.com/api?page=2', previous: null, results: [{ id: 1 }] })
      )
      .mockImplementationOnce(() =>
        mockResponse({ count: 3, next: null, previous: null, results: [{ id: 2 }, { id: 3 }] })
      )
    const results = await fetchAllPages<{ id: number }>('http://example.com/api')
    expect(results).toHaveLength(3)
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})

describe('fetchFirstResult', () => {
  it('returns first result when available', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      mockResponse({ count: 1, next: null, previous: null, results: [{ id: 42 }] })
    )
    const result = await fetchFirstResult<{ id: number }>('http://example.com/api')
    expect(result).toEqual({ id: 42 })
  })

  it('returns null when results are empty', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(() =>
      mockResponse({ count: 0, next: null, previous: null, results: [] })
    )
    const result = await fetchFirstResult<{ id: number }>('http://example.com/api')
    expect(result).toBeNull()
  })
})
