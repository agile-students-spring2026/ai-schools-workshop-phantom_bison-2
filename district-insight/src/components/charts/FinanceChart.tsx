import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { DistrictFinance } from '../../types/district'
import { formatCurrency } from '../../utils/formatting'

interface FinanceChartProps {
  finance: DistrictFinance
}

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b']

export function makeFinanceTooltipFormatter(total: number) {
  return (value: number): [string, string] => [
    `${formatCurrency(value, true)} (${((value / total) * 100).toFixed(1)}%)`,
    '',
  ]
}

export function FinanceChart({ finance }: FinanceChartProps) {
  const federal = finance.rev_fed_total ?? 0
  const state = finance.rev_state_total ?? 0
  const local = finance.rev_local_total ?? 0
  const total = federal + state + local

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        No revenue data available
      </div>
    )
  }

  const data = [
    { name: 'Federal', value: federal },
    { name: 'State', value: state },
    { name: 'Local', value: local },
  ].filter(d => d.value > 0)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={makeFinanceTooltipFormatter(total) as (v: unknown) => [string, string]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
