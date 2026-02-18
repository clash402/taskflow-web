import { Badge } from "@/components/ui/badge";
import { RunStatus, StepStatus } from "@/lib/api/types";
import { statusLabel, statusTone } from "@/lib/utils/format";

type Props = {
  status: RunStatus | StepStatus;
};

export function RunStatusBadge({ status }: Props) {
  return <Badge variant={statusTone(status)}>{statusLabel(status)}</Badge>;
}
