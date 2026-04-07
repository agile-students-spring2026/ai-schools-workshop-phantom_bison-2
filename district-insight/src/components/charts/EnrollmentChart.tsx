import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { EnrollmentByRace } from '../../types/district'

interface EnrollmentChartProps {
  enrollmentByRace: EnrollmentByRace[]
}

const COLORS = [
  '#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e',
  '#8b5cf6', '#ec4899', '#14b8a6',
]

export function formatEnrollmentTooltip(
  value: number,
  _: string,
  props: { payload?: { pct?: string } }
): [string, string] {
  return [`${value.toLocaleString()} (${props.payload?.pct ?? ''}%)`, 'Students']
}

export function EnrollmentChart({ enrollmentByRace }: EnrollmentChartProps) {
  const filtered = enrollmentByRace
    .filter(e => e.race !== 9 && e.race !== 99 && e.enrollment != null && e.enrollment > 0)
    .sort((a, b) => (b.enrollment ?? 0) - (a.enrollment ?? 0))

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        No enrollment breakdown available
      </div>
    )
  }

  const total = filtered.reduce((sum, e) => sum + (e.enrollment ?? 0), 0)
  const data = filtered.map(e => ({
    name: e.race_label?.replace(' or ', '/').replace('American', 'Am.').replace('Native', 'Nat.') ?? `Race ${e.race}`,
    enrollment: e.enrollment ?? 0,
    pct: total > 0 ? (((e.enrollment ?? 0) / total) * 100).toFixed(1) : '0',
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 50, left: 110, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={105} />
        <Tooltip formatter={formatEnrollmentTooltip as (v: unknown) => [string, string]} />
        <Bar dataKey="enrollment" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
