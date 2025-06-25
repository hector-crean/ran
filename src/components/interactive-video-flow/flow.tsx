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
} from '@xyflow/react';
import { VideoSourceNode } from './video-source-node';
import { CompositorNode } from './compositor-node';
import { ObjectMappingNode } from './object-mapping-node';

const initialNodes = [
  {
    id: '1',
    type: 'videoSource',
    data: { label: 'Base Video' },
    position: { x: 50, y: 5 },
  },
  {
    id: '2',
    type: 'videoSource',
    data: { label: 'Mask Video' },
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
    data: { mappings: [] },
    position: { x: 50, y: 450 },
  },
];

const initialEdges: Edge[] = [];

const InteractiveVideoFlow = () => {
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