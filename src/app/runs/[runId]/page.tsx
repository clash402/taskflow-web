import { RunDetailView } from "@/components/runs/run-detail-view";

type Props = {
  params: Promise<{ runId: string }>;
};

export default async function RunPage({ params }: Props) {
  const { runId } = await params;

  return <RunDetailView runId={runId} />;
}
