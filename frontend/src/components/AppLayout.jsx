import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <div className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="breadcrumb-divider">/</span><strong>Learning space</strong></div>
          <div className="topbar-actions">
            <span className="today-label">Friday, October 23</span>
            <span className="avatar" aria-label="Your profile">Y</span>
          </div>
        </div>
        <main className="page-content"><Outlet /></main>
      </div>
    </div>
  )
}
