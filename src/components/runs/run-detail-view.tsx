"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Activity, Ban, Clock3, RefreshCw, Workflow } from "lucide-react";

import { RunStatusBadge } from "@/components/runs/run-status-badge";
import { WorkflowGraph } from "@/components/runs/graph/workflow-graph";
import { StepTimeline } from "@/components/runs/timeline/step-timeline";
import { LogsPanel, type LogEntry } from "@/components/runs/logs/logs-panel";
import { CostPanel } from "@/components/runs/cost/cost-panel";
import { ReflectionPanel } from "@/components/runs/reflection/reflection-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api/client";
import { cancelRun, getRun, queryKeys, retryRun } from "@/lib/api/endpoints";
import { RunEvent } from "@/lib/api/types";
import { formatDateTime, durationBetween } from "@/lib/utils/time";
import { connectRunEvents, supportsSse } from "@/lib/utils/sse";

const terminalStatuses = new Set(["completed", "failed", "canceled"]);

const isLogEvent = (
  event: RunEvent
): event is Extract<RunEvent, { type: "log"; message: string; level: string }> =>
  event.type === "log" && typeof (event as { message?: unknown }).message === "string";

const isStepStartedEvent = (
  event: RunEvent
): event is Extract<RunEvent, { type: "step_started"; step_id: string }> =>
  event.type === "step_started" && typeof (event as { step_id?: unknown }).step_id === "string";

const isStepFinishedEvent = (
  event: RunEvent
): event is Extract<RunEvent, { type: "step_finished"; step_id: string; status: string }> =>
  event.type === "step_finished" &&
  typeof (event as { step_id?: unknown }).step_id === "string" &&
  typeof (event as { status?: unknown }).status === "string";

const isReflectionEvent = (
  event: RunEvent
): event is Extract<RunEvent, { type: "reflection"; summary: string }> =>
  event.type === "reflection" && typeof (event as { summary?: unknown }).summary === "string";

const isRunFinishedEvent = (
  event: RunEvent
): event is Extract<RunEvent, { type: "run_finished"; status: string }> =>
  event.type === "run_finished" && typeof (event as { status?: unknown }).status === "string";

const toLogs = (events: RunEvent[]): LogEntry[] =>
  events
    .map((event, index) => {
      if (isLogEvent(event)) {
        return {
          id: `${event.type}-${index}`,
          ts: event.ts,
          level: event.level,
          stepId: event.step_id,
          message: event.message,
        };
      }

      if (isStepStartedEvent(event)) {
        return {
          id: `${event.type}-${index}`,
          ts: event.ts,
          level: "info",
          stepId: event.step_id,
          message: `Step ${event.step_id} started`,
        };
      }

      if (isStepFinishedEvent(event)) {
        return {
          id: `${event.type}-${index}`,
          ts: event.ts,
          level: event.status === "failed" ? "error" : "info",
          stepId: event.step_id,
          message: `Step ${event.step_id} finished (${event.status})`,
        };
      }

      if (isReflectionEvent(event)) {
        return {
          id: `${event.type}-${index}`,
          ts: event.ts,
          level: "warn",
          message: `Reflection diagnostics: ${event.summary}`,
        };
      }

      if (isRunFinishedEvent(event)) {
        return {
          id: `${event.type}-${index}`,
          ts: event.ts,
          level: event.status === "failed" ? "error" : "info",
          message: `Run finished with status ${event.status}`,
        };
      }

      return {
        id: `${event.type}-${index}`,
        ts: event.ts,
        level: "debug",
        message: `Event ${event.type}`,
      };
    })
    .sort((left, right) => {
      if (!left.ts && !right.ts) {
        return 0;
      }
      if (!left.ts) {
        return -1;
      }
      if (!right.ts) {
        return 1;
      }
      return left.ts.localeCompare(right.ts);
    });

