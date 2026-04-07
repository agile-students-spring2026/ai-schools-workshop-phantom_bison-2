interface MetricCardProps {
  label: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  highlight?: boolean
}

export function MetricCard({ label, value, subtitle, icon, highlight }: MetricCardProps) {
  return (
    <div
      className={`rounded-xl p-5 border ${
        highlight
          ? 'bg-indigo-50 border-indigo-200'
          : 'bg-white border-slate-200'
      }`}
    >
      {icon && (
        <div className="mb-3 text-indigo-600">{icon}</div>
      )}
      <div className={`text-2xl font-bold ${highlight ? 'text-indigo-700' : 'text-slate-900'}`}>
        {value}
      </div>
      <div className="text-sm font-medium text-slate-600 mt-1">{label}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
    </div>
  )
}
