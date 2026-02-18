import { z } from "zod";

export const RunStatusSchema = z.enum([
  "queued",
  "planning",
  "running",
  "reflecting",
  "completed",
  "failed",
  "canceled",
]);

export const StepStatusSchema = z.enum([
  "queued",
  "running",
  "completed",
  "failed",
  "canceled",
  "skipped",
]);

export const GraphNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string().optional(),
  status: StepStatusSchema.optional(),
});

export const GraphEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const CostSchema = z.object({
  model: z.string().optional(),
  prompt_tokens: z.number().int().nonnegative().default(0),
  completion_tokens: z.number().int().nonnegative().default(0),
  usd: z.number().nonnegative().default(0),
});

export const StepSchema = z.object({
  id: z.string(),
  status: StepStatusSchema,
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  retries: z.number().int().nonnegative().default(0),
  cost: CostSchema.optional(),
  logs: z.array(z.string()).default([]),
  error: z.unknown().nullable().optional(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
});

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
});

export const RunGraphSchema = z.object({
  nodes: z.array(GraphNodeSchema).default([]),
  edges: z.array(GraphEdgeSchema).default([]),
});

export const RunTotalsSchema = z.object({
  prompt_tokens: z.number().int().nonnegative().default(0),
  completion_tokens: z.number().int().nonnegative().default(0),
  usd: z.number().nonnegative().default(0),
});

export const RunSchema = z.object({
  id: z.string(),
  status: RunStatusSchema,
  task: z.string(),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  template: TemplateSchema.optional(),
  constraints: z
    .object({
      budget_usd: z.number().positive().optional(),
      timeout_s: z.number().int().positive().optional(),
    })
    .optional(),
  graph: RunGraphSchema.default({ nodes: [], edges: [] }),
  steps: z.array(StepSchema).default([]),
  result: z
    .object({
      summary: z.string().optional(),
      artifacts: z.array(z.unknown()).default([]),
    })
    .optional(),
  diagnostics: z.array(z.unknown()).default([]),
  totals: RunTotalsSchema.default({
    prompt_tokens: 0,
    completion_tokens: 0,
    usd: 0,
  }),
});

export const RunListItemSchema = z.object({
  id: z.string(),
  status: RunStatusSchema,
  task: z.string().optional(),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  last_step: z.string().optional(),
  totals: RunTotalsSchema.optional(),
  total_cost_usd: z.number().nonnegative().optional(),
  duration_s: z.number().nonnegative().optional(),
});

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string().optional(),
  graph: RunGraphSchema.optional(),
  contracts: z.unknown().optional(),
});

export const WorkflowDetailSchema = WorkflowSchema.extend({
  graph: RunGraphSchema.default({ nodes: [], edges: [] }),
});

export const CreateRunInputSchema = z.object({
  task: z.string().min(1, "Task is required"),
  template_id: z.string().optional(),
  constraints: z
    .object({
      budget_usd: z.number().positive().optional(),
      timeout_s: z.number().int().positive().optional(),
    })
    .optional(),
});

export const RetryRunInputSchema = z.object({
  step_id: z.string().optional(),
});

export const ApiMetaSchema = z
  .object({
    request_id: z.string().optional(),
  })
  .passthrough();

export const createEnvelopeSchema = <TData extends z.ZodTypeAny>(dataSchema: TData) =>
  z.object({
    data: dataSchema,
    meta: ApiMetaSchema.default({}),
  });

const EventBaseSchema = z
  .object({
    type: z.string(),
    run_id: z.string(),
    ts: z.string().datetime().optional(),
  })
  .passthrough();

const StepStartedEventSchema = EventBaseSchema.extend({
  type: z.literal("step_started"),
  step_id: z.string(),
});

const StepFinishedEventSchema = EventBaseSchema.extend({
  type: z.literal("step_finished"),
  step_id: z.string(),
  status: StepStatusSchema,
  cost: CostSchema.optional(),
});

const LogEventSchema = EventBaseSchema.extend({
  type: z.literal("log"),
  step_id: z.string().optional(),
  level: z.enum(["debug", "info", "warn", "error"]).default("info"),
  message: z.string(),
});

const ReflectionEventSchema = EventBaseSchema.extend({
  type: z.literal("reflection"),
  summary: z.string(),
  changes: z.unknown().optional(),
  policy: z.string().optional(),
  reason: z.string().optional(),
});

const RunFinishedEventSchema = EventBaseSchema.extend({
  type: z.literal("run_finished"),
  status: RunStatusSchema,
});

const UnknownEventSchema = EventBaseSchema;

export const RunEventSchema = z.union([
  StepStartedEventSchema,
  StepFinishedEventSchema,
  LogEventSchema,
  ReflectionEventSchema,
  RunFinishedEventSchema,
  UnknownEventSchema,
]);

export type RunStatus = z.infer<typeof RunStatusSchema>;
export type StepStatus = z.infer<typeof StepStatusSchema>;
export type Step = z.infer<typeof StepSchema>;
export type Run = z.infer<typeof RunSchema>;
export type RunListItem = z.infer<typeof RunListItemSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowDetail = z.infer<typeof WorkflowDetailSchema>;
export type CreateRunInput = z.infer<typeof CreateRunInputSchema>;
export type RetryRunInput = z.infer<typeof RetryRunInputSchema>;
export type RunEvent = z.infer<typeof RunEventSchema>;
export type ApiMeta = z.infer<typeof ApiMetaSchema>;
