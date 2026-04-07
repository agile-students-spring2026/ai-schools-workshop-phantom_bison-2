import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATES } from '../utils/stateData'

export function HomePage() {
  const [selectedFips, setSelectedFips] = useState<string>('')
  const navigate = useNavigate()

  const handleSearch = () => {
    if (selectedFips) {
      navigate(`/search?fips=${selectedFips}`)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Powered by federal public data
          </div>
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Find the right school district
            <br />
            <span className="text-indigo-200">for your family</span>
          </h1>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Compare academic performance, funding, and demographics across 13,000+ school
            districts nationwide — using free, authoritative federal data.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-lg mx-auto">
            <select
              value={selectedFips}
              onChange={e => setSelectedFips(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Select a state"
            >
              <option value="">Choose a state...</option>
              {STATES.map(s => (
                <option key={s.fips} value={s.fips}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={!selectedFips}
              className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Explore Districts
            </button>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-slate-900">
            Everything parents and educators need
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            We aggregate publicly available federal data to give you a complete picture of any
            school district in the country.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: 'Academic Performance',
              desc: 'See math and reading proficiency rates by grade level, compared to state and national averages.',
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Funding & Resources',
              desc: 'Understand per-pupil spending, revenue sources, and how money is allocated in each district.',
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              ),
              title: 'Side-by-Side Comparison',
              desc: 'Compare up to 3 districts at once across all key metrics to make the best decision for your family.',
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For Educators CTA */}
      <section className="bg-slate-900 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Are you an educator?</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Find districts that invest in their teachers — view salary data, student-teacher
            ratios, and funding health to find the right fit for your career.
          </p>
          <a
            href="/for-teachers"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-colors"
          >
            Explore for Educators
          </a>
        </div>
      </section>

      {/* Data Source Attribution */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400 text-sm">
            Data sourced from the{' '}
            <a
              href="https://educationdata.urban.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline"
            >
              Urban Institute Education Data Portal
            </a>
            , which aggregates federal datasets from NCES, U.S. Census SAIPE, and Ed-Facts.
            Most recent data: Academic Year 2022.
          </p>
        </div>
      </section>
    </div>
  )
}
