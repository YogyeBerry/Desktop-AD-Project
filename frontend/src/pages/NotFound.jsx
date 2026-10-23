import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
export default function NotFound({ compact = false }) {
  return (
    <div className={`not-found${compact ? ' not-found-compact' : ''}`}>
      <span className="not-found-icon"><Compass size={24} /></span>
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>{compact ? 'We couldn’t find that learning item.' : 'Looks like a wrong turn.'}</h1>
      <p>{compact ? 'It may have been removed, or the link may be out of date.' : 'The page you’re looking for doesn’t exist or may have moved.'}</p>
      <Link to={compact ? '/learning-paths' : '/'} className="button button-primary"><ArrowLeft size={16} /> {compact ? 'Back to learning paths' : 'Back to dashboard'}</Link>
    </div>
  )
}
