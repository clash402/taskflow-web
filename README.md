# Taskflow Web

The Next.js operations interface for Taskflow launches runs and makes workflow execution inspectable.

## Current Experience

- Create a run with task, workflow template, budget, and timeout constraints
- Review recent runs and status
- Inspect a run graph, step timeline, logs, reflections, diagnostics, and cost
- Cancel or retry execution
- Browse workflow templates
- Follow live SSE events with polling fallback

Routes:

- `/` — control-plane dashboard
- `/runs/{runId}` — run detail
- `/workflows` — workflow templates

The API is maintained in [taskflow-api](https://github.com/clash402/taskflow-api).

## Local Development

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

- `NEXT_PUBLIC_API_BASE_URL` selects the Taskflow API and defaults to `http://localhost:8000`.
- `NEXT_PUBLIC_USE_LOCAL_API_IN_PROD` is available for local production-mode testing.

## Quality Checks

```bash
npm run lint
npm run build
```

Typecheck and automated web-test scripts are not currently configured.

## Current Integration Status

The `main` branch client expects JSON responses wrapped as `{ data, meta }`, while the API returns its Pydantic models directly. The API also lacks cross-origin browser configuration on `main`. The response contract and browser access must be aligned and covered by integration tests before the UI/API connection is considered stable.
