import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Run } from "@/lib/api/types";
import { formatTokens, formatUsd } from "@/lib/utils/format";

type Props = {
  run: Run;
};

export function CostPanel({ run }: Props) {
  const budget = run.constraints?.budget_usd;
  const total = run.totals?.usd ?? 0;
  const remaining = typeof budget === "number" ? Math.max(budget - total, 0) : undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cost</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-md bg-muted/40 p-3 text-sm">
            <p className="text-xs text-muted-foreground">Total prompt tokens</p>
            <p className="mt-1 font-semibold">{formatTokens(run.totals?.prompt_tokens)}</p>
          </div>
          <div className="rounded-md bg-muted/40 p-3 text-sm">
            <p className="text-xs text-muted-foreground">Total completion tokens</p>
            <p className="mt-1 font-semibold">{formatTokens(run.totals?.completion_tokens)}</p>
          </div>
          <div className="rounded-md bg-muted/40 p-3 text-sm">
            <p className="text-xs text-muted-foreground">Total USD</p>
            <p className="mt-1 font-semibold">{formatUsd(total)}</p>
          </div>
        </div>

        {typeof budget === "number" && (
          <div className="rounded-md border p-3 text-sm">
            <p>
              Budget {formatUsd(budget)} | Remaining {formatUsd(remaining)}
            </p>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Step</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Prompt</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>USD</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {run.steps.map((step) => (
              <TableRow key={step.id}>
                <TableCell>{step.id}</TableCell>
                <TableCell>{step.cost?.model || "-"}</TableCell>
                <TableCell>{formatTokens(step.cost?.prompt_tokens)}</TableCell>
                <TableCell>{formatTokens(step.cost?.completion_tokens)}</TableCell>
                <TableCell>{formatUsd(step.cost?.usd)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
