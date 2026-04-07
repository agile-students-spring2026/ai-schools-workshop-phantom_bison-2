export const DATA_YEAR = 2022
export const FINANCE_YEAR = 2021
export const SAIPE_YEAR = 2022

export const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
} as const

export const SCORE_WEIGHTS = {
  academics: 0.4,
  funding: 0.25,
  environment: 0.2,
  equity: 0.15,
} as const

export const LOCALE_LABELS: Record<number, string> = {
  11: 'City: Large',
  12: 'City: Mid-size',
  13: 'City: Small',
  21: 'Suburb: Large',
  22: 'Suburb: Mid-size',
  23: 'Suburb: Small',
  31: 'Town: Fringe',
  32: 'Town: Distant',
  33: 'Town: Remote',
  41: 'Rural: Fringe',
  42: 'Rural: Distant',
  43: 'Rural: Remote',
}

export const RACE_LABELS: Record<number, string> = {
  1: 'White',
  2: 'Black or African American',
  3: 'Hispanic',
  4: 'Asian',
  5: 'American Indian/Alaska Native',
  6: 'Native Hawaiian/Pacific Islander',
  7: 'Two or More Races',
  9: 'Total',
  20: 'White',
  21: 'Black',
  22: 'Hispanic',
  23: 'Asian/Pacific Islander',
  24: 'American Indian',
  25: 'Non-binary/Other',
  99: 'Total',
}

export const NATIONAL_AVG_PROFICIENCY = {
  math: 36,
  reading: 33,
}

export const TYPICAL_PPE = {
  low: 8000,
  median: 13000,
  high: 20000,
}

export const IDEAL_STUDENT_TEACHER_RATIO = 15
