import type { ReportStatusFilter, ReportStatusCounts } from "@/lib/reports";

const TABS: { value: ReportStatusFilter; label: string }[] = [
  { value: "pending", label: "Pendentes" },
  { value: "reviewed", label: "Revisadas" },
  { value: "dismissed", label: "Arquivadas" },
  { value: "all", label: "Todas" },
];

export function Tabs({ active, counts }: { active: ReportStatusFilter; counts: ReportStatusCounts }) {
  return (
    <nav className="tabs">
      {TABS.map((tab) => (
        <a key={tab.value} href={`/reports?status=${tab.value}`} className={`tab${active === tab.value ? " active" : ""}`}>
          {tab.label}
          <span className="tab-count">{counts[tab.value]}</span>
        </a>
      ))}
    </nav>
  );
}
