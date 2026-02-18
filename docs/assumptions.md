# Taskflow Web API Assumptions

- Every endpoint returns the Ghost envelope format: `{ "data": ..., "meta": ... }`.
- `meta.request_id` may be absent; client falls back to generated `X-Request-Id`.
- `GET /runs` returns a list of run summaries using fields:
  - `id`, `status`, `started_at`, `ended_at`, `last_step`, and either `totals.usd` or `total_cost_usd`.
- `GET /runs/:id` returns the full run payload shape from the prompt, with optional fields omitted when unavailable.
- `GET /workflows` returns lightweight template records and `GET /workflows/:id` returns full detail with graph/contracts.
- SSE event payloads match the documented event examples. Unknown events are ignored safely.
- If SSE is unavailable or disconnected, UI polling every ~2.5 seconds is used as fallback.
