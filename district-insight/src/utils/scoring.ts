import type { CompositeScore, DistrictDetail } from '../types/district'
import {
  GRADE_THRESHOLDS,
  SCORE_WEIGHTS,
  NATIONAL_AVG_PROFICIENCY,
  TYPICAL_PPE,
  IDEAL_STUDENT_TEACHER_RATIO,
} from './constants'

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value))
}

function scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= GRADE_THRESHOLDS.A) return 'A'
  if (score >= GRADE_THRESHOLDS.B) return 'B'
  if (score >= GRADE_THRESHOLDS.C) return 'C'
  if (score >= GRADE_THRESHOLDS.D) return 'D'
  return 'F'
}

function scoreAcademics(detail: DistrictDetail): number {
  const assessments = detail.assessments.filter(
    a => a.pct_prof_midpt != null && (a.subject === 'math' || a.subject === 'rla')
  )

  if (assessments.length === 0) return 50

  const mathAssessments = assessments.filter(a => a.subject === 'math')
  const readingAssessments = assessments.filter(a => a.subject === 'rla')

  const avgMath =
    mathAssessments.length > 0
      ? mathAssessments.reduce((sum, a) => sum + (a.pct_prof_midpt ?? 0), 0) /
        mathAssessments.length
      : NATIONAL_AVG_PROFICIENCY.math

  const avgReading =
    readingAssessments.length > 0
      ? readingAssessments.reduce((sum, a) => sum + (a.pct_prof_midpt ?? 0), 0) /
        readingAssessments.length
      : NATIONAL_AVG_PROFICIENCY.reading

  const mathScore = clamp(((avgMath - NATIONAL_AVG_PROFICIENCY.math) / 50) * 50 + 65)
  const readingScore = clamp(((avgReading - NATIONAL_AVG_PROFICIENCY.reading) / 50) * 50 + 65)

  return (mathScore + readingScore) / 2
}

function scoreFunding(detail: DistrictDetail): number {
  const finance = detail.finance
  if (!finance) return 50

  const ppe = finance.exp_total_ppe ?? finance.exp_total
  if (!ppe) return 50

  const enrollment = finance.enrollment ?? detail.directory.enrollment ?? 1
  const ppeValue = finance.exp_total_ppe ?? (enrollment > 0 ? (finance.exp_total ?? 0) / enrollment : 0)

  if (ppeValue <= 0) return 50

  const ppeScore = clamp(
    ((ppeValue - TYPICAL_PPE.low) / (TYPICAL_PPE.high - TYPICAL_PPE.low)) * 80 + 20
  )

  const revTotal = finance.rev_total
  let diversityScore = 60
  if (revTotal && revTotal > 0) {
    const fedPct = ((finance.rev_fed_total ?? 0) / revTotal) * 100
    const statePct = ((finance.rev_state_total ?? 0) / revTotal) * 100
    const localPct = ((finance.rev_local_total ?? 0) / revTotal) * 100
    const maxPct = Math.max(fedPct, statePct, localPct)
    diversityScore = clamp(100 - maxPct)
  }

  return (ppeScore * 0.7 + diversityScore * 0.3)
}

function scoreEnvironment(detail: DistrictDetail): number {
  const dir = detail.directory
  const enrollment = dir.enrollment
  const teachers = dir.teachers_fte

  if (!enrollment || !teachers || teachers === 0) return 60

  const ratio = enrollment / teachers
  const ratioScore = clamp(
    100 - ((ratio - IDEAL_STUDENT_TEACHER_RATIO) / IDEAL_STUDENT_TEACHER_RATIO) * 50
  )

  return ratioScore
}

function scoreEquity(detail: DistrictDetail): number {
  const saipe = detail.saipe
  const assessments = detail.assessments.filter(a => a.pct_prof_midpt != null)

  let povertyScore = 70
  if (saipe?.saipe_pov_rate_5_17 != null) {
    povertyScore = clamp(100 - saipe.saipe_pov_rate_5_17 * 2)
  }

  let spreadScore = 70
  if (assessments.length > 1) {
    const profValues = assessments.map(a => a.pct_prof_midpt ?? 0)
    const min = Math.min(...profValues)
    const max = Math.max(...profValues)
    const spread = max - min
    spreadScore = clamp(100 - spread)
  }

  return povertyScore * 0.5 + spreadScore * 0.5
}

export function computeCompositeScore(detail: DistrictDetail): CompositeScore {
  const academics = scoreAcademics(detail)
  const funding = scoreFunding(detail)
  const environment = scoreEnvironment(detail)
  const equity = scoreEquity(detail)

  const overall =
    academics * SCORE_WEIGHTS.academics +
    funding * SCORE_WEIGHTS.funding +
    environment * SCORE_WEIGHTS.environment +
    equity * SCORE_WEIGHTS.equity

  return {
    overall: Math.round(overall),
    grade: scoreToGrade(overall),
    academics: Math.round(academics),
    funding: Math.round(funding),
    environment: Math.round(environment),
    equity: Math.round(equity),
  }
}

export { scoreToGrade, clamp }
