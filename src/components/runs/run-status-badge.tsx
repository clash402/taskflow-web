import { Badge } from "@/components/ui/badge";
import { RunStatus, StepStatus } from "@/lib/api/types";
import { statusLabel, statusTone } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type Props = {
  status: RunStatus | StepStatus;
};

export function RunStatusBadge({ status }: Props) {
  const dotTone = {
    completed: "bg-status-success",
    running: "bg-status-info",
    planning: "bg-status-info",
    reflecting: "bg-status-info",
    failed: "bg-status-danger",
    canceled: "bg-ghost-slate",
    queued: "bg-ghost-steel",
    skipped: "bg-ghost-slate",
  }[status];

  return (
    <Badge variant={statusTone(status)}>
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", dotTone)} />
      {statusLabel(status)}
    </Badge>
  );
}
