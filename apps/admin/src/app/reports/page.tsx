import { requireAdmin } from "@/lib/adminAuth";
import { listReports, type ReportStatusFilter } from "@/lib/reports";
import { updateReportStatus } from "./actions";

const STATUS_LABEL: Record<"pending" | "reviewed" | "dismissed", string> = {
  pending: "Pendente",
  reviewed: "Revisado",
  dismissed: "Arquivado",
};

const TABS: { value: ReportStatusFilter; label: string }[] = [
  { value: "pending", label: "Pendentes" },
  { value: "reviewed", label: "Revisadas" },
  { value: "dismissed", label: "Arquivadas" },
  { value: "all", label: "Todas" },
];

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { email } = await requireAdmin();
  const { status: statusParam } = await searchParams;
  const activeStatus: ReportStatusFilter =
    statusParam === "reviewed" || statusParam === "dismissed" || statusParam === "all" ? statusParam : "pending";

  const reports = await listReports(activeStatus);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h1 style={{ margin: 0 }}>Denúncias</h1>
        <span style={{ color: "#5b5e68", fontSize: 14 }}>{email}</span>
      </header>
      <p style={{ color: "#5b5e68" }}>
        Fila de revisão manual — nenhuma ação automática acontece a partir de uma denúncia. Marcar como
        &ldquo;Revisado&rdquo; ou &ldquo;Arquivado&rdquo; apenas atualiza o status; remover conteúdo continua sendo
        feito diretamente no banco por enquanto (não há uma ação de exclusão aqui ainda).
      </p>

      <nav style={{ display: "flex", gap: 16, margin: "24px 0", borderBottom: "1px solid #e4e4e0", paddingBottom: 12 }}>
        {TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/reports?status=${tab.value}`}
            style={{
              color: activeStatus === tab.value ? "#0e7c61" : "#14151a",
              fontWeight: activeStatus === tab.value ? 700 : 400,
              textDecoration: "none",
            }}
          >
            {tab.label}
          </a>
        ))}
      </nav>

      {reports.length === 0 ? <p>Nenhuma denúncia nesse filtro.</p> : null}

      {reports.map((report) => (
        <section key={report.id} style={{ border: "1px solid #e4e4e0", borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <p style={{ margin: "0 0 8px" }}>
            <strong>{report.reason}</strong> · {STATUS_LABEL[report.status]} ·{" "}
            <span style={{ color: "#5b5e68" }}>{new Date(report.createdAt).toLocaleString("pt-BR")}</span>
          </p>
          <p style={{ margin: "0 0 4px" }}>
            Denunciado por: {report.reporter ? `@${report.reporter.handle} (${report.reporter.displayName})` : "usuário removido"}
          </p>
          <p style={{ margin: "0 0 4px" }}>
            Alvo ({report.targetType}): {report.targetSummary}
          </p>
          {report.details ? <p style={{ margin: "0 0 4px" }}>Detalhes do denunciante: {report.details}</p> : null}

          {report.status === "pending" ? (
            <form style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button formAction={updateReportStatus.bind(null, report.id, "reviewed")}>Marcar como revisado</button>
              <button formAction={updateReportStatus.bind(null, report.id, "dismissed")}>Arquivar</button>
            </form>
          ) : null}
        </section>
      ))}
    </main>
  );
}
