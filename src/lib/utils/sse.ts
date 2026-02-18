import { API_BASE_URL } from "@/lib/api/config";
import { RunEventSchema, type RunEvent } from "@/lib/api/types";

type StreamOptions = {
  runId: string;
  onEvent: (event: RunEvent) => void;
  onError?: () => void;
  onOpen?: () => void;
};

export const supportsSse = () => typeof window !== "undefined" && "EventSource" in window;

export const connectRunEvents = ({ runId, onEvent, onError, onOpen }: StreamOptions) => {
  if (!supportsSse() || !API_BASE_URL) {
    return null;
  }

  const stream = new EventSource(`${API_BASE_URL}/runs/${runId}/events`);

  stream.onopen = () => {
    onOpen?.();
  };

  stream.onmessage = (message) => {
    try {
      const payload = JSON.parse(message.data);
      const parsed = RunEventSchema.safeParse(payload);

      if (parsed.success) {
        onEvent(parsed.data);
      }
    } catch {
      // Ignore malformed non-JSON server events.
    }
  };

  stream.onerror = () => {
    onError?.();
  };

  return () => {
    stream.close();
  };
};
