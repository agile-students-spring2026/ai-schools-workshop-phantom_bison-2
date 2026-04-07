import type { CompositeScore } from '../../types/district'

interface ScoreCardProps {
  score: CompositeScore
  size?: 'sm' | 'md' | 'lg'
  showBreakdown?: boolean
}

const gradeColors = {
  A: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', bar: 'bg-emerald-500' },
  B: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', bar: 'bg-blue-500' },
  C: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', bar: 'bg-yellow-500' },
  D: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', bar: 'bg-orange-500' },
  F: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', bar: 'bg-red-500' },
}

const sizeDimensions = {
  sm: 'w-12 h-12 text-xl',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-24 h-24 text-4xl',
}

const dimensionLabels = [
  { key: 'academics' as const, label: 'Academics' },
  { key: 'funding' as const, label: 'Funding' },
  { key: 'environment' as const, label: 'Environment' },
  { key: 'equity' as const, label: 'Equity' },
]

function getDimensionColors(score: number) {
  if (score >= 90) return gradeColors.A
  if (score >= 80) return gradeColors.B
  if (score >= 70) return gradeColors.C
  if (score >= 60) return gradeColors.D
  return gradeColors.F
}

export function ScoreCard({ score, size = 'md', showBreakdown = false }: ScoreCardProps) {
  const colors = gradeColors[score.grade]

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeDimensions[size]} ${colors.bg} ${colors.border} border-2 rounded-xl flex items-center justify-center font-bold ${colors.text}`}
        aria-label={`Overall grade: ${score.grade}`}
      >
        {score.grade}
      </div>
      <div className="text-xs text-slate-500 font-medium">Score: {score.overall}/100</div>

      {showBreakdown && (
        <div className="w-full space-y-2 mt-1">
          {dimensionLabels.map(({ key, label }) => {
            const dimScore = score[key]
            const dimColors = getDimensionColors(dimScore)
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">{label}</span>
                  <span className={`font-semibold ${dimColors.text}`}>{dimScore}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${dimColors.bar} rounded-full transition-all duration-500`}
                    style={{ width: `${dimScore}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
