"use client";

import { FiRotateCcw } from "react-icons/fi";

import { RunStatusBadge } from "@/components/runs/run-status-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Step } from "@/lib/api/types";
import { formatTokens, formatUsd } from "@/lib/utils/format";
import { durationBetween, formatDateTime } from "@/lib/utils/time";

type Props = {
  steps: Step[];
  onRetryStep: (stepId: string) => void;
  isRetrying?: boolean;
};

const stringify = (value: unknown) => {
  if (value === undefined || value === null) {
    return "-";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export function StepTimeline({ steps, onRetryStep, isRetrying }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Step Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {!steps.length && (
          <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            No steps emitted yet.
          </div>
        )}
        {!!steps.length && (
          <Accordion type="single" collapsible className="space-y-1">
            {steps.map((step) => (
              <AccordionItem key={step.id} value={step.id} className="rounded-md border px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="grid flex-1 grid-cols-1 gap-2 text-left sm:grid-cols-5">
                    <span className="font-medium">{step.id}</span>
                    <span>
                      <RunStatusBadge status={step.status} />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {durationBetween(step.started_at, step.ended_at)}
                    </span>
                    <span className="text-xs text-muted-foreground">Retries: {step.retries}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatUsd(step.cost?.usd)}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Started {formatDateTime(step.started_at)} | Ended{" "}
                        {formatDateTime(step.ended_at)}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isRetrying}
                        onClick={() => onRetryStep(step.id)}
                      >
                        <FiRotateCcw className="h-3.5 w-3.5" />
                        Retry Step
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-md bg-muted/50 p-3 text-xs">
                        <p className="mb-1 text-muted-foreground">Prompt tokens</p>
                        <p className="font-semibold">{formatTokens(step.cost?.prompt_tokens)}</p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-3 text-xs">
                        <p className="mb-1 text-muted-foreground">Completion tokens</p>
                        <p className="font-semibold">
                          {formatTokens(step.cost?.completion_tokens)}
                        </p>
                      </div>
                      <div className="rounded-md bg-muted/50 p-3 text-xs">
                        <p className="mb-1 text-muted-foreground">Model</p>
                        <p className="font-semibold">{step.cost?.model || "-"}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <section>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Input
                        </h4>
                        <pre className="max-h-48 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                          {stringify(step.input)}
                        </pre>
                      </section>
                      <section>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Output
                        </h4>
                        <pre className="max-h-48 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                          {stringify(step.output)}
                        </pre>
                      </section>
                    </div>

                    <section>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                        Errors & retries
                      </h4>
                      <pre className="max-h-40 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                        {stringify(step.error)}
                      </pre>
                    </section>

                    <section>
                      <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                        Tool calls / logs
                      </h4>
                      <pre className="max-h-40 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                        {step.logs.join("\n") || "-"}
                      </pre>
                    </section>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
