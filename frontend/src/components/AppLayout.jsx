import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <div className="topbar">
          <div className="breadcrumbs"><span>SkillPath</span><span className="breadcrumb-divider">/</span><strong>Learning Space</strong></div>
          <div className="topbar-actions">
            <span className="today-label">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <span className="avatar" aria-label="Your profile">Y</span>
          </div>
        </div>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}
