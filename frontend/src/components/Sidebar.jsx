import { NavLink } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  BarChart3,
  FolderOpen,
  CheckCircle2,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Overview', icon: Compass, end: true },
  { to: '/learning-paths', label: 'Learning Paths', icon: BookOpen },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/resources', label: 'Resource Library', icon: FolderOpen },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <NavLink className="brand" to="/" aria-label="SkillPath workspace">
          <span className="brand-mark">
            <CheckCircle2 size={16} strokeWidth={2.5} />
          </span>
          <div className="brand-text">
            <strong>SkillPath</strong>
            <span>STUDENT WORKSPACE</span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Section */}
      <div className="sidebar-group">
        <span className="sidebar-group-title">WORKSPACE</span>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} strokeWidth={1.8} className="nav-icon" />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Subtle Bottom macOS-style status widget */}
      <div className="sidebar-footer-widget">
        <div className="widget-dot" />
        <div className="widget-content">
          <span className="widget-title">Local SQLite Store</span>
          <span className="widget-status">Synced & Persistent</span>
        </div>
      </div>
    </aside>
  );
}
