import { NavLink } from 'react-router-dom'
import { Activity, BookOpen, BookOpenCheck, LayoutDashboard, Library, Sparkles } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/learning-paths', label: 'My Learning Paths', icon: BookOpen },
  { to: '/analytics', label: 'Study Analytics', icon: Activity },
  { to: '/resources', label: 'Resources', icon: Library },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/" aria-label="Daymark dashboard">
        <span className="brand-mark"><BookOpenCheck size={20} /></span>
        <span><strong>daymark</strong><small>LEARNING SPACE</small></span>
      </NavLink>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} aria-label={label} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip-icon"><Sparkles size={16} /></div>
        <p className="sidebar-tip-title">Small steps add up.</p>
        <p className="sidebar-tip-copy">A little progress each day leads to big results.</p>
        <div className="sidebar-footer"><BookOpen size={14} /> Your space to grow</div>
      </div>
    </aside>
  )
}
