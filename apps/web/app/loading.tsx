export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        gap: "var(--space-4)",
        padding: "var(--space-8)",
      }}
    >
      <div
        className="loading-spinner"
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid var(--color-border-light)",
          borderTop: "4px solid var(--color-primary)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
        aria-hidden="true"
      />
      <p
        style={{
          fontSize: "var(--font-size-md)",
          color: "var(--color-text-secondary)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        লোড হচ্ছে...
      </p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
