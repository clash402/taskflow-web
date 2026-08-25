import { RunEvent } from "@/lib/api/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ReflectionItem = {
  id: string;
  why: string;
  changed: string;
  policy: string;
};

type Props = {
  events: RunEvent[];
  diagnostics: unknown[];
};

const toText = (value: unknown, fallback: string) => {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return fallback;
  }
};

const extractDiagnostics = (diagnostics: unknown[]): ReflectionItem[] =>
  diagnostics
    .map((entry, index) => {
      if (typeof entry !== "object" || !entry) {
        return null;
      }

      const objectEntry = entry as Record<string, unknown>;

      if (objectEntry.type !== "reflection") {
        return null;
      }

      return {
        id: `diag-${index}`,
        why: toText(objectEntry.why || objectEntry.reason || objectEntry.summary, "Not provided"),
        changed: toText(objectEntry.changed || objectEntry.changes, "No workflow changes provided"),
        policy: toText(
          objectEntry.policy || objectEntry.constraint || objectEntry.trigger,
          "Not provided"
        ),
      };
    })
    .filter((item): item is ReflectionItem => item !== null);

const extractEventReflections = (events: RunEvent[]): ReflectionItem[] =>
  events
    .filter(
      (event): event is Extract<RunEvent, { type: "reflection"; summary: string }> =>
        event.type === "reflection" && typeof (event as { summary?: unknown }).summary === "string"
    )
    .map((event, index) => ({
      id: `event-${index}`,
      why: event.reason || event.summary || "Not provided",
      changed: toText(event.changes, "No workflow changes provided"),
      policy: event.policy || "Not provided",
    }));

export function ReflectionPanel({ events, diagnostics }: Props) {
  const entries = [...extractDiagnostics(diagnostics), ...extractEventReflections(events)];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reflection diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        {!entries.length && (
          <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            No reflection events recorded for this run.
          </div>
        )}

        {!!entries.length && (
          <div className="space-y-3">
            {entries.map((item) => (
              <article key={item.id} className="rounded-xl border bg-card p-4 text-sm">
                <p className="font-semibold">Why replanned</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.why}</p>

                <p className="mt-3 font-semibold">What changed</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.changed}</p>

                <p className="mt-3 font-semibold">Policy applied</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{item.policy}</p>
              </article>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
