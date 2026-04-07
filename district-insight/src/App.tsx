import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { SearchPage } from './pages/SearchPage'
import { DistrictDetailPage } from './pages/DistrictDetailPage'
import { ComparePage } from './pages/ComparePage'
import { ForTeachersPage } from './pages/ForTeachersPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="district/:leaid" element={<DistrictDetailPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="for-teachers" element={<ForTeachersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
