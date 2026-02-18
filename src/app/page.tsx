import { CreateRunCard } from "@/components/dashboard/create-run-card";
import { RecentRunsTable } from "@/components/dashboard/recent-runs-table";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Control Plane Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Launch runs, monitor status, and drill into workflow execution.
        </p>
      </header>

      <CreateRunCard />
      <RecentRunsTable />
    </div>
  );
}
