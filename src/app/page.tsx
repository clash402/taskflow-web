import { Activity, Gauge, ShieldCheck, Waypoints } from "lucide-react";

import { CreateRunCard } from "@/components/dashboard/create-run-card";
import { RecentRunsTable } from "@/components/dashboard/recent-runs-table";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            <Waypoints aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
            Orchestration control plane
          </p>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Coordinate work without hiding execution.
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-muted-foreground">
            Launch constrained workflows, follow every state transition, and intervene when policy,
            budget, or execution requires it.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Activity className="h-4 w-4 text-primary" /> Live execution state
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Policy constrained
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Gauge className="h-4 w-4 text-primary" /> Budget aware
          </span>
        </div>
      </header>

      <CreateRunCard />
      <RecentRunsTable />
    </div>
  );
}
