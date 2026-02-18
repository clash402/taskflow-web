import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export type LogEntry = {
  id: string;
  ts?: string;
  level?: string;
  stepId?: string;
  message: string;
};

type Props = {
  logs: LogEntry[];
};

const levelStyles: Record<string, string> = {
  error: "text-red-700",
  warn: "text-amber-700",
  info: "text-slate-700",
  debug: "text-slate-600",
};

export function LogsPanel({ logs }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px] rounded-md border">
          {!logs.length && (
            <div className="p-4 text-sm text-muted-foreground">
              No log events yet. Waiting for stream.
            </div>
          )}
          {!!logs.length && (
            <ul className="space-y-1 p-3 font-mono text-xs">
              {logs.map((entry) => (
                <li key={entry.id} className="rounded bg-muted/35 px-2 py-1">
                  <span className="text-muted-foreground">[{entry.ts || "-"}]</span>{" "}
                  <span className={levelStyles[entry.level || "info"] || levelStyles.info}>
                    {(entry.level || "info").toUpperCase()}
                  </span>{" "}
                  {entry.stepId && <span className="text-muted-foreground">({entry.stepId})</span>}{" "}
                  {entry.message}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
