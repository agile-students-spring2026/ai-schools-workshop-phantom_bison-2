import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                </svg>
              </div>
              <span className="text-white font-semibold">DistrictInsight</span>
            </div>
            <p className="text-sm leading-relaxed">
              Helping parents and educators make informed decisions about school districts across
              the United States.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Find Districts
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Compare Districts
                </Link>
              </li>
              <li>
                <Link to="/for-teachers" className="hover:text-white transition-colors">
                  For Educators
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Data Sources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://educationdata.urban.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Urban Institute Education Data Portal
                </a>
              </li>
              <li>
                <a
                  href="https://nces.ed.gov/ccd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  NCES Common Core of Data
                </a>
              </li>
              <li>
                <a
                  href="https://www.census.gov/programs-surveys/saipe.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Census SAIPE
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-sm text-center">
          <p>
            Data sourced from publicly available federal datasets. All information is provided for
            informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}
