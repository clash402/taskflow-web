import { z, ZodTypeAny } from "zod";

import { API_BASE_URL } from "@/lib/api/config";
import { ApiMeta, ApiMetaSchema } from "@/lib/api/types";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;

  requestId?: string;

  constructor(message: string, status: number, requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.requestId = requestId;
  }
}

export type ApiResponse<TData> = {
  data: TData;
  meta: ApiMeta;
  requestId: string;
};

const makeRequestId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

const safeJsonParse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

export async function apiFetch<TSchema extends ZodTypeAny>(
  path: string,
  dataSchema: TSchema,
  options: RequestOptions = {}
): Promise<ApiResponse<z.infer<TSchema>>> {
  const requestId = makeRequestId();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...DEFAULT_HEADERS,
      "X-Request-Id": requestId,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const payload = await safeJsonParse(response);

  if (!response.ok) {
    const metaRequestId = payload?.meta?.request_id;
    const resolvedRequestId = metaRequestId || requestId;

    // eslint-disable-next-line no-console
    console.error("API request failed", {
      path,
      status: response.status,
      request_id: resolvedRequestId,
    });

    const message =
      payload?.error?.message ||
      payload?.message ||
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, resolvedRequestId);
  }

  const envelopeSchema = z.object({
    data: dataSchema,
    meta: ApiMetaSchema.default({}),
  });

  const envelope = envelopeSchema.safeParse(payload);

  if (!envelope.success) {
    // eslint-disable-next-line no-console
    console.error("API response validation failed", {
      path,
      request_id: requestId,
      issues: envelope.error.issues,
    });

    throw new ApiError("Received malformed API payload", response.status, requestId);
  }

  const parsedEnvelope = envelope.data as { data: z.infer<TSchema>; meta: ApiMeta };

  return {
    data: parsedEnvelope.data,
    meta: parsedEnvelope.meta,
    requestId,
  };
}
