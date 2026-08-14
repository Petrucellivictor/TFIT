import type { ReportRow } from "@/lib/reports";
import { StatusBadge } from "./StatusBadge";
import { updateReportStatus } from "@/app/reports/actions";

const TARGET_ICON: Record<ReportRow["targetType"], string> = {
  post: "📝",
  comment: "💬",
  user: "👤",
};

const TARGET_LABEL: Record<ReportRow["targetType"], string> = {
  post: "Post",
  comment: "Comentário",
  user: "Usuário",
};

export function ReportCard({ report }: { report: ReportRow }) {
  return (
    <article className="report-card">
      <div className="report-card-header">
        <span className="report-reason">{report.reason}</span>
        <StatusBadge status={report.status} />
        <span className="report-timestamp" style={{ marginLeft: "auto" }}>
          {new Date(report.createdAt).toLocaleString("pt-BR")}
        </span>
      </div>

      <div>
        <div className="report-field-label">Denunciado por</div>
        <div className="report-field-value">
          {report.reporter ? `@${report.reporter.handle} (${report.reporter.displayName})` : "usuário removido"}
        </div>
      </div>

      <div className="report-target">
        <div className="report-field-label">
          {TARGET_ICON[report.targetType]} Alvo · {TARGET_LABEL[report.targetType]}
        </div>
        <div className="report-field-value">{report.targetSummary}</div>
      </div>

      {report.details ? (
        <div>
          <div className="report-field-label">Detalhes do denunciante</div>
          <div className="report-field-value">{report.details}</div>
        </div>
      ) : null}

      {report.status === "pending" ? (
        <div className="report-actions">
          <form action={updateReportStatus.bind(null, report.id, "reviewed")}>
            <button type="submit" className="btn btn-primary">
              Marcar como revisado
            </button>
          </form>
          <form action={updateReportStatus.bind(null, report.id, "dismissed")}>
            <button type="submit" className="btn btn-secondary">
              Arquivar
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
