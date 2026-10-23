export default function ProgressBar({ value = 0, label }) {
  const progress = Math.max(0, Math.min(100, value))
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label || 'Progress'}
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span className="progress-fill" style={{ width: `${progress}%` }} />
    </div>
  )
}
