import { useState, useEffect, useRef } from 'react'
import type { DistrictDirectory } from '../types/district'
import { fetchAllPages } from '../api/client'
import { Endpoints } from '../api/endpoints'
import { DATA_YEAR } from '../utils/constants'

interface UseDistrictsResult {
  districts: DistrictDirectory[]
  loading: boolean
  error: string | null
}

const cache = new Map<number, DistrictDirectory[]>()

export function clearDistrictsCache() {
  cache.clear()
}

export function useDistricts(fips: number | null): UseDistrictsResult {
  const [districts, setDistricts] = useState<DistrictDirectory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (fips === null) {
      setDistricts([])
      setLoading(false)
      setError(null)
      return
    }

    if (cache.has(fips)) {
      setDistricts(cache.get(fips)!)
      setLoading(false)
      setError(null)
      return
    }

    if (abortRef.current) {
      abortRef.current.abort()
    }
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    fetchAllPages<DistrictDirectory>(Endpoints.districtDirectory(DATA_YEAR, fips))
      .then(data => {
        cache.set(fips, data)
        setDistricts(data)
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Failed to load districts')
          setLoading(false)
        }
      })

    return () => {
      abortRef.current?.abort()
    }
  }, [fips])

  return { districts, loading, error }
}
