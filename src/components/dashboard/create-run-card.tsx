"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createRun, listWorkflows, queryKeys } from "@/lib/api/endpoints";
import { ApiError } from "@/lib/api/client";
import { CreateRunInputSchema, type CreateRunInput } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateRunCard() {
  const router = useRouter();
  const [formError, setFormError] = useState<string>("");
  const [task, setTask] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [budgetUsd, setBudgetUsd] = useState("");
  const [timeoutS, setTimeoutS] = useState("");

  const templatesQuery = useQuery({
    queryKey: queryKeys.workflows,
    queryFn: listWorkflows,
  });

  const createRunMutation = useMutation({
    mutationFn: createRun,
    onSuccess: (run) => {
      router.push(`/runs/${run.id}`);
    },
  });

  const mutationError = createRunMutation.error;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const payload: CreateRunInput = {
      task,
      template_id: templateId || undefined,
      constraints: {
        budget_usd: budgetUsd ? Number(budgetUsd) : undefined,
        timeout_s: timeoutS ? Number(timeoutS) : undefined,
      },
    };

    const validation = CreateRunInputSchema.safeParse(payload);

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || "Invalid run payload");
      return;
    }

    createRunMutation.mutate(validation.data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Run</CardTitle>
        <CardDescription>Submit a task and optionally constrain budget/time.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="task">Task prompt</Label>
            <Textarea
              id="task"
              placeholder="Summarize incident trends and propose a mitigation workflow."
              value={task}
              onChange={(event) => setTask(event.target.value)}
            />
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
              <Label htmlFor="template">Template</Label>
              <select
                id="template"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value)}
              >
                <option value="">No template</option>
                {(templatesQuery.data || []).map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.version})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                placeholder="1.00"
                value={budgetUsd}
                onChange={(event) => setBudgetUsd(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="1"
                placeholder="600"
                value={timeoutS}
                onChange={(event) => setTimeoutS(event.target.value)}
              />
            </div>
          </div>

          {mutationError && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <p>Failed to create run. Try again.</p>
              {mutationError instanceof ApiError && mutationError.requestId && (
                <p className="text-xs text-destructive/80">Request ID: {mutationError.requestId}</p>
              )}
            </div>
          )}

          <Button type="submit" disabled={createRunMutation.isPending}>
            {createRunMutation.isPending ? "Creating..." : "Create Run"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
