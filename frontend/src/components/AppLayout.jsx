import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

const routeTitles = {
  '/': 'Overview',
  '/learning-paths': 'Learning Paths',
  '/analytics': 'Study Analytics',
  '/resources': 'Resource Library',
};

export default function AppLayout() {
  const location = useLocation();
  const currentTitle = routeTitles[location.pathname] || 'Study Space';

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span className="breadcrumb-root">SkillPath</span>
            <span className="breadcrumb-divider">/</span>
            <strong className="breadcrumb-active">{currentTitle}</strong>
          </div>
          <div className="topbar-actions">
            <span className="today-label">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <div className="user-badge" title="Student Profile">
              <span>S</span>
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
