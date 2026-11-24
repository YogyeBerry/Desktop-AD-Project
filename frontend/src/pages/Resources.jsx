import { useMemo, useState } from 'react';
import { ExternalLink, FileText, Globe2, Search, Video, Plus, Upload, Trash2 } from 'lucide-react';
import { useLearning } from '../context/useLearning';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import CSVImportModal from '../components/CSVImportModal';

const resourceTypes = ['All types', 'PDF', 'DOCUMENT', 'VIDEO', 'WEBSITE'];
const typeIcons = {
  PDF: FileText,
  DOCUMENT: FileText,
  Document: FileText,
  VIDEO: Video,
  Video: Video,
  WEBSITE: Globe2,
  Website: Globe2,
};

export default function Resources() {
  const { resources, learningPaths, addResource, deleteResource, refreshData } = useLearning();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All types');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topics = learningPaths.flatMap((path) =>
    path.topics.map((topic) => ({ ...topic, pathTitle: path.title }))
  );

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const title = resource.title || '';
      const desc = resource.description || '';
      const matchesSearch = `${title} ${desc}`.toLowerCase().includes(search.trim().toLowerCase());
      const normalizedResourceType = (resource.type || '').toUpperCase();
      const matchesType = type === 'All types' || normalizedResourceType === type;
      return matchesSearch && matchesType;
    });
  }, [resources, search, type]);

  async function handleAddResource(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = String(formData.get('title')).trim();
    const topicId = String(formData.get('topicId'));
    const resourceType = String(formData.get('type') || 'WEBSITE');
    const url = String(formData.get('url') || '').trim();

    if (!topicId) {
      alert('Please select a topic for this resource.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addResource(topicId, {
        title,
        type: resourceType,
        url: url || null,
      });
      setAddModalOpen(false);
    } catch (err) {
      alert(`Failed to add resource: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteResource(resource) {
    if (window.confirm(`Delete resource "${resource.title}"?`)) {
      try {
        await deleteResource(resource.id);
      } catch (err) {
        alert(`Failed to delete resource: ${err.message}`);
      }
    }
  }

  function handleOpenLink(e, url) {
    if (!url) return;
    if (window.electronAPI?.openExternal) {
      e.preventDefault();
      window.electronAPI.openExternal(url);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="YOUR LIBRARY"
        title="Resources"
        description="A home for educational material, guides, and links connected to your learning paths."
        action={
          <div className="header-actions-row">
            <Button variant="secondary" onClick={() => setImportModalOpen(true)}>
              <Upload size={15} /> Import CSV
            </Button>
            <Button variant="primary" onClick={() => setAddModalOpen(true)} disabled={!topics.length}>
              <Plus size={15} /> Add resource
            </Button>
          </div>
        }
      />

      <div className="paths-toolbar resources-toolbar">
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">Search resources</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search resources..."
          />
        </label>
        <label className="select-field">
          <span className="sr-only">Filter by resource type</span>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {resourceTypes.map((option) => (
              <option key={option} value={option}>
                {option === 'All types' ? option : option.charAt(0) + option.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="paths-count">
        {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}{' '}
        <span>·</span> {resources.length} total in SQLite database
      </p>

      {filteredResources.length ? (
        <div className="resources-grid">
          {filteredResources.map((resource) => {
            const normalizedType = (resource.type || 'DOCUMENT').toUpperCase();
            const Icon = typeIcons[normalizedType] ?? FileText;
            const topic = topics.find((item) => item.id === resource.topicId);

            return (
              <Card className="resource-card" key={resource.id}>
                <div className="resource-card-top">
                  <span className={`resource-type-icon type-${normalizedType.toLowerCase()}`}>
                    <Icon size={19} />
                  </span>
                  <div className="card-top-right">
                    <span className="resource-type-label">{normalizedType}</span>
                    <button
                      type="button"
                      className="icon-button delete-res-card-btn"
                      onClick={() => handleDeleteResource(resource)}
                      title="Delete resource"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h2>{resource.title}</h2>
                <p className="resource-description">
                  {resource.description || 'No extra notes provided.'}
                </p>

                <div className="resource-related">
                  <span>RELATED TO</span>
                  {topic ? (
                    <>
                      <strong>{topic.title}</strong>
                      <small>{topic.pathTitle}</small>
                    </>
                  ) : (
                    <small>{resource.pathTitle || 'Independent Resource'}</small>
                  )}
                </div>

                {resource.url ? (
                  <a
                    className="button button-secondary resource-open"
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => handleOpenLink(e, resource.url)}
                  >
                    Open resource <ExternalLink size={15} />
                  </a>
                ) : (
                  <Button className="resource-open" variant="secondary" type="button" disabled>
                    Saved Local Reference
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            title={resources.length ? 'No resources match your search' : 'Your resource library is empty'}
            description={
              resources.length
                ? 'Try a different search or choose another resource type.'
                : 'Add educational links or import resources from a CSV file.'
            }
            action={
              resources.length && (search || type !== 'All types') ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    setType('All types');
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <div className="empty-actions-row">
                  <Button type="button" variant="primary" onClick={() => setAddModalOpen(true)}>
                    <Plus size={15} /> Add first resource
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setImportModalOpen(true)}>
                    <Upload size={15} /> Import CSV
                  </Button>
                </div>
              )
            }
          />
        </Card>
      )}

      {/* Add Resource Modal */}
      {addModalOpen && (
        <Modal
          title="Add New Resource"
          description="Save a website link, document, video, or PDF reference to a topic"
          onClose={() => setAddModalOpen(false)}
        >
          <form onSubmit={handleAddResource} className="modal-form">
            <label className="form-field">
              <span>Resource Title</span>
              <input name="title" required placeholder="e.g. Clean Code Principles Guide" />
            </label>

            <label className="form-field">
              <span>Associate with Topic</span>
              <select name="topicId" required defaultValue={topics[0]?.id}>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.pathTitle})
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Resource Type</span>
              <select name="type" defaultValue="WEBSITE">
                <option value="WEBSITE">Website / Article</option>
                <option value="VIDEO">Video Tutorial</option>
                <option value="PDF">PDF Reference</option>
                <option value="DOCUMENT">Document</option>
              </select>
            </label>

            <label className="form-field">
              <span>URL or Reference Path</span>
              <input name="url" placeholder="https://..." />
            </label>

            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add Resource'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* CSV Import Modal */}
      {importModalOpen && (
        <CSVImportModal
          onClose={() => setImportModalOpen(false)}
          onImportSuccess={() => {
            refreshData();
          }}
        />
      )}
    </>
  );
}
