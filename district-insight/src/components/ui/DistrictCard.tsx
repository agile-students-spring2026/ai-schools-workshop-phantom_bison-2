import { Link } from 'react-router-dom'
import type { DistrictDirectory, CompositeScore } from '../../types/district'
import { formatNumber } from '../../utils/formatting'
import { LOCALE_LABELS } from '../../utils/constants'

interface DistrictCardProps {
  district: DistrictDirectory
  score?: CompositeScore
  onCompareAdd?: (leaid: string) => void
  onCompareRemove?: (leaid: string) => void
  isInCompare?: boolean
  compareDisabled?: boolean
}

const gradeColorMap = {
  A: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  B: 'bg-blue-100 text-blue-700 border-blue-300',
  C: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  D: 'bg-orange-100 text-orange-700 border-orange-300',
  F: 'bg-red-100 text-red-700 border-red-300',
}

export function DistrictCard({
  district,
  score,
  onCompareAdd,
  onCompareRemove,
  isInCompare,
  compareDisabled,
}: DistrictCardProps) {
  const localeLabel = district.locale ? LOCALE_LABELS[district.locale] : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            to={`/district/${district.leaid}`}
            className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2"
          >
            {district.lea_name}
          </Link>
          <p className="text-sm text-slate-500 mt-1">
            {district.city_location}, {district.state_abbr}
          </p>
          {localeLabel && (
            <span className="inline-block mt-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {localeLabel}
            </span>
          )}
        </div>

        {score && (
          <div
            className={`shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold ${gradeColorMap[score.grade]}`}
          >
            {score.grade}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">
            {formatNumber(district.enrollment)}
          </span>{' '}
          students
        </div>

        <div className="flex gap-2">
          {(onCompareAdd || onCompareRemove) && (
            <button
              onClick={() =>
                isInCompare
                  ? onCompareRemove?.(district.leaid)
                  : onCompareAdd?.(district.leaid)
              }
              disabled={!isInCompare && compareDisabled}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                isInCompare
                  ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'
                  : compareDisabled
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {isInCompare ? '✓ Comparing' : 'Compare'}
            </button>
          )}
          <Link
            to={`/district/${district.leaid}`}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
