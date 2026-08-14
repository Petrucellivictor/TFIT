const STATUS_LABEL = {
  pending: "Pendente",
  reviewed: "Revisado",
  dismissed: "Arquivado",
} as const;

export function StatusBadge({ status }: { status: "pending" | "reviewed" | "dismissed" }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}