export function RunDetailView({ runId }: { runId: string }) {
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<RunEvent[]>([]);
  const [streamState, setStreamState] = useState<"open" | "polling">("polling");

  const runQuery = useQuery({
    queryKey: queryKeys.run(runId),
    queryFn: () => getRun(runId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;

      if (status && terminalStatuses.has(status)) {
        return false;
      }

      return streamState === "open" ? 10_000 : 2_500;
    },
  });

  useEffect(() => {
    setEvents([]);
    setStreamState("polling");

    if (!supportsSse()) {
      return undefined;
    }

    const disconnect = connectRunEvents({
      runId,
      onOpen: () => {
        setStreamState("open");
      },
      onError: () => {
        setStreamState("polling");
      },
      onEvent: (event) => {
        setEvents((previous) => [...previous.slice(-299), event]);
        queryClient.invalidateQueries({ queryKey: queryKeys.run(runId) });
      },
    });

    return () => {
      disconnect?.();
    };
  }, [queryClient, runId]);

  const cancelMutation = useMutation({
    mutationFn: () => cancelRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.run(runId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.runs });
    },
  });

  const retryMutation = useMutation({
    mutationFn: ({ stepId }: { stepId?: string }) =>
      retryRun(runId, stepId ? { step_id: stepId } : {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.run(runId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.runs });
    },
  });

  const run = runQuery.data;

  const logs = useMemo(() => {
    if (!run) {
      return [];
    }

    const stepLogs: LogEntry[] = run.steps.flatMap((step) =>
      step.logs.map((message, index) => ({
        id: `${step.id}-log-${index}`,
        ts: step.started_at,
        level: "info",
        stepId: step.id,
        message,
      }))
    );

    return [...stepLogs, ...toLogs(events)];
  }, [events, run]);

  if (runQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading run...</p>;
  }

  if (runQuery.error) {
    const error = runQuery.error as ApiError;
    return (
      <Card>
        <CardHeader>
          <CardTitle>Failed to load run</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          {error.requestId && (
            <p className="text-xs text-muted-foreground">Request ID: {error.requestId}</p>
          )}
          <Button type="button" variant="outline" onClick={() => runQuery.refetch()}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!run) {
    return <p className="text-sm text-muted-foreground">Run not found.</p>;
  }

  const canCancel = ["queued", "planning", "running", "reflecting"].includes(run.status);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/30 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                <Activity className="h-4 w-4" />
                Live run
              </p>
              <CardTitle className="font-mono text-lg">{run.id}</CardTitle>
              <CardDescription className="mt-1">{run.task}</CardDescription>
            </div>
            <div className="space-y-2 text-right">
              <RunStatusBadge status={run.status} />
              <p className="text-xs text-muted-foreground">
                Updates: {streamState === "open" ? "live stream" : "polling fallback"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-3 text-sm">
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="mt-1 font-medium">{formatDateTime(run.started_at)}</p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-sm">
              <p className="text-xs text-muted-foreground">Elapsed</p>
              <p className="mt-1 font-medium">{durationBetween(run.started_at, run.ended_at)}</p>
            </div>
            <div className="rounded-xl border bg-card p-3 text-sm">
              <p className="text-xs text-muted-foreground">Template</p>
              <p className="mt-1 font-medium">
                {run.template ? `${run.template.name} (${run.template.version})` : "None"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={!canCancel || cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              <Ban className="h-4 w-4" />
              Cancel run
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={retryMutation.isPending}
              onClick={() => retryMutation.mutate({})}
            >
              <RefreshCw className="h-4 w-4" />
              Retry run
            </Button>
          </div>

          {(cancelMutation.error || retryMutation.error) && (
            <div className="rounded-xl border border-status-danger/25 bg-status-danger/5 p-3 text-sm text-status-danger">
              {cancelMutation.error instanceof ApiError && (
                <p>Cancel failed: {cancelMutation.error.message}</p>
              )}
              {retryMutation.error instanceof ApiError && (
                <p>Retry failed: {retryMutation.error.message}</p>
              )}
              {(cancelMutation.error as ApiError)?.requestId && (
                <p className="text-xs">
                  Request ID: {(cancelMutation.error as ApiError).requestId}
                </p>
              )}
              {(retryMutation.error as ApiError)?.requestId && (
                <p className="text-xs">Request ID: {(retryMutation.error as ApiError).requestId}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Workflow className="h-5 w-5 text-primary" />
            Workflow graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WorkflowGraph nodes={run.graph.nodes} edges={run.graph.edges} />
        </CardContent>
      </Card>

      <StepTimeline
        steps={run.steps}
        onRetryStep={(stepId) => retryMutation.mutate({ stepId })}
        isRetrying={retryMutation.isPending}
      />

      <Tabs defaultValue="logs" className="space-y-3">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="reflection">Reflection</TabsTrigger>
          <TabsTrigger value="cost">Cost</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <LogsPanel logs={logs} />
        </TabsContent>
        <TabsContent value="reflection">
          <ReflectionPanel events={events} diagnostics={run.diagnostics} />
        </TabsContent>
        <TabsContent value="cost">
          <CostPanel run={run} />
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock3 className="h-5 w-5 text-primary" />
            Final outcome
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {run.result?.summary || "Run has not produced a final summary yet."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
