"use client"

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="container" style={{ padding: "48px 16px" }}>
      <div className="error">
        <h3 style={{ margin: "0 0 8px 0" }}>Error Loading Data</h3>
        <p style={{ margin: "0 0 16px 0" }}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: "#22c55e",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage
