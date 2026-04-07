import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDistrictDetail } from '../hooks/useDistrictDetail'
import { useCompare } from '../hooks/useCompare'
import { computeCompositeScore } from '../utils/scoring'
import { ComparisonGrid } from '../components/ui/ComparisonGrid'
import { FilterPanel } from '../components/ui/FilterPanel'
import { SearchBar } from '../components/ui/SearchBar'
import { DistrictCard } from '../components/ui/DistrictCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useDistricts } from '../hooks/useDistricts'
import type { DistrictDetail, CompositeScore } from '../types/district'

interface CompareEntry {
  detail: DistrictDetail
  score: CompositeScore
}

function DistrictLoader({
  leaid,
  onLoad,
}: {
  leaid: string
  onLoad: (entry: CompareEntry) => void
}) {
  const { detail, loading } = useDistrictDetail(leaid)

  useEffect(() => {
    if (detail) {
      onLoad({ detail, score: computeCompositeScore(detail) })
    }
  }, [detail, onLoad])

  if (loading) return <LoadingSpinner size="sm" />
  return null
}

export function ComparePage() {
  const [searchParams] = useSearchParams()
  const initialIds = searchParams.get('ids')?.split(',').filter(Boolean) ?? []

  const { selectedIds, addDistrict, removeDistrict, clearAll, isSelected, isFull } = useCompare()
  const [entries, setEntries] = useState<CompareEntry[]>([])
  const [searchFips, setSearchFips] = useState<number | null>(null)
  const [searchText, setSearchText] = useState('')

  const { districts: searchDistricts, loading: searchLoading } = useDistricts(searchFips)

  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!initialized) {
      initialIds.forEach(id => addDistrict(id))
      setInitialized(true)
    }
  }, [initialized, initialIds, addDistrict])

  const handleLoad = (entry: CompareEntry) => {
    setEntries(prev => {
      if (prev.find(e => e.detail.directory.leaid === entry.detail.directory.leaid)) return prev
      return [...prev, entry]
    })
  }

  const handleRemove = (leaid: string) => {
    removeDistrict(leaid)
    setEntries(prev => prev.filter(e => e.detail.directory.leaid !== leaid))
  }

  const orderedEntries = selectedIds
    .map(id => entries.find(e => e.detail.directory.leaid === id))
    .filter((e): e is CompareEntry => !!e)

  const filteredSearch = searchDistricts
    .filter(d => {
      if (!searchText) return true
      const lower = searchText.toLowerCase()
      return d.lea_name.toLowerCase().includes(lower) || d.city_location?.toLowerCase().includes(lower)
    })
    .slice(0, 10)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Compare Districts</h1>
        <p className="text-slate-500 mt-2">
          Select up to 3 districts to compare side-by-side across all key metrics.
        </p>
      </div>

      {/* Add districts panel */}
      {!isFull && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Add a District</h2>
          <div className="space-y-3">
            <FilterPanel
              selectedFips={searchFips}
              onStateChange={setSearchFips}
              sortBy="name"
              onSortChange={() => {}}
            />
            {searchFips && (
              <SearchBar
                value={searchText}
                onChange={setSearchText}
                onClear={() => setSearchText('')}
                placeholder="Search by district or city name..."
              />
            )}
          </div>

          {searchLoading && <LoadingSpinner size="sm" message="Loading districts..." />}

          {filteredSearch.length > 0 && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {filteredSearch.map(d => (
                <DistrictCard
                  key={d.leaid}
                  district={d}
                  onCompareAdd={addDistrict}
                  onCompareRemove={removeDistrict}
                  isInCompare={isSelected(d.leaid)}
                  compareDisabled={isFull}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Load data for selected districts */}
      {selectedIds.map(id => (
        <DistrictLoader key={id} leaid={id} onLoad={handleLoad} />
      ))}

      {selectedIds.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          <p className="text-lg font-medium text-slate-500">
            Add districts above to start comparing
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Comparison</h2>
            <button
              onClick={() => { clearAll(); setEntries([]) }}
              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          {orderedEntries.length < selectedIds.length ? (
            <LoadingSpinner message="Loading district data..." />
          ) : (
            <ComparisonGrid entries={orderedEntries} onRemove={handleRemove} />
          )}
        </div>
      )}
    </div>
  )
}
