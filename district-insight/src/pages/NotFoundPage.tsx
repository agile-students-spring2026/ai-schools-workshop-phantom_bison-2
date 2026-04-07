import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-4 text-center py-20">
      <div className="text-6xl font-bold text-indigo-200 mb-4">404</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on track.
      </p>
      <div className="flex gap-3">
        <Link
          to="/"
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Go Home
        </Link>
        <Link
          to="/search"
          className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
        >
          Find Districts
        </Link>
      </div>
    </div>
  )
}
