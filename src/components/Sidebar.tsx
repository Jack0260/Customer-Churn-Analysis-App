import {
  LayoutDashboard,
  Users2,
  Layers,
  Calculator,
  Lightbulb,
  BookOpen,
  TrendingDown,
  FileDown,
  X,
} from "lucide-react";

export type PageId =
  | "overview"
  | "cohort"
  | "segments"
  | "whatif"
  | "recommendations"
  | "abtest"
  | "kpi";

interface SidebarProps {
  current: PageId;
  onNavigate: (page: PageId) => void;
  onExportPdf: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems: { id: PageId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "cohort", label: "Cohort Retention", icon: Users2 },
  { id: "segments", label: "Churn by Segment", icon: Layers },
  { id: "whatif", label: "What-If Simulator", icon: TrendingDown },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "abtest", label: "A/B Test Calculator", icon: Calculator },
  { id: "kpi", label: "KPI Definitions", icon: BookOpen },
];

export function Sidebar({
  current,
  onNavigate,
  onExportPdf,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-800 flex flex-col z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
              <TrendingDown className="text-white" size={20} />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">
                ChurnLens
              </div>
              <div className="text-slate-400 text-xs">Customer Churn Analytics</div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 ${
                  active
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={onExportPdf}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-150"
          >
            <FileDown size={18} />
            Export PDF Report
          </button>
          <div className="mt-3 px-3 text-xs text-slate-500">
            Data: IBM Telco Churn Dataset (7,043 customers)
          </div>
        </div>
      </aside>
    </>
  );
}
