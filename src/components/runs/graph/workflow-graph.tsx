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
  queued: "#9EA3B0",
  running: "#2F659F",
  completed: "#28724F",
  failed: "#B33A3A",
  canceled: "#546A7B",
  skipped: "#546A7B",
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
        const color = node.status ? statusColor[node.status] : "#546A7B";

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
            background: "#FFFEFC",
            color: "#0D1F2D",
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
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
        Workflow graph will appear once the planner emits nodes.
      </div>
    );
  }

  return (
    <div className="bg-grid h-[340px] overflow-hidden rounded-xl border bg-card">
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
