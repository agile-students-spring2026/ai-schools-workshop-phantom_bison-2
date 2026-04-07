export interface DistrictDirectory {
  leaid: string
  lea_name: string
  state_name: string
  state_abbr: string
  fips: number
  city_location: string
  zip_location: string
  phone: string | null
  website: string | null
  enrollment: number | null
  teachers_fte: number | null
  locale: number | null
  locale_label?: string
  latitude: number | null
  longitude: number | null
  year: number
}

export interface EnrollmentByRace {
  leaid: string
  race: number
  race_label: string
  enrollment: number | null
  year: number
}

export interface DistrictFinance {
  leaid: string
  rev_total: number | null
  rev_fed_total: number | null
  rev_state_total: number | null
  rev_local_total: number | null
  exp_total: number | null
  exp_current_instruction_total: number | null
  salaries_instruction: number | null
  enrollment: number | null
  exp_total_ppe: number | null
  year: number
}

export interface DistrictAssessment {
  leaid: string
  subject: string
  grade: number | string
  pct_prof_low: number | null
  pct_prof_high: number | null
  pct_prof_midpt: number | null
  year: number
}

export interface DistrictSAIPE {
  leaid: string
  saipe_pov_rate_5_17: number | null
  saipe_median_hh_inc: number | null
  year: number
}

export interface DistrictDetail {
  directory: DistrictDirectory
  finance: DistrictFinance | null
  assessments: DistrictAssessment[]
  saipe: DistrictSAIPE | null
  enrollmentByRace: EnrollmentByRace[]
}

export interface CompositeScore {
  overall: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  academics: number
  funding: number
  environment: number
  equity: number
}

export interface ApiResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
