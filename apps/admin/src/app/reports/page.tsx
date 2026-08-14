import { requireAdmin } from "@/lib/adminAuth";
import { countReportsByStatus, listReports, type ReportStatusFilter } from "@/lib/reports";
import { Header } from "@/components/Header";
import { Tabs } from "@/components/Tabs";
import { ReportCard } from "@/components/ReportCard";
import { EmptyState } from "@/components/EmptyState";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { email } = await requireAdmin();
  const { status: statusParam } = await searchParams;
  const activeStatus: ReportStatusFilter =
    statusParam === "reviewed" || statusParam === "dismissed" || statusParam === "all" ? statusParam : "pending";

  const [reports, counts] = await Promise.all([listReports(activeStatus), countReportsByStatus()]);

  return (
    <div className="shell">
      <Header email={email} />
      <main className="shell-main">
        <h1 className="page-title">Denúncias</h1>
        <p className="page-subtitle">
          Fila de revisão manual — nenhuma ação automática acontece a partir de uma denúncia. Marcar como
          &ldquo;Revisado&rdquo; ou &ldquo;Arquivado&rdquo; apenas atualiza o status; remover conteúdo continua sendo
          feito diretamente no banco por enquanto (não há uma ação de exclusão aqui ainda).
        </p>

        <Tabs active={activeStatus} counts={counts} />

        {reports.length === 0 ? (
          <EmptyState icon="✅" title="Nenhuma denúncia nesse filtro" />
        ) : (
          <div className="report-list">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
