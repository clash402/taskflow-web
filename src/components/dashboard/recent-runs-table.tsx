"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

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
      <CardHeader>
        <CardTitle>Recent Runs</CardTitle>
      </CardHeader>
      <CardContent>
        {runsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading runs...</p>}

        {!runsQuery.isLoading && !runsQuery.data?.length && (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No runs yet. Create your first run above.
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
                        Open
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
