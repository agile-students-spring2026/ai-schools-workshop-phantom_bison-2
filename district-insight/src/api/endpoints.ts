const BASE_URL = 'https://educationdata.urban.org/api/v1'

export const Endpoints = {
  districtDirectory: (year: number, fips?: number) => {
    const params = fips ? `?fips=${fips}&per_page=500` : '?per_page=500'
    return `${BASE_URL}/school-districts/ccd/directory/${year}/${params}`
  },

  districtDirectoryById: (leaid: string, year: number) =>
    `${BASE_URL}/school-districts/ccd/directory/${year}/?leaid=${leaid}`,

  districtEnrollmentByRace: (leaid: string, year: number) =>
    `${BASE_URL}/school-districts/ccd/enrollment/${year}/race/?leaid=${leaid}`,

  districtFinance: (leaid: string, year: number) =>
    `${BASE_URL}/school-districts/ccd/finance/${year}/?leaid=${leaid}`,

  districtAssessments: (leaid: string, year: number) =>
    `${BASE_URL}/school-districts/edfacts/assessments/${year}/grades-all/?leaid=${leaid}`,

  districtSAIPE: (leaid: string, year: number) =>
    `${BASE_URL}/school-districts/saipe/${year}/?leaid=${leaid}`,
}
