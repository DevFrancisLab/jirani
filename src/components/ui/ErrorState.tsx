interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "This view could not be loaded.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state" role="alert">
      <h2>Unable to load</h2>
      <p>{message}</p>
      {onRetry ? (
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <button type="button" className="btn" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : null}
    </div>
  );
}
