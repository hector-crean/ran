"use client";

import React from 'react';
import FlowWithProvider from '@/components/interactive-video-flow/flow';

const Page = () => {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center gap-4 h-screen">
       <div className="text-center">
        <h1 className="text-3xl font-bold">Interactive Video Compositor</h1>
        <p className="text-muted-foreground">
          Connect video nodes to the compositor to see the output.
        </p>
      </div>
      <div className="w-full h-full border rounded-lg">
        <FlowWithProvider />
      </div>
    </div>
  );
};

export default Page;
