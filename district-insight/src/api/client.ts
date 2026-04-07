import type { ApiResponse } from '../types/district'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new ApiError(response.status, `API request failed: ${response.statusText}`)
  }
  const data = await response.json()
  return data as ApiResponse<T>
}

export async function fetchAllPages<T>(url: string): Promise<T[]> {
  const results: T[] = []
  let nextUrl: string | null = url

  while (nextUrl) {
    const page: ApiResponse<T> = await fetchApi<T>(nextUrl)
    results.push(...page.results)
    nextUrl = page.next
  }

  return results
}

export async function fetchFirstResult<T>(url: string): Promise<T | null> {
  const data = await fetchApi<T>(url)
  return data.results.length > 0 ? data.results[0] : null
}
