import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDistricts } from '../hooks/useDistricts'
import { FilterPanel } from '../components/ui/FilterPanel'
import { SearchBar } from '../components/ui/SearchBar'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Link } from 'react-router-dom'
import { formatNumber, formatStudentTeacherRatio } from '../utils/formatting'
import { LOCALE_LABELS } from '../utils/constants'
import type { DistrictDirectory } from '../types/district'

const PAGE_SIZE = 20

export function ForTeachersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialFips = searchParams.get('fips') ? Number(searchParams.get('fips')) : null

  const [selectedFips, setSelectedFips] = useState<number | null>(initialFips)
  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(1)

  const { districts, loading, error } = useDistricts(selectedFips)

  const handleStateChange = (fips: number | null) => {
    setSelectedFips(fips)
    setPage(1)
    if (fips) {
      setSearchParams({ fips: String(fips) })
    } else {
      setSearchParams({})
    }
  }

  const sorted = useMemo(() => {
    let result = [...districts]

    if (searchText) {
      const lower = searchText.toLowerCase()
      result = result.filter(
        d =>
          d.lea_name.toLowerCase().includes(lower) ||
          d.city_location?.toLowerCase().includes(lower)
      )
    }

    result.sort((a, b) => (b.enrollment ?? 0) - (a.enrollment ?? 0))
    return result
  }, [districts, searchText])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated: DistrictDirectory[] = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-indigo-600 font-medium text-sm mb-3">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          </svg>
          For Educators
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Find Your Next Teaching Position</h1>
        <p className="text-slate-500 mt-2 max-w-xl">
          Explore school districts with the metrics that matter most to educators — class sizes,
          student-teacher ratios, district size, and more.
        </p>
      </div>

      {/* What to look for */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          {
            title: 'Student-Teacher Ratio',
            desc: 'Lower ratios mean smaller classes and more time for each student.',
            icon: '👩‍🏫',
          },
          {
            title: 'District Size',
            desc: 'Larger districts often have more resources; smaller ones offer more community.',
            icon: '🏫',
          },
          {
            title: 'Urban vs. Rural',
            desc: 'District locale affects community, cost of living, and school culture.',
            icon: '🗺️',
          },
        ].map(card => (
          <div key={card.title} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-2xl mb-2">{card.icon}</div>
            <h3 className="font-semibold text-slate-900 text-sm">{card.title}</h3>
            <p className="text-slate-500 text-xs mt-1">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        <FilterPanel
          selectedFips={selectedFips}
          onStateChange={handleStateChange}
          sortBy="enrollment"
          onSortChange={() => {}}
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

      {loading && <LoadingSpinner message="Loading districts..." />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && !selectedFips && (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg font-medium text-slate-500">Select a state to browse districts</p>
        </div>
      )}

      {!loading && !error && selectedFips && sorted.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No districts found matching &ldquo;{searchText}&rdquo;</p>
        </div>
      )}

      {paginated.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-4">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of{' '}
            {sorted.length} districts
          </p>
          <div className="space-y-3">
            {paginated.map(district => {
              const ratio = formatStudentTeacherRatio(district.enrollment, district.teachers_fte)
              const locale = district.locale ? LOCALE_LABELS[district.locale] : null

              return (
                <div
                  key={district.leaid}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/district/${district.leaid}`}
                        className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors"
                      >
                        {district.lea_name}
                      </Link>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {district.city_location}, {district.state_abbr}
                      </p>
                      {locale && (
                        <span className="inline-block mt-1.5 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {locale}
                        </span>
                      )}
                    </div>

                    <div className="shrink-0 flex gap-6 text-center">
                      <div>
                        <div className="text-lg font-bold text-slate-900">
                          {formatNumber(district.enrollment)}
                        </div>
                        <div className="text-xs text-slate-500">Students</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-indigo-600">{ratio}</div>
                        <div className="text-xs text-slate-500">Ratio</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-3">
                    <Link
                      to={`/district/${district.leaid}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                      View Full Profile →
                    </Link>
                  </div>
                </div>
              )
            })}
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
