"use client";

import React, { useState, useRef } from 'react';
import InfiniteCanvas, { CanvasItem, InfiniteCanvasAPI } from '../../components/ui/infinite-canvas';

const InfiniteCanvasPage = () => {
  const api = useRef<InfiniteCanvasAPI>(null);
  const [items, setItems] = useState<CanvasItem[]>([
    {
      id: '1',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      content: (
        <div className="h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded p-4">
          <h3 className="font-bold text-blue-800 mb-2">Welcome to Infinite Canvas!</h3>
          <p className="text-blue-600 text-sm">
            This is a draggable item. Try clicking and dragging it around, or use trackpad gestures to pan and zoom.
          </p>
        </div>
      ),
    },
    {
      id: '2',
      x: 400,
      y: 200,
      width: 180,
      height: 120,
      content: (
        <div className="h-full bg-gradient-to-br from-green-100 to-green-200 rounded p-4">
          <h3 className="font-bold text-green-800 mb-2">Features</h3>
          <ul className="text-green-600 text-sm space-y-1">
            <li>• Pan with mouse or touch</li>
            <li>• Zoom with wheel or pinch</li>
            <li>• Multi-select with Cmd/Ctrl</li>
            <li>• Drag items around</li>
          </ul>
        </div>
      ),
    },
    {
      id: '3',
      x: 150,
      y: 350,
      width: 160,
      height: 100,
      content: (
        <div className="h-full bg-gradient-to-br from-purple-100 to-purple-200 rounded p-4">
          <h3 className="font-bold text-purple-800 mb-2">Touch Support</h3>
          <p className="text-purple-600 text-sm">
            Works great on mobile and tablets with pinch-to-zoom!
          </p>
        </div>
      ),
    },
    {
      id: '4',
      x: 500,
      y: 50,
      width: 220,
      height: 130,
      content: (
        <div className="h-full bg-gradient-to-br from-orange-100 to-orange-200 rounded p-4">
          <h3 className="font-bold text-orange-800 mb-2">Trackpad Gestures</h3>
          <p className="text-orange-600 text-sm">
            On Mac, use trackpad pinch gestures for smooth zooming and two-finger scrolling for panning.
          </p>
        </div>
      ),
    },
    {
      id: '5',
      x: 300,
      y: 400,
      width: 200,
      height: 80,
      content: (
        <div className="h-full bg-gradient-to-br from-red-100 to-red-200 rounded p-4 flex items-center">
          <p className="text-red-600 text-sm">
            <strong>Try selecting multiple items:</strong> Hold Cmd/Ctrl and click on different items!
          </p>
        </div>
      ),
    },
    {
      id: '6',
      x: 800,
      y: 150,
      width: 180,
      height: 120,
      content: (
        <div className="h-full bg-gradient-to-br from-yellow-100 to-yellow-200 rounded p-4">
          <h3 className="font-bold text-yellow-800 mb-2">Programmatic API</h3>
          <p className="text-yellow-600 text-sm">
            Use the presentation controls to navigate between items automatically!
          </p>
        </div>
      ),
    },
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const handleItemsChange = (newItems: CanvasItem[]) => {
    setItems(newItems);
  };

  // Presentation controls
  const startPresentation = () => {
    setCurrentSlide(0);
    api.current?.fitToItems(['1'], { animate: true, duration: 800 });
  };

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % items.length;
    setCurrentSlide(nextIndex);
    api.current?.fitToItems([items[nextIndex].id], { 
      animate: true, 
      duration: 600,
      padding: 100 
    });
  };

  const prevSlide = () => {
    const prevIndex = currentSlide === 0 ? items.length - 1 : currentSlide - 1;
    setCurrentSlide(prevIndex);
    api.current?.fitToItems([items[prevIndex].id], { 
      animate: true, 
      duration: 600,
      padding: 100 
    });
  };

  const fitAllItems = () => {
    api.current?.fitAll({ animate: true, duration: 800 });
  };

  const zoomToCenter = () => {
    api.current?.zoomToPoint({ x: 400, y: 250 }, 2, { animate: true });
  };

  const resetView = () => {
    api.current?.reset({ animate: true, duration: 600 });
  };

  return (
    <div className="h-screen w-full bg-gray-50">
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Infinite Canvas Demo</h1>
        <p className="text-gray-600 text-sm">
          This infinite canvas supports all the features you'd expect from modern tools like Figma or Excalidraw:
        </p>
        <ul className="text-gray-600 text-sm mt-2 space-y-1">
          <li>🖱️ <strong>Pan:</strong> Click and drag empty space</li>
          <li>🔍 <strong>Zoom:</strong> Mouse wheel or trackpad pinch</li>
          <li>📱 <strong>Touch:</strong> Single finger pan, two finger zoom</li>
          <li>🎯 <strong>Select:</strong> Click items, Cmd/Ctrl for multi-select</li>
          <li>↔️ <strong>Drag:</strong> Click and drag selected items</li>
        </ul>
      </div>

      {/* Presentation Controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Presentation Mode</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={startPresentation}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🎬 Start Presentation
          </button>
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              ← Prev
            </button>
            <button
              onClick={nextSlide}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Next →
            </button>
          </div>
          <div className="text-xs text-gray-600 text-center">
            Slide {currentSlide + 1} of {items.length}
          </div>
        </div>
      </div>

      {/* Viewport Controls */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Viewport Controls</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={fitAllItems}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            📐 Fit All Items
          </button>
          <button
            onClick={zoomToCenter}
            className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
          >
            🎯 Zoom to Center
          </button>
          <button
            onClick={resetView}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
          >
            🏠 Reset View
          </button>
        </div>
      </div>
      
      <InfiniteCanvas
        ref={api}
        items={items}
        onItemsChange={handleItemsChange}
        minZoom={0.1}
        maxZoom={3}
        zoomSensitivity={0.001}
      >
        {/* You can add additional SVG elements here if needed */}
        <circle
          cx={600}
          cy={300}
          r={30}
          fill="rgba(255, 0, 0, 0.3)"
          stroke="red"
          strokeWidth={2}
        />
        <text x={600} y={305} textAnchor="middle" className="text-xs fill-red-600">
          Fixed Element
        </text>
      </InfiniteCanvas>
    </div>
  );
};

export default InfiniteCanvasPage;