"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { Handle, Position, NodeProps, useReactFlow, Node } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type VideoSourceData = {
  label: string;
  videoSrc?: string;
};

export const VideoSourceNode = ({ id, data, isConnectable }: NodeProps<Node<VideoSourceData>>) => {
  const { setNodes } = useReactFlow();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return { ...node, data: { ...node.data, videoSrc: url } };
          }
          return node;
        })
      );
    }
  };

  return (
    <Card className="w-64">
      <CardHeader className="p-2 bg-gray-100 rounded-t-lg">
        <CardTitle className="text-sm">{data.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={`videoFile-${id}`}>Video File</Label>
          <Input
            id={`videoFile-${id}`}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="nodrag"
          />
        </div>
        {data.videoSrc && (
          <div className="mt-2">
            <video src={data.videoSrc} controls muted className="w-full rounded" />
          </div>
        )}
        <Handle
          type="source"
          position={Position.Right}
          id="video-output"
          isConnectable={isConnectable}
        />
      </CardContent>
    </Card>
  );
}; 