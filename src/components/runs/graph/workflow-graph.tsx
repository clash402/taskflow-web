"use client";

import {
  Background,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useMemo } from "react";

import { StepStatus } from "@/lib/api/types";

type GraphNode = {
  id: string;
  label: string;
  status?: StepStatus;
};

type GraphEdge = {
  from: string;
  to: string;
};

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

const statusColor: Record<StepStatus, string> = {
  queued: "#94a3b8",
  running: "#0284c7",
  completed: "#16a34a",
  failed: "#dc2626",
  canceled: "#64748b",
  skipped: "#64748b",
};

const getNodeLevelMap = (nodes: GraphNode[], edges: GraphEdge[]) => {
  const levels = new Map<string, number>();
  const nodeIds = new Set(nodes.map((node) => node.id));

  nodes.forEach((node) => {
    levels.set(node.id, 0);
  });

  for (let index = 0; index < nodes.length * 2; index += 1) {
    edges.forEach((edge) => {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        return;
      }

      const parentLevel = levels.get(edge.from) ?? 0;
      const currentChildLevel = levels.get(edge.to) ?? 0;

      if (currentChildLevel <= parentLevel) {
        levels.set(edge.to, parentLevel + 1);
      }
    });
  }

  return levels;
};

export function WorkflowGraph({ nodes, edges }: Props) {
  const flow = useMemo(() => {
    if (!nodes.length) {
      return { flowNodes: [], flowEdges: [] };
    }

    const levels = getNodeLevelMap(nodes, edges);
    const grouped = new Map<number, GraphNode[]>();

    nodes.forEach((node) => {
      const level = levels.get(node.id) ?? 0;
      const bucket = grouped.get(level) ?? [];
      bucket.push(node);
      grouped.set(level, bucket);
    });

    const flowNodes: Node[] = Array.from(grouped.entries()).flatMap(([level, levelNodes]) =>
      levelNodes.map((node, rowIndex) => {
        const color = node.status ? statusColor[node.status] : "#64748b";

        return {
          id: node.id,
          data: { label: node.label },
          position: {
            x: level * 230,
            y: rowIndex * 110,
          },
          style: {
            width: 180,
            borderRadius: 12,
            border: `1px solid ${color}`,
            boxShadow: `inset 0 0 0 1px ${color}25`,
            background: "#ffffff",
            fontSize: 12,
          },
        };
      })
    );

    const flowEdges: Edge[] = edges.map((edge) => ({
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      markerEnd: {
        type: MarkerType.ArrowClosed,
      },
      animated: false,
    }));

    return { flowNodes, flowEdges };
  }, [edges, nodes]);

  if (!nodes.length) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Workflow graph will appear once the planner emits nodes.
      </div>
    );
  }

  return (
    <div className="h-[340px] rounded-lg border bg-white">
      <ReactFlowProvider>
        <ReactFlow
          fitView
          nodes={flow.flowNodes}
          edges={flow.flowEdges}
          minZoom={0.2}
          maxZoom={1.8}
        >
          <MiniMap pannable zoomable />
          <Controls showInteractive={false} />
          <Background gap={18} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
