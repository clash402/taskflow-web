import { z } from "zod";

import { apiFetch } from "@/lib/api/client";
import {
  CreateRunInput,
  CreateRunInputSchema,
  RetryRunInput,
  RetryRunInputSchema,
  RunListItemSchema,
  RunSchema,
  WorkflowDetailSchema,
  WorkflowSchema,
} from "@/lib/api/types";

const RunsListSchema = z.array(RunListItemSchema);
const WorkflowsListSchema = z.array(WorkflowSchema);
const EmptyObjectSchema = z.object({}).passthrough();

export const queryKeys = {
  runs: ["runs"] as const,
  run: (runId: string) => ["run", runId] as const,
  workflows: ["workflows"] as const,
  workflow: (workflowId: string) => ["workflow", workflowId] as const,
};

export const listRuns = async () => {
  const response = await apiFetch("/runs", RunsListSchema);
  return response.data;
};

export const createRun = async (input: CreateRunInput) => {
  const payload = CreateRunInputSchema.parse(input);
  const response = await apiFetch("/runs", RunSchema, {
    method: "POST",
    body: payload,
  });
  return response.data;
};

export const getRun = async (runId: string) => {
  const response = await apiFetch(`/runs/${runId}`, RunSchema);
  return response.data;
};

export const cancelRun = async (runId: string) => {
  const response = await apiFetch(`/runs/${runId}/cancel`, EmptyObjectSchema, {
    method: "POST",
  });
  return response.data;
};

export const retryRun = async (runId: string, input: RetryRunInput = {}) => {
  const payload = RetryRunInputSchema.parse(input);
  const response = await apiFetch(`/runs/${runId}/retry`, RunSchema, {
    method: "POST",
    body: payload,
  });
  return response.data;
};

export const listWorkflows = async () => {
  const response = await apiFetch("/workflows", WorkflowsListSchema);
  return response.data;
};

export const getWorkflow = async (workflowId: string) => {
  const response = await apiFetch(`/workflows/${workflowId}`, WorkflowDetailSchema);
  return response.data;
};
