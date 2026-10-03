import { useState, useEffect } from "react";
import { Menu, Loader2 } from "lucide-react";
import { Sidebar, type PageId } from "./components/Sidebar";
import { OverviewPage } from "./pages/OverviewPage";
import { CohortPage } from "./pages/CohortPage";
import { SegmentsPage } from "./pages/SegmentsPage";
import { WhatIfPage } from "./pages/WhatIfPage";
import { RecommendationsPage } from "./pages/RecommendationsPage";
import { ABTestPage } from "./pages/ABTestPage";
import { KpiDefinitionsPage } from "./pages/KpiDefinitionsPage";
import { generateTelcoData } from "./data/generateData";
import { loadDatabase } from "./data/sqlEngine";
import { generatePdfReport } from "./lib/pdfExport";

export default function App() {
  const [page, setPage] = useState<PageId>("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  const [whatIfState, setWhatIfState] = useState({ reductionPct: 20, months: 12 });

  useEffect(() => {
    const data = generateTelcoData();
    loadDatabase(data).then(() => setDbReady(true));
  }, []);

  const handleExportPdf = () => {
    generatePdfReport(whatIfState);
  };

  const handleNavigate = (p: PageId) => {
    setPage(p);
    setMobileSidebarOpen(false);
  };

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-slate-600 mb-3">
            <Loader2 className="animate-spin text-primary-600" size={28} />
            <span className="text-lg font-semibold">Loading ChurnLens</span>
          </div>
          <p className="text-sm text-slate-400">
            Initializing SQL database with 7,043 customer records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar
        current={page}
        onNavigate={handleNavigate}
        onExportPdf={handleExportPdf}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu size={20} className="text-slate-600" />
          </button>
          <span className="font-semibold text-slate-700 text-sm">ChurnLens</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {page === "overview" && <OverviewPage onNavigate={handleNavigate} />}
          {page === "cohort" && <CohortPage />}
          {page === "segments" && <SegmentsPage />}
          {page === "whatif" && <WhatIfPage />}
          {page === "recommendations" && <RecommendationsPage />}
          {page === "abtest" && <ABTestPage />}
          {page === "kpi" && <KpiDefinitionsPage />}
        </main>
      </div>
    </div>
  );
}
