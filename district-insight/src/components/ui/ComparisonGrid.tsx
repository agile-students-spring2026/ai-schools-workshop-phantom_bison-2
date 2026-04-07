import { Link } from 'react-router-dom'
import type { DistrictDetail, CompositeScore } from '../../types/district'
import { formatNumber, formatCurrency, formatStudentTeacherRatio, formatPercent } from '../../utils/formatting'

interface ComparisonEntry {
  detail: DistrictDetail
  score: CompositeScore
}

interface ComparisonGridProps {
  entries: ComparisonEntry[]
  onRemove: (leaid: string) => void
}

const gradeColors = {
  A: 'text-emerald-700 bg-emerald-100',
  B: 'text-blue-700 bg-blue-100',
  C: 'text-yellow-700 bg-yellow-100',
  D: 'text-orange-700 bg-orange-100',
  F: 'text-red-700 bg-red-100',
}

function getBestIndex(values: (number | null)[], higherIsBetter: boolean): number {
  const valid = values.map((v, i) => ({ v, i })).filter(x => x.v !== null)
  if (valid.length === 0) return -1
  return valid.reduce((best, cur) =>
    higherIsBetter ? (cur.v! > best.v! ? cur : best) : (cur.v! < best.v! ? cur : best)
  ).i
}

export function ComparisonGrid({ entries, onRemove }: ComparisonGridProps) {
  if (entries.length === 0) return null

  const enrollments = entries.map(e => e.detail.directory.enrollment)
  const ppes = entries.map(e => {
    const f = e.detail.finance
    if (!f) return null
    if (f.exp_total_ppe) return f.exp_total_ppe
    const enroll = f.enrollment ?? e.detail.directory.enrollment ?? 1
    return enroll > 0 ? (f.exp_total ?? 0) / enroll : null
  })
  const mathScores = entries.map(e => {
    const math = e.detail.assessments.filter(a => a.subject === 'math' && a.pct_prof_midpt != null)
    if (math.length === 0) return null
    return math.reduce((s, a) => s + (a.pct_prof_midpt ?? 0), 0) / math.length
  })
  const readingScores = entries.map(e => {
    const rla = e.detail.assessments.filter(a => a.subject === 'rla' && a.pct_prof_midpt != null)
    if (rla.length === 0) return null
    return rla.reduce((s, a) => s + (a.pct_prof_midpt ?? 0), 0) / rla.length
  })
  const overallScores = entries.map(e => e.score.overall)
  const povertyRates = entries.map(e => e.detail.saipe?.saipe_pov_rate_5_17 ?? null)

  const bestEnrollment = getBestIndex(enrollments, true)
  const bestPpe = getBestIndex(ppes, true)
  const bestMath = getBestIndex(mathScores, true)
  const bestReading = getBestIndex(readingScores, true)
  const bestOverall = getBestIndex(overallScores, true)
  const bestPoverty = getBestIndex(povertyRates, false)

  const rows = [
    {
      label: 'Overall Grade',
      render: (e: ComparisonEntry, i: number) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold ${gradeColors[e.score.grade]} ${i === bestOverall ? 'ring-2 ring-indigo-400' : ''}`}>
          {e.score.grade} ({e.score.overall})
        </span>
      ),
    },
    {
      label: 'Enrollment',
      render: (e: ComparisonEntry, i: number) => (
        <span className={i === bestEnrollment ? 'font-bold text-indigo-700' : ''}>
          {formatNumber(e.detail.directory.enrollment)}
        </span>
      ),
    },
    {
      label: 'Per-Pupil Spending',
      render: (_e: ComparisonEntry, i: number) => (
        <span className={i === bestPpe ? 'font-bold text-indigo-700' : ''}>
          {formatCurrency(ppes[i])}
        </span>
      ),
    },
    {
      label: 'Math Proficiency',
      render: (_e: ComparisonEntry, i: number) => (
        <span className={i === bestMath ? 'font-bold text-indigo-700' : ''}>
          {mathScores[i] != null ? formatPercent(mathScores[i]) : 'N/A'}
        </span>
      ),
    },
    {
      label: 'Reading Proficiency',
      render: (_e: ComparisonEntry, i: number) => (
        <span className={i === bestReading ? 'font-bold text-indigo-700' : ''}>
          {readingScores[i] != null ? formatPercent(readingScores[i]) : 'N/A'}
        </span>
      ),
    },
    {
      label: 'Student:Teacher Ratio',
      render: (e: ComparisonEntry) => (
        <span>
          {formatStudentTeacherRatio(e.detail.directory.enrollment, e.detail.directory.teachers_fte)}
        </span>
      ),
    },
    {
      label: 'Child Poverty Rate',
      render: (e: ComparisonEntry, i: number) => (
        <span className={i === bestPoverty ? 'font-bold text-indigo-700' : ''}>
          {formatPercent(e.detail.saipe?.saipe_pov_rate_5_17 ?? null)}
        </span>
      ),
    },
    {
      label: 'Academics Score',
      render: (e: ComparisonEntry) => <span>{e.score.academics}/100</span>,
    },
    {
      label: 'Funding Score',
      render: (e: ComparisonEntry) => <span>{e.score.funding}/100</span>,
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-sm font-semibold text-slate-600 pb-3 pr-4 w-40">Metric</th>
            {entries.map(e => (
              <th key={e.detail.directory.leaid} className="pb-3 px-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Link
                    to={`/district/${e.detail.directory.leaid}`}
                    className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 text-center"
                  >
                    {e.detail.directory.lea_name}
                  </Link>
                  <span className="text-xs text-slate-500">
                    {e.detail.directory.city_location}, {e.detail.directory.state_abbr}
                  </span>
                  <button
                    onClick={() => onRemove(e.detail.directory.leaid)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors mt-1"
                  >
                    Remove
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label} className="border-t border-slate-100">
              <td className="py-3 pr-4 text-sm text-slate-600 font-medium">{row.label}</td>
              {entries.map((e, i) => (
                <td key={e.detail.directory.leaid} className="py-3 px-4 text-center text-sm">
                  {row.render(e, i)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
