import { STATES } from '../../utils/stateData'

interface FilterPanelProps {
  selectedFips: number | null
  onStateChange: (fips: number | null) => void
  sortBy: 'name' | 'enrollment' | 'score'
  onSortChange: (sort: 'name' | 'enrollment' | 'score') => void
}

export function FilterPanel({
  selectedFips,
  onStateChange,
  sortBy,
  onSortChange,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label htmlFor="state-select" className="block text-sm font-medium text-slate-700 mb-1">
          State
        </label>
        <select
          id="state-select"
          value={selectedFips ?? ''}
          onChange={e => onStateChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Select a state...</option>
          {STATES.map(state => (
            <option key={state.fips} value={state.fips}>
              {state.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="sort-select" className="block text-sm font-medium text-slate-700 mb-1">
          Sort By
        </label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={e => onSortChange(e.target.value as 'name' | 'enrollment' | 'score')}
          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="name">Name (A–Z)</option>
          <option value="enrollment">Enrollment (High to Low)</option>
          <option value="score">Score (High to Low)</option>
        </select>
      </div>
    </div>
  )
}
