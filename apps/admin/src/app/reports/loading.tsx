function Bar({ width, height = 14 }: { width: string | number; height?: number }) {
  return <div className="skeleton" style={{ width, height }} />;
}

export default function ReportsLoading() {
  return (
    <div className="shell">
      <header className="shell-header">
        <div className="brand">
          <span className="brand-dot" aria-hidden="true" />
          TFIT · Moderation Command Center
        </div>
        <Bar width={140} height={20} />
      </header>
      <main className="shell-main">
        <Bar width={160} height={22} />
        <div style={{ height: 8 }} />
        <Bar width={420} height={14} />
        <div style={{ height: 24 }} />
        <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
          <Bar width={80} height={20} />
          <Bar width={80} height={20} />
          <Bar width={80} height={20} />
          <Bar width={60} height={20} />
        </div>
        <div className="report-list">
          <div className="report-card">
            <Bar width="40%" />
            <Bar width="60%" />
            <Bar width="100%" height={56} />
          </div>
          <div className="report-card">
            <Bar width="35%" />
            <Bar width="55%" />
            <Bar width="100%" height={56} />
          </div>
          <div className="report-card">
            <Bar width="45%" />
            <Bar width="50%" />
            <Bar width="100%" height={56} />
          </div>
        </div>
      </main>
    </div>
  );
}
