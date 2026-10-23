import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import { LearningProvider } from './context/LearningProvider'
import Analytics from './pages/Analytics'
import Dashboard from './pages/Dashboard'
import LearningPathDetails from './pages/LearningPathDetails'
import LearningPaths from './pages/LearningPaths'
import NotFound from './pages/NotFound'
import Resources from './pages/Resources'
import TopicStudy from './pages/TopicStudy'
import './App.css'

export default function App() {
  return (
    <LearningProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="learning-paths" element={<LearningPaths />} />
            <Route path="learning-paths/:id" element={<LearningPathDetails />} />
            <Route path="topics/:topicId" element={<TopicStudy />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="resources" element={<Resources />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LearningProvider>
  )
}
