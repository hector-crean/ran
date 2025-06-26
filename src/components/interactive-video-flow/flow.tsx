"use client";

import React, { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  Connection,
  Edge,
  Node
} from '@xyflow/react';
import { VideoSourceNode } from './video-source-node';
import { CompositorNode } from './compositor-node';
import { ObjectMappingNode } from './object-mapping-node';

import dagre from 'dagre';

export function layoutElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR',   // LR = left-to-right, TB = top-to-bottom
) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  // Dagre needs node sizes; pick something close to your cards
  nodes.forEach((n) => g.setNode(n.id, { width: 200, height: 110 }));
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  const layoutedNodes = nodes.map((n) => {
    const { x, y } = g.node(n.id);
    return { ...n, position: { x, y } };
  });

  return { nodes: layoutedNodes, edges };
}



const initialNodes = [
  {
    id: '1',
    type: 'videoSource',
    data: {
      label: 'Base Video',
      videoSrc: "/scene_03_02_base_loop.mp4",
    },
    position: { x: 50, y: 5 },
  },
  {
    id: '2',
    type: 'videoSource',
    data: {
      label: 'Mask Video',
      videoSrc: "/scene_03_02_mask_loop.mp4",
    },
    position: { x: 50, y: 250 },
  },
  {
    id: '3',
    type: 'compositor',
    data: { label: 'Composited Output' },
    position: { x: 400, y: 150 },
  },
  {
    id: '4',
    type: 'objectMapping',
    data: {
      mappings: [
        {
          id: 'm-bob',
          name: 'bob',
          rgb: { r: 86, g: 159, b: 69 },
          tolerance: 10,
        },
        {
          id: 'm-alice',
          name: 'alice',
          rgb: { r: 66, g: 126, b: 213 },
          tolerance: 10,
        },
        {
          id: 'm-chris',
          name: 'chris',
          rgb: { r: 118, g: 235, b: 126 },
          tolerance: 10,
        },
        {
          id: 'm-jolene',
          name: 'jolene',
          rgb: { r: 70, g: 82, b: 158 },
          tolerance: 10,
        },
        {
          id: 'm-background',
          name: 'background',
          rgb: { r: 0, g: 0, b: 0 },
          tolerance: 10,
        },
      ],
    },
    position: { x: 50, y: 450 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e-base',
    source: '1',
    sourceHandle: 'video-output',
    target: '3',
    targetHandle: 'video-base',
    type: 'smoothstep',
  },
  {
    id: 'e-mask',
    source: '2',
    sourceHandle: 'video-output',
    target: '3',
    targetHandle: 'video-mask',
    type: 'smoothstep',
  },
  {
    id: 'e-mappings',
    source: '4',
    sourceHandle: 'mappings',
    target: '3',
    targetHandle: 'object-mappings',
    type: 'smoothstep',
  },
];

const InteractiveVideoFlow = () => {

  // const { nodes: laidOutNodes, edges: laidOutEdges } =
  // layoutElements(initialNodes, initialEdges, 'TB'); // or 'LR'

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const nodeTypes = useMemo(() => ({
    videoSource: VideoSourceNode,
    compositor: CompositorNode,
    objectMapping: ObjectMappingNode,
  }), []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

const FlowWithProvider = () => (
  <ReactFlowProvider>
    <InteractiveVideoFlow />
  </ReactFlowProvider>
);

export default FlowWithProvider; 