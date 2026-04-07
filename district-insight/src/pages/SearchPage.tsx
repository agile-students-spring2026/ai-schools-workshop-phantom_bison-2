import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDistricts } from '../hooks/useDistricts'
import { useCompare } from '../hooks/useCompare'
import { computeCompositeScore } from '../utils/scoring'
import { FilterPanel } from '../components/ui/FilterPanel'
import { SearchBar } from '../components/ui/SearchBar'
import { DistrictCard } from '../components/ui/DistrictCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Link } from 'react-router-dom'
import type { DistrictDirectory } from '../types/district'

const PAGE_SIZE = 20

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialFips = searchParams.get('fips') ? Number(searchParams.get('fips')) : null

  const [selectedFips, setSelectedFips] = useState<number | null>(initialFips)
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'enrollment' | 'score'>('name')
  const [page, setPage] = useState(1)

  const { districts, loading, error } = useDistricts(selectedFips)
  const { selectedIds, addDistrict, removeDistrict, isSelected, isFull } = useCompare()

  const handleStateChange = (fips: number | null) => {
    setSelectedFips(fips)
    setPage(1)
    if (fips) {
      setSearchParams({ fips: String(fips) })
    } else {
      setSearchParams({})
    }
  }

  const scoreMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeCompositeScore>>()
    if (sortBy === 'score') {
      districts.forEach(d => {
        map.set(d.leaid, computeCompositeScore({
          directory: d,
          finance: null,
          assessments: [],
          saipe: null,
          enrollmentByRace: [],
        }))
      })
    }
    return map
  }, [districts, sortBy])

  const filtered = useMemo(() => {
    let result = [...districts]

    if (searchText) {
      const lower = searchText.toLowerCase()
      result = result.filter(
        d =>
          d.lea_name.toLowerCase().includes(lower) ||
          d.city_location?.toLowerCase().includes(lower)
      )
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.lea_name.localeCompare(b.lea_name))
    } else if (sortBy === 'enrollment') {
      result.sort((a, b) => (b.enrollment ?? 0) - (a.enrollment ?? 0))
    } else {
      result.sort((a, b) => {
        const sa = scoreMap.get(a.leaid)?.overall ?? 0
        const sb = scoreMap.get(b.leaid)?.overall ?? 0
        return sb - sa
      })
    }

    return result
  }, [districts, searchText, sortBy, scoreMap])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated: DistrictDirectory[] = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Find School Districts</h1>
        <p className="text-slate-500 mt-2">
          Select a state to browse and compare school districts.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <FilterPanel
          selectedFips={selectedFips}
          onStateChange={handleStateChange}
          sortBy={sortBy}
          onSortChange={val => { setSortBy(val); setPage(1) }}
        />

        {districts.length > 0 && (
          <SearchBar
            value={searchText}
            onChange={val => { setSearchText(val); setPage(1) }}
            onClear={() => { setSearchText(''); setPage(1) }}
            placeholder="Filter by district or city name..."
          />
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-4 p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
          <span className="text-sm text-indigo-700 font-medium">
            {selectedIds.length} district{selectedIds.length > 1 ? 's' : ''} selected for comparison
          </span>
          <Link
            to={`/compare?ids=${selectedIds.join(',')}`}
            className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Compare Now →
          </Link>
        </div>
      )}

      {loading && <LoadingSpinner message="Loading districts..." />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && !selectedFips && (
        <div className="text-center py-20 text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-lg font-medium text-slate-500">Select a state to get started</p>
        </div>
      )}

      {!loading && !error && selectedFips && filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No districts found matching &ldquo;{searchText}&rdquo;</p>
        </div>
      )}

      {paginated.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-4">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of{' '}
            {filtered.length} districts
          </p>
          <div className="space-y-3">
            {paginated.map(district => (
              <DistrictCard
                key={district.leaid}
                district={district}
                score={scoreMap.get(district.leaid)}
                onCompareAdd={addDistrict}
                onCompareRemove={removeDistrict}
                isInCompare={isSelected(district.leaid)}
                compareDisabled={isFull}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
