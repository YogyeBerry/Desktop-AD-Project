import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, Download, X } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import resourceService from '../services/resourceService';

// Lightweight, robust CSV parser supporting quoted strings and commas
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return { headers: [], rows: [] };

  function parseLine(line) {
    const result = [];
    let cur = '';
    let inQuote = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const rawHeaders = parseLine(lines[0]);
  const headers = rawHeaders.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const rowObj = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] || '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export default function CSVImportModal({ onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [resultSummary, setResultSummary] = useState(null);

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResultSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result || '');
        const { headers, rows } = parseCSV(text);

        // Required field validation
        const hasTitle = headers.some((h) => h.includes('title'));
        const errors = [];
        if (!hasTitle) {
          errors.push('CSV must contain a "title" column');
        }

        const validatedRows = rows.map((row, idx) => {
          const title = row.title || row.resourcetitle || '';
          const type = (row.type || row.resourcetype || 'DOCUMENT').toUpperCase();
          const url = row.url || row.link || row.filepath || '';
          const learningPath = row.learningpath || row.path || row.learningpathtitle || 'General Learning';
          const topic = row.topic || row.topictitle || 'General';

          const isValid = Boolean(title.trim());
          return {
            rowNumber: idx + 1,
            title,
            type,
            url,
            learningPath,
            topic,
            isValid,
            error: isValid ? null : 'Missing title',
          };
        });

        setParseErrors(errors);
        setParsedRows(validatedRows);
      } catch (err) {
        setParseErrors([`Failed to parse CSV file: ${err.message}`]);
      }
    };
    reader.readAsText(selected);
  }

  async function handleImport() {
    const validItems = parsedRows.filter((r) => r.isValid);
    if (!validItems.length) return;

    setImporting(true);
    try {
      const summary = await resourceService.importBatch(validItems);
      setResultSummary(summary);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  }

  function downloadSampleCSV() {
    const sample = `title,type,url,learningPath,topic\n"Thinking in React",WEBSITE,"https://react.dev/learn/thinking-in-react","React Development","Components and props"\n"User Interview Field Guide",PDF,"https://example.com/interview-guide.pdf","Product Design Foundations","User Research"\n"Prototyping Video Course",VIDEO,"https://youtube.com/watch?v=sample","Product Design Foundations","Prototyping"`;
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skillpath_resources_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const validCount = parsedRows.filter((r) => r.isValid).length;

  return (
    <Modal
      title="Import Resources from CSV"
      description="Upload a CSV spreadsheet to import learning materials into your learning paths and topics."
      onClose={onClose}
    >
      <div className="csv-import-body">
        {resultSummary ? (
          <div className="import-success-view">
            <CheckCircle2 size={40} className="success-icon" />
            <h3>Import Completed!</h3>
            <p>
              Successfully imported <strong>{resultSummary.importedCount}</strong> resources.
              {resultSummary.skippedCount > 0 && (
                <span> ({resultSummary.skippedCount} skipped as duplicates or invalid)</span>
              )}
            </p>
            <div className="modal-actions">
              <Button variant="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="csv-upload-zone">
              <input
                type="file"
                id="csvFileInput"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input-hidden"
              />
              <label htmlFor="csvFileInput" className="file-dropzone">
                <Upload size={24} />
                <span>{file ? file.name : 'Choose a CSV file or click to browse'}</span>
                <small>Accepts .csv format</small>
              </label>

              <button
                type="button"
                className="button-text sample-download-btn"
                onClick={downloadSampleCSV}
              >
                <Download size={14} /> Download Sample CSV Template
              </button>
            </div>

            {parseErrors.length > 0 && (
              <div className="csv-error-banner">
                <AlertCircle size={16} />
                <div>
                  {parseErrors.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              </div>
            )}

            {parsedRows.length > 0 && (
              <div className="csv-preview-container">
                <div className="csv-preview-header">
                  <h4>Preview: {parsedRows.length} rows found</h4>
                  <span className="valid-badge">
                    {validCount} ready to import ({parsedRows.length - validCount} invalid)
                  </span>
                </div>

                <div className="csv-preview-table-wrapper">
                  <table className="csv-preview-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Learning Path</th>
                        <th>Topic</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 8).map((row) => (
                        <tr key={row.rowNumber} className={row.isValid ? '' : 'row-invalid'}>
                          <td>{row.rowNumber}</td>
                          <td><strong>{row.title || <em>Missing</em>}</strong></td>
                          <td><span className="type-pill">{row.type}</span></td>
                          <td>{row.learningPath}</td>
                          <td>{row.topic}</td>
                          <td>
                            {row.isValid ? (
                              <span className="status-valid"><CheckCircle2 size={13} /> Valid</span>
                            ) : (
                              <span className="status-error"><AlertTriangle size={13} /> {row.error}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedRows.length > 8 && (
                    <p className="more-rows-note">...and {parsedRows.length - 8} more rows</p>
                  )}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleImport}
                disabled={importing || validCount === 0}
              >
                {importing ? 'Importing...' : `Import ${validCount} Resources`}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
