interface LoadingStateProps {
  label?: string;
  rows?: number;
}

export function LoadingState({
  label = "Loading",
  rows = 4,
}: LoadingStateProps) {
  return (
    <div className="skeleton" role="status" aria-live="polite" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton__block" />
      ))}
    </div>
  );
}
