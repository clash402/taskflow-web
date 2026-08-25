"use client";

import { useQuery } from "@tanstack/react-query";
import { Braces, FileStack, Network } from "lucide-react";
import { useEffect, useState } from "react";

import { WorkflowGraph } from "@/components/runs/graph/workflow-graph";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getWorkflow, listWorkflows, queryKeys } from "@/lib/api/endpoints";

const stringify = (value: unknown) => {
  if (!value) {
    return "-";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export function WorkflowsPageView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const workflowsQuery = useQuery({
    queryKey: queryKeys.workflows,
    queryFn: listWorkflows,
  });

  useEffect(() => {
    if (!selectedId && workflowsQuery.data?.[0]?.id) {
      setSelectedId(workflowsQuery.data[0].id);
    }
  }, [selectedId, workflowsQuery.data]);

  const selectedWorkflowQuery = useQuery({
    queryKey: selectedId ? queryKeys.workflow(selectedId) : ["workflow", "none"],
    queryFn: () => getWorkflow(selectedId as string),
    enabled: Boolean(selectedId),
  });

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-8">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          <Network className="h-4 w-4" />
          Reusable execution contracts
        </p>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Workflow templates
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-6 text-muted-foreground">
          Inspect graph structure, dependencies, and contracts before a template is used to
          coordinate a run.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader className="border-b border-border pb-5">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileStack className="h-4 w-4 text-primary" />
              Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!workflowsQuery.data?.length && (
              <p className="rounded-xl border border-dashed bg-muted/25 p-4 text-sm text-muted-foreground">
                No templates are available from the API.
              </p>
            )}

            {(workflowsQuery.data || []).map((workflow) => (
              <button
                key={workflow.id}
                type="button"
                onClick={() => setSelectedId(workflow.id)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selectedId === workflow.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/25 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{workflow.name}</p>
                  <Badge variant="muted">v{workflow.version}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {workflow.description || "No description"}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border pb-5">
              <CardTitle>{selectedWorkflowQuery.data?.name || "Select a template"}</CardTitle>
              <CardDescription>
                {selectedWorkflowQuery.data?.description || "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowGraph
                nodes={selectedWorkflowQuery.data?.graph.nodes || []}
                edges={selectedWorkflowQuery.data?.graph.edges || []}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Braces className="h-4 w-4 text-primary" />
                Execution contracts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-80 overflow-auto rounded-xl bg-ghost-ink p-4 font-mono text-xs leading-5 text-white/90">
                {stringify(selectedWorkflowQuery.data?.contracts)}
              </pre>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible>
            <AccordionItem value="advanced" className="rounded-md border px-4">
              <AccordionTrigger>Advanced: JSON template editor (v1 optional)</AccordionTrigger>
              <AccordionContent>
                <p className="mb-3 text-sm text-muted-foreground">
                  This panel is intentionally read-only in v1 until template save endpoints are
                  enabled.
                </p>
                <textarea
                  className="min-h-48 w-full rounded-xl border bg-muted/20 p-3 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={stringify(
                    selectedWorkflowQuery.data || { id: "", name: "", version: "" }
                  )}
                  readOnly
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
