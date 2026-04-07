import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDistrictDetail } from '../hooks/useDistrictDetail'
import { computeCompositeScore } from '../utils/scoring'
import { ScoreCard } from '../components/ui/ScoreCard'
import { MetricCard } from '../components/ui/MetricCard'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { ProficiencyChart } from '../components/charts/ProficiencyChart'
import { FinanceChart } from '../components/charts/FinanceChart'
import { EnrollmentChart } from '../components/charts/EnrollmentChart'
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatStudentTeacherRatio,
} from '../utils/formatting'
import { LOCALE_LABELS } from '../utils/constants'

type Tab = 'academics' | 'funding' | 'demographics'

export function DistrictDetailPage() {
  const { leaid } = useParams<{ leaid: string }>()
  const { detail, loading, error } = useDistrictDetail(leaid ?? null)
  const [activeTab, setActiveTab] = useState<Tab>('academics')

  if (loading) return <LoadingSpinner message="Loading district details..." />
  if (error) return <ErrorMessage message={error} />
  if (!detail) return null

  const score = computeCompositeScore(detail)
  const dir = detail.directory
  const finance = detail.finance

  const ppe =
    finance?.exp_total_ppe ??
    (finance?.exp_total && finance.enrollment && finance.enrollment > 0
      ? finance.exp_total / finance.enrollment
      : null)

  const avgMath = (() => {
    const a = detail.assessments.filter(a => a.subject === 'math' && a.pct_prof_midpt != null)
    return a.length > 0 ? a.reduce((s, x) => s + (x.pct_prof_midpt ?? 0), 0) / a.length : null
  })()

  const avgReading = (() => {
    const a = detail.assessments.filter(a => a.subject === 'rla' && a.pct_prof_midpt != null)
    return a.length > 0 ? a.reduce((s, x) => s + (x.pct_prof_midpt ?? 0), 0) / a.length : null
  })()

  const tabs: { id: Tab; label: string }[] = [
    { id: 'academics', label: 'Academics' },
    { id: 'funding', label: 'Funding' },
    { id: 'demographics', label: 'Demographics' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/search" className="hover:text-indigo-600 transition-colors">
          Find Districts
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{dir.lea_name}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <ScoreCard score={score} size="lg" showBreakdown />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{dir.lea_name}</h1>
            <p className="text-slate-500 mt-1">
              {dir.city_location}, {dir.state_name}
            </p>
            {dir.locale && (
              <span className="inline-block mt-2 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                {LOCALE_LABELS[dir.locale] ?? `Locale ${dir.locale}`}
              </span>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <MetricCard
                label="Students"
                value={formatNumber(dir.enrollment)}
                highlight
              />
              <MetricCard
                label="Student:Teacher"
                value={formatStudentTeacherRatio(dir.enrollment, dir.teachers_fte)}
              />
              <MetricCard
                label="Per-Pupil Spending"
                value={formatCurrency(ppe, true)}
              />
              <MetricCard
                label="Poverty Rate"
                value={formatPercent(detail.saipe?.saipe_pov_rate_5_17 ?? null)}
                subtitle="Ages 5–17"
              />
            </div>

            <div className="flex gap-3 mt-5">
              <Link
                to={`/compare?ids=${dir.leaid}`}
                className="text-sm px-4 py-2 rounded-lg border border-indigo-300 text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
              >
                + Add to Compare
              </Link>
              {dir.website && (
                <a
                  href={dir.website.startsWith('http') ? dir.website : `https://${dir.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Visit Website ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Academics Tab */}
      {activeTab === 'academics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              label="Math Proficiency"
              value={formatPercent(avgMath)}
              subtitle="% of students at/above grade level"
              highlight
            />
            <MetricCard
              label="Reading Proficiency"
              value={formatPercent(avgReading)}
              subtitle="% of students at/above grade level"
              highlight
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">
              Proficiency by Grade & Subject
            </h3>
            <ProficiencyChart assessments={detail.assessments} />
            <p className="text-xs text-slate-400 mt-3 text-center">
              Source: EdFacts assessments data, AY 2022. Dashed line = national average.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Note:</strong> Assessment proficiency rates reflect the percentage of students
            who scored at or above the "proficient" level on state standardized tests. Standards
            vary by state.
          </div>
        </div>
      )}

      {/* Funding Tab */}
      {activeTab === 'funding' && (
        <div className="space-y-6">
          {finance ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricCard
                  label="Per-Pupil Expenditure"
                  value={formatCurrency(ppe)}
                  subtitle="Total spending per student"
                  highlight
                />
                <MetricCard
                  label="Total Revenue"
                  value={formatCurrency(finance.rev_total, true)}
                  subtitle="All sources combined"
                />
                <MetricCard
                  label="Instructional Spending"
                  value={
                    finance.exp_current_instruction_total && finance.exp_total
                      ? formatPercent(
                          (finance.exp_current_instruction_total / finance.exp_total) * 100
                        )
                      : 'N/A'
                  }
                  subtitle="% spent directly on instruction"
                />
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-4">Revenue Sources</h3>
                <FinanceChart finance={finance} />
                <p className="text-xs text-slate-400 mt-3 text-center">
                  Source: NCES CCD Finance data, FY 2021
                </p>
              </div>

              {finance.salaries_instruction && (
                <MetricCard
                  label="Instructional Salary Expenditure"
                  value={formatCurrency(finance.salaries_instruction, true)}
                  subtitle="Total paid to instructional staff"
                />
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p>Finance data not available for this district.</p>
            </div>
          )}
        </div>
      )}

      {/* Demographics Tab */}
      {activeTab === 'demographics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard
              label="Child Poverty Rate"
              value={formatPercent(detail.saipe?.saipe_pov_rate_5_17 ?? null)}
              subtitle="Ages 5–17 (Census SAIPE)"
              highlight
            />
            <MetricCard
              label="Median Household Income"
              value={formatCurrency(detail.saipe?.saipe_median_hh_inc ?? null)}
              subtitle="District area (Census SAIPE)"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">
              Enrollment by Race/Ethnicity
            </h3>
            <EnrollmentChart enrollmentByRace={detail.enrollmentByRace} />
            <p className="text-xs text-slate-400 mt-3 text-center">
              Source: NCES CCD Enrollment data, AY 2022
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
