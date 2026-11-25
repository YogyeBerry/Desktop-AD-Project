export default function ProgressBar({ value = 0, label }) {
  const progress = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label || 'Progress'}
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        className="progress-fill"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
