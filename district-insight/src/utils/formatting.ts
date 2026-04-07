export function formatCurrency(value: number | null | undefined, compact = false): string {
  if (value == null) return 'N/A'
  if (compact && value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (compact && value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return 'N/A'
  return new Intl.NumberFormat('en-US').format(Math.round(value))
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value == null) return 'N/A'
  return `${value.toFixed(decimals)}%`
}

export function formatRatio(numerator: number | null, denominator: number | null): string {
  if (numerator == null || denominator == null || denominator === 0) return 'N/A'
  const ratio = denominator / numerator
  return `1:${ratio.toFixed(0)}`
}

export function formatStudentTeacherRatio(
  enrollment: number | null,
  teachers: number | null
): string {
  if (enrollment == null || teachers == null || teachers === 0) return 'N/A'
  const ratio = enrollment / teachers
  return `${ratio.toFixed(1)}:1`
}
