"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { History, MoveRight } from "lucide-react";

import { RunStatusBadge } from "@/components/runs/run-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listRuns, queryKeys } from "@/lib/api/endpoints";
import { durationBetween, formatDateTime } from "@/lib/utils/time";
import { formatUsd } from "@/lib/utils/format";

export function RecentRunsTable() {
  const runsQuery = useQuery({
    queryKey: queryKeys.runs,
    queryFn: listRuns,
    refetchInterval: 5_000,
  });

  return (
    <Card>
      <CardHeader className="border-b border-border pb-5">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" strokeWidth={1.75} />
          Recent runs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {runsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading runs...</p>}

        {!runsQuery.isLoading && !runsQuery.data?.length && (
          <div className="grid min-h-36 place-items-center rounded-xl border border-dashed bg-muted/25 p-6 text-center text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">No execution history</p>
              <p className="mt-1">Create a run to begin an inspectable workflow.</p>
            </div>
          </div>
        )}

        {!!runsQuery.data?.length && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Last Step</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runsQuery.data.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">{run.id}</TableCell>
                  <TableCell>
                    <RunStatusBadge status={run.status} />
                  </TableCell>
                  <TableCell>{formatDateTime(run.started_at)}</TableCell>
                  <TableCell>{durationBetween(run.started_at, run.ended_at)}</TableCell>
                  <TableCell>{formatUsd(run.total_cost_usd ?? run.totals?.usd)}</TableCell>
                  <TableCell>{run.last_step || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/runs/${run.id}`}>
                      <Button size="sm" variant="outline">
                        Inspect <MoveRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
