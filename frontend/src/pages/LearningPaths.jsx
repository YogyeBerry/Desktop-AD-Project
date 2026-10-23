import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Clock3, MoreHorizontal, Plus, Search, X } from 'lucide-react'
import { useLearning } from '../context/useLearning'
import { formatDuration, getPathProgress, getPathStatus } from '../data/sampleData'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import StatusBadge from '../components/StatusBadge'

const filters = ['All', 'In Progress', 'Completed', 'Not Started']

export default function LearningPaths() {
  const { learningPaths, createLearningPath, updateLearningPath, deleteLearningPath } = useLearning()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [editingPath, setEditingPath] = useState(null)
  const [menuPathId, setMenuPathId] = useState(null)
  const modalOpen = searchParams.get('create') === '1' || Boolean(editingPath)

  const visiblePaths = useMemo(() => learningPaths.filter((path) => {
    const matchesSearch = `${path.title} ${path.description}`.toLowerCase().includes(search.trim().toLowerCase())
    return matchesSearch && (filter === 'All' || getPathStatus(path) === filter)
  }), [learningPaths, search, filter])

  function closeModal() {
    setEditingPath(null)
    if (searchParams.has('create')) setSearchParams({})
  }

  function submitPath(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const updates = {
      title: String(formData.get('title')).trim(),
      description: String(formData.get('description')).trim(),
      estimatedMinutes: Math.max(0, Math.round(Number(formData.get('duration') || 0) * 60)),
    }
    if (editingPath) updateLearningPath(editingPath.id, updates)
    else createLearningPath(updates)
    closeModal()
  }

  function handleDelete(path) {
    if (window.confirm(`Delete "${path.title}"? This will also remove its topics from your learning space.`)) {
      deleteLearningPath(path.id)
      setMenuPathId(null)
    }
  }

  return (
    <>
      <PageHeader eyebrow="YOUR CURRICULUM" title="My learning paths" description="Organize your goals and keep every learning journey moving." action={<Button type="button" onClick={() => { setEditingPath(null); setSearchParams({ create: '1' }) }}><Plus size={17} /> Create learning path</Button>} />
      <div className="paths-toolbar">
        <label className="search-field"><Search size={18} /><span className="sr-only">Search learning paths</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search learning paths..." /></label>
        <div className="filter-tabs" role="group" aria-label="Filter paths by status">
          {filters.map((status) => <button type="button" key={status} className={`filter-tab${filter === status ? ' selected' : ''}`} onClick={() => setFilter(status)}>{status}</button>)}
        </div>
      </div>
      <div className="paths-count">{visiblePaths.length} {visiblePaths.length === 1 ? 'learning path' : 'learning paths'} <span>·</span> showing {filter.toLowerCase()}</div>
      {visiblePaths.length ? (
        <div className="paths-grid">
          {visiblePaths.map((path, index) => {
            const progress = getPathProgress(path)
            const status = getPathStatus(path)
            return (
              <Card className="path-card" key={path.id}>
                <div className="path-card-top">
                  <div className={`path-symbol symbol-${index % 4}`}><span>{path.title.slice(0, 1)}</span></div>
                  <div className="path-menu-wrap">
                    <button className="icon-button" type="button" aria-label={`Actions for ${path.title}`} aria-expanded={menuPathId === path.id} onClick={() => setMenuPathId(menuPathId === path.id ? null : path.id)}><MoreHorizontal size={20} /></button>
                    {menuPathId === path.id && <div className="path-menu"><button type="button" onClick={() => { setEditingPath(path); setMenuPathId(null) }}>Edit path</button><button type="button" className="danger-action" onClick={() => handleDelete(path)}>Delete path</button></div>}
                  </div>
                </div>
                <div className="path-card-title-row"><Link className="card-title-link" to={`/learning-paths/${path.id}`}>{path.title}</Link><StatusBadge status={status} /></div>
                <p className="path-description">{path.description || 'A learning path ready for your next goal.'}</p>
                <div className="path-card-meta"><span><strong>{path.topics.length}</strong> {path.topics.length === 1 ? 'topic' : 'topics'}</span><span><Clock3 size={14} /> {formatDuration(path.estimatedMinutes)}</span></div>
                <div className="progress-meta"><span>Progress</span><strong>{progress}%</strong></div>
                <ProgressBar value={progress} label={`${path.title} progress`} />
                <Link className="path-card-link" to={`/learning-paths/${path.id}`}>View learning path <ArrowRight size={15} /></Link>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card><EmptyState title={learningPaths.length ? 'No paths match your search' : 'Start your first learning path'} description={learningPaths.length ? 'Try another search term or choose a different status filter.' : 'Create a learning path to bring your next goal into focus.'} action={learningPaths.length ? <Button variant="secondary" type="button" onClick={() => { setSearch(''); setFilter('All') }}><X size={15} /> Clear filters</Button> : <Button type="button" onClick={() => { setEditingPath(null); setSearchParams({ create: '1' }) }}><Plus size={16} /> Create learning path</Button>} /></Card>
      )}
      {modalOpen && <Modal title={editingPath ? 'Edit learning path' : 'Create a learning path'} onClose={closeModal}>
        <form className="form-stack" onSubmit={submitPath}>
          <label className="form-field">Learning path title<input name="title" required maxLength="80" defaultValue={editingPath?.title ?? ''} placeholder="e.g. Introduction to photography" autoFocus /></label>
          <label className="form-field">Description<textarea name="description" rows="3" maxLength="240" defaultValue={editingPath?.description ?? ''} placeholder="What would you like to learn?" /></label>
          <label className="form-field">Estimated duration <span className="optional-label">(optional)</span><div className="input-suffix"><input name="duration" type="number" min="0" max="10000" step="0.5" defaultValue={editingPath?.estimatedMinutes ? editingPath.estimatedMinutes / 60 : ''} placeholder="e.g. 8" /><span>hours</span></div></label>
          <div className="modal-actions"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit">{editingPath ? 'Save changes' : 'Create path'}</Button></div>
        </form>
      </Modal>}
    </>
  )
}
