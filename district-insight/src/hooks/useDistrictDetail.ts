import { useState, useEffect } from 'react'
import type {
  DistrictDetail,
  DistrictDirectory,
  DistrictFinance,
  DistrictAssessment,
  DistrictSAIPE,
  EnrollmentByRace,
} from '../types/district'
import { fetchAllPages, fetchFirstResult } from '../api/client'
import { Endpoints } from '../api/endpoints'
import { DATA_YEAR, FINANCE_YEAR, SAIPE_YEAR } from '../utils/constants'

interface UseDistrictDetailResult {
  detail: DistrictDetail | null
  loading: boolean
  error: string | null
}

const detailCache = new Map<string, DistrictDetail>()

export function clearDistrictDetailCache() {
  detailCache.clear()
}

export function useDistrictDetail(leaid: string | null): UseDistrictDetailResult {
  const [detail, setDetail] = useState<DistrictDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!leaid) {
      setDetail(null)
      setLoading(false)
      setError(null)
      return
    }

    if (detailCache.has(leaid)) {
      setDetail(detailCache.get(leaid)!)
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    Promise.all([
      fetchFirstResult<DistrictDirectory>(Endpoints.districtDirectoryById(leaid, DATA_YEAR)),
      fetchFirstResult<DistrictFinance>(Endpoints.districtFinance(leaid, FINANCE_YEAR)),
      fetchAllPages<DistrictAssessment>(Endpoints.districtAssessments(leaid, DATA_YEAR)),
      fetchFirstResult<DistrictSAIPE>(Endpoints.districtSAIPE(leaid, SAIPE_YEAR)),
      fetchAllPages<EnrollmentByRace>(Endpoints.districtEnrollmentByRace(leaid, DATA_YEAR)),
    ])
      .then(([directory, finance, assessments, saipe, enrollmentByRace]) => {
        if (!directory) {
          throw new Error('District not found')
        }
        const result: DistrictDetail = {
          directory,
          finance,
          assessments,
          saipe,
          enrollmentByRace,
        }
        detailCache.set(leaid, result)
        setDetail(result)
        setLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load district details')
        setLoading(false)
      })
  }, [leaid])

  return { detail, loading, error }
}
