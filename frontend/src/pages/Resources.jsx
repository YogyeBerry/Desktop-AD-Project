import { useMemo, useState } from 'react'
import { ExternalLink, FileText, Globe2, Search, Video } from 'lucide-react'
import { useLearning } from '../context/useLearning'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

const resourceTypes = ['All types', 'PDF', 'Document', 'Video', 'Website']
const typeIcons = { PDF: FileText, Document: FileText, Video, Website: Globe2 }

export default function Resources() {
  const { resources, learningPaths } = useLearning()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All types')
  const topics = learningPaths.flatMap((path) => path.topics.map((topic) => ({ ...topic, pathTitle: path.title })))
  const filteredResources = useMemo(() => resources.filter((resource) => {
    const matchesSearch = `${resource.title} ${resource.description}`.toLowerCase().includes(search.trim().toLowerCase())
    return matchesSearch && (type === 'All types' || resource.type === type)
  }), [resources, search, type])

  return (
    <>
      <PageHeader eyebrow="YOUR LIBRARY" title="Resources" description="A home for useful material connected to your learning paths." action={<span className="sample-tag"><span /> SAMPLE LIBRARY</span>} />
      <div className="paths-toolbar resources-toolbar">
        <label className="search-field"><Search size={18} /><span className="sr-only">Search resources</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search resources..." /></label>
        <label className="select-field"><span className="sr-only">Filter by resource type</span><select value={type} onChange={(event) => setType(event.target.value)}>{resourceTypes.map((option) => <option key={option}>{option}</option>)}</select></label>
      </div>
      <p className="paths-count">{filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} <span>·</span> Sample materials</p>
      {filteredResources.length ? <div className="resources-grid">{filteredResources.map((resource) => {
        const Icon = typeIcons[resource.type] ?? FileText
        const topic = topics.find((item) => item.id === resource.topicId)
        return <Card className="resource-card" key={resource.id}>
          <div className="resource-card-top"><span className={`resource-type-icon type-${resource.type.toLowerCase()}`}><Icon size={19} /></span><span className="resource-type-label">{resource.type}</span></div>
          <h2>{resource.title}</h2><p className="resource-description">{resource.description}</p>
          <div className="resource-related"><span>RELATED TO</span>{topic ? <><strong>{topic.title}</strong><small>{topic.pathTitle}</small></> : <small>Learning path unavailable</small>}</div>
          {resource.url ? <a className="button button-secondary resource-open" href={resource.url} target="_blank" rel="noopener noreferrer">Open website <ExternalLink size={15} /></a> : <Button className="resource-open" variant="secondary" type="button" disabled title="Resource attachments are part of a future phase">Available in a future update</Button>}
        </Card>
      })}</div> : <Card><EmptyState title={resources.length ? 'No resources match your search' : 'Your resource library is empty'} description={resources.length ? 'Try a different search or choose another resource type.' : 'Resources connected to topics will appear here.'} action={resources.length && (search || type !== 'All types') ? <Button type="button" variant="secondary" onClick={() => { setSearch(''); setType('All types') }}>Clear filters</Button> : undefined} /></Card>}
      <p className="analytics-footnote">File uploading and importing are planned for a future phase. Website links open in a new tab.</p>
    </>
  )
}
