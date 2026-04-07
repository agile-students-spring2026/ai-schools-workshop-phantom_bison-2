import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { DistrictAssessment } from '../../types/district'
import { NATIONAL_AVG_PROFICIENCY } from '../../utils/constants'

interface ProficiencyChartProps {
  assessments: DistrictAssessment[]
}

export function formatPctTick(v: number): string {
  return `${v}%`
}

export function formatAllGradeTooltip(value: number | string): [string, string] {
  const n = typeof value === 'number' ? value : parseFloat(value)
  return [`${n.toFixed(1)}%`, 'Proficiency']
}

export function formatGradeTooltip(value: number | string | null | undefined): [string, string] {
  if (value == null) return ['N/A', '']
  const n = typeof value === 'number' ? value : parseFloat(value as string)
  return [Number.isNaN(n) ? 'N/A' : `${n.toFixed(1)}%`, '']
}

export function ProficiencyChart({ assessments }: ProficiencyChartProps) {
  const mathByGrade = assessments
    .filter(a => a.subject === 'math' && a.pct_prof_midpt != null && a.grade !== 'all')
    .sort((a, b) => Number(a.grade) - Number(b.grade))

  const readingByGrade = assessments
    .filter(a => a.subject === 'rla' && a.pct_prof_midpt != null && a.grade !== 'all')
    .sort((a, b) => Number(a.grade) - Number(b.grade))

  const grades = [...new Set([
    ...mathByGrade.map(a => String(a.grade)),
    ...readingByGrade.map(a => String(a.grade)),
  ])].sort((a, b) => Number(a) - Number(b))

  if (grades.length === 0) {
    const allMath = assessments.find(a => a.subject === 'math' && a.pct_prof_midpt != null)
    const allReading = assessments.find(a => a.subject === 'rla' && a.pct_prof_midpt != null)

    if (!allMath && !allReading) {
      return (
        <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
          No assessment data available
        </div>
      )
    }

    const data = [
      { subject: 'Math', proficiency: allMath?.pct_prof_midpt ?? 0, national: NATIONAL_AVG_PROFICIENCY.math },
      { subject: 'Reading', proficiency: allReading?.pct_prof_midpt ?? 0, national: NATIONAL_AVG_PROFICIENCY.reading },
    ]

    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickFormatter={formatPctTick} tick={{ fontSize: 12 }} />
          <Tooltip formatter={formatAllGradeTooltip as (v: unknown) => [string, string]} />
          <Legend />
          <Bar dataKey="proficiency" name="District" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="national" name="National Avg" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const data = grades.map(grade => {
    const math = mathByGrade.find(a => String(a.grade) === grade)
    const reading = readingByGrade.find(a => String(a.grade) === grade)
    return {
      grade: `Grade ${grade}`,
      math: math?.pct_prof_midpt ?? null,
      reading: reading?.pct_prof_midpt ?? null,
    }
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tickFormatter={formatPctTick} tick={{ fontSize: 12 }} />
        <Tooltip formatter={formatGradeTooltip as (v: unknown) => [string, string]} />
        <Legend />
        <ReferenceLine y={NATIONAL_AVG_PROFICIENCY.math} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Natl Avg', position: 'right', fontSize: 10 }} />
        <Bar dataKey="math" name="Math" fill="#6366f1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="reading" name="Reading" fill="#22d3ee" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
