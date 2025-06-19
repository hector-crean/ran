"use client";

import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import InfiniteCanvas, { CanvasItem, InfiniteCanvasAPI } from '../../components/ui/infinite-canvas';
import {
  useContentMeasurement,
  measureText,
  createTextContent,
  createCardContent,
  measureMultipleContents,
  AutoSizingContent,
  type ContentDimensions,
} from '../../components/ui/infinite-canvas/content-measurer';

const SmartSizingShowcase = () => {
  const canvasRef = useRef<InfiniteCanvasAPI>(null);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [measurementStats, setMeasurementStats] = useState({
    totalItems: 0,
    measurementTime: 0,
    averageSize: { width: 0, height: 0 },
  });

  // Apply root-level CSS for optimal touch handling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        touch-action: pan-x pan-y;
        height: 100%;
      }
      html, body {
        height: 100%;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Create comprehensive demo content
  useEffect(() => {
    const createDemoContent = async () => {
      setIsLoading(true);
      const startTime = Date.now();

      // 1. Text measurement examples
      const textExamples = [
        createTextContent(
          "Short text example with automatic sizing",
          { fontSize: 14, maxWidth: 200 }
        ),
        createTextContent(
          "This is a longer text example that demonstrates automatic text wrapping and height calculation based on content length and specified maximum width constraints.",
          { fontSize: 16, maxWidth: 300 }
        ),
        createTextContent(
          "Multi-line text with different styling and font size to show how the measurement system handles various text configurations.",
          { fontSize: 12, maxWidth: 250, fontFamily: 'Georgia, serif' }
        ),
      ];

      // 2. Card examples with calculated dimensions
      const cardExamples = [
        createCardContent(
          "Smart Measurement",
          "This card automatically calculates its dimensions based on title and description content.",
          { maxWidth: 280 }
        ),
        createCardContent(
          "Dynamic Sizing",
          "Cards can have different sizes based on their content length, and the system ensures optimal layout.",
          { maxWidth: 320 }
        ),
        createCardContent(
          "Responsive Design",
          "The measurement system works with responsive layouts and CSS styling.",
          { maxWidth: 250 }
        ),
      ];

      // 3. Complex content that needs full DOM measurement
      const complexContents = [
        {
          id: 'feature-showcase',
          content: (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✨</span>
                </div>
                <h3 className="text-xl font-bold text-blue-800">Advanced Features</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="text-sm font-semibold text-blue-700">Real-time</div>
                  <div className="text-xs text-blue-600">Measurement</div>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="text-sm font-semibold text-blue-700">Batch</div>
                  <div className="text-xs text-blue-600">Processing</div>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="text-sm font-semibold text-blue-700">Auto</div>
                  <div className="text-xs text-blue-600">Sizing</div>
                </div>
                <div className="bg-blue-100 rounded-lg p-3">
                  <div className="text-sm font-semibold text-blue-700">Type</div>
                  <div className="text-xs text-blue-600">Safety</div>
                </div>
              </div>
              <p className="text-blue-600 text-sm">
                This complex layout is measured using DOM rendering to ensure pixel-perfect dimensions.
              </p>
            </div>
          ),
          options: { maxWidth: 350, padding: 0 },
        },
        {
          id: 'stats-dashboard',
          content: (
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200">
              <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 rounded text-white text-xs flex items-center justify-center">📊</span>
                Live Statistics
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 text-sm">Items Measured:</span>
                  <span className="font-mono text-green-800 bg-green-100 px-2 py-1 rounded">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 text-sm">Avg. Time:</span>
                  <span className="font-mono text-green-800 bg-green-100 px-2 py-1 rounded">2.3ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 text-sm">Accuracy:</span>
                  <span className="font-mono text-green-800 bg-green-100 px-2 py-1 rounded">100%</span>
                </div>
              </div>
              <div className="mt-4 h-2 bg-green-200 rounded-full">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          ),
          options: { maxWidth: 280, padding: 0 },
        },
        {
          id: 'method-comparison',
          content: (
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-5 border border-purple-200">
              <h4 className="font-bold text-purple-800 mb-4">Measurement Methods</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-purple-100 rounded">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-700 text-sm">Canvas Text API</span>
                  <span className="ml-auto text-xs text-purple-600">Fast</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-purple-100 rounded">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span className="text-purple-700 text-sm">DOM Measurement</span>
                  <span className="ml-auto text-xs text-purple-600">Accurate</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-purple-100 rounded">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-purple-700 text-sm">ResizeObserver</span>
                  <span className="ml-auto text-xs text-purple-600">Live</span>
                </div>
              </div>
            </div>
          ),
          options: { maxWidth: 260, padding: 0 },
        },
        {
          id: 'interactive-demo',
          content: (
            <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-5 border border-orange-200">
              <h4 className="font-bold text-orange-800 mb-3">Interactive Content</h4>
              <p className="text-orange-700 text-sm mb-4">
                This content includes interactive elements that affect sizing calculations.
              </p>
              <div className="flex gap-2 mb-3">
                <button className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600">
                  Action
                </button>
                <button className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                  Button
                </button>
              </div>
              <div className="text-xs text-orange-600">
                Measured at: {new Date().toLocaleTimeString()}
              </div>
            </div>
          ),
          options: { maxWidth: 240, padding: 0 },
        },
      ];

      // Measure complex content
      const measuredComplexContent = await measureMultipleContents(complexContents);

      // 4. Create layout with all measured content
      const allItems: CanvasItem[] = [];
      let xPos = 50;
      let yPos = 50;
      const spacing = 30;
      let totalArea = 0;

      // Add text examples
      textExamples.forEach((item, index) => {
        allItems.push({
          id: `text-${index}`,
          x: xPos,
          y: yPos,
          width: item.width,
          height: item.height,
          content: item.content,
        });
        totalArea += item.width * item.height;
        xPos += item.width + spacing;
        if (xPos > 900) {
          xPos = 50;
          yPos += 180;
        }
      });

      yPos += 200;
      xPos = 50;

      // Add card examples
      cardExamples.forEach((item, index) => {
        allItems.push({
          id: `card-${index}`,
          x: xPos,
          y: yPos,
          width: item.width,
          height: item.height,
          content: item.content,
        });
        totalArea += item.width * item.height;
        xPos += item.width + spacing;
        if (xPos > 900) {
          xPos = 50;
          yPos += 220;
        }
      });

      yPos += 250;
      xPos = 50;

      // Add complex measured content
      measuredComplexContent.forEach(({ id, dimensions }) => {
        const contentItem = complexContents.find(c => c.id === id)!;
        allItems.push({
          id,
          x: xPos,
          y: yPos,
          width: dimensions.width,
          height: dimensions.height,
          content: contentItem.content,
        });
        totalArea += dimensions.width * dimensions.height;
        xPos += dimensions.width + spacing;
        if (xPos > 900) {
          xPos = 50;
          yPos += 250;
        }
      });

      // Add live resizing demo
      yPos += 300;
      allItems.push({
        id: 'live-resize-demo',
        x: 50,
        y: yPos,
        width: 300,
        height: 150,
        content: (
          <LiveResizeDemo onSizeChange={(dimensions) => {
            setItems(prev => prev.map(item => 
              item.id === 'live-resize-demo' 
                ? { ...item, width: dimensions.width, height: dimensions.height }
                : item
            ));
          }} />
        ),
      });

      // Add measurement stats demo
      allItems.push({
        id: 'measurement-stats',
        x: 400,
        y: yPos,
        width: 350,
        height: 200,
        content: <MeasurementStatsDemo items={allItems} />,
      });

      const endTime = Date.now();
      const measurementTime = endTime - startTime;

      setMeasurementStats({
        totalItems: allItems.length,
        measurementTime,
        averageSize: {
          width: totalArea > 0 ? Math.round(totalArea / allItems.length / 100) * 100 / allItems.length : 0,
          height: totalArea > 0 ? Math.round(totalArea / allItems.length / 100) * 100 / allItems.length : 0,
        },
      });

      setItems(allItems);
      setIsLoading(false);
    };

    createDemoContent();
  }, []);

  const handleItemsChange = (newItems: CanvasItem[]) => {
    setItems(newItems);
  };

  const resetCanvas = () => {
    canvasRef.current?.reset({ animate: true });
  };

  const fitAllContent = () => {
    canvasRef.current?.fitAll({ animate: true, padding: 50 });
  };

  const startTour = () => {
    const tourItems = items.filter(item => 
      item.id.includes('text-') || item.id.includes('card-') || item.id.includes('complex-')
    );
    
    let currentIndex = 0;
    const showNextItem = () => {
      if (currentIndex < tourItems.length) {
        canvasRef.current?.fitToItemsAndSelect([tourItems[currentIndex].id], { 
          animate: true, 
          duration: 800,
          padding: 80 
        });
        currentIndex++;
        setTimeout(showNextItem, 2000);
      } else {
        fitAllContent();
      }
    };
    showNextItem();
  };

  return (
    <>
      <Head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" 
        />
        <title>Smart Sizing Showcase - Content Measurement Demo</title>
      </Head>
      <div className="h-screen w-full bg-gray-50">
        {/* Header */}
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Smart Sizing Showcase</h1>
          <p className="text-gray-600 text-sm mb-3">
            Demonstrates automatic content measurement and intelligent sizing for infinite canvas applications.
          </p>
          {isLoading ? (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Measuring content...</span>
            </div>
          ) : (
            <div className="text-xs text-gray-500 space-y-1">
              <div>📏 {measurementStats.totalItems} items measured</div>
              <div>⚡ {measurementStats.measurementTime}ms total time</div>
              <div>📊 Avg: {Math.round(measurementStats.averageSize.width)}×{Math.round(measurementStats.averageSize.height)}px</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
          <h2 className="font-bold text-gray-800 mb-3">Demo Controls</h2>
          <div className="flex flex-col gap-2">
            <button
              onClick={startTour}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm"
            >
              🎬 Start Tour
            </button>
            <button
              onClick={fitAllContent}
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
            >
              📐 Fit All
            </button>
            <button
              onClick={resetCanvas}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              🏠 Reset View
            </button>
          </div>
        </div>

        {/* Method Legend */}
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-bold text-gray-800 mb-2">Measurement Methods</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-700">Canvas Text API</span>
              <span className="text-xs text-gray-500 ml-auto">Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-700">DOM Measurement</span>
              <span className="text-xs text-gray-500 ml-auto">Accurate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-gray-700">ResizeObserver</span>
              <span className="text-xs text-gray-500 ml-auto">Live</span>
            </div>
          </div>
        </div>

        <InfiniteCanvas
          ref={canvasRef}
          items={items}
          onItemsChange={handleItemsChange}
          minZoom={0.1}
          maxZoom={3}
          zoomSensitivity={0.001}
        />
      </div>
    </>
  );
};

// Live resize demonstration component
const LiveResizeDemo: React.FC<{
  onSizeChange: (dimensions: ContentDimensions) => void;
}> = ({ onSizeChange }) => {
  const [text, setText] = useState('Click to edit this text and watch it resize in real-time!');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <AutoSizingContent
      maxWidth={400}
      maxHeight={300}
      onSizeChange={onSizeChange}
      className="bg-yellow-50 border-2 border-yellow-300 rounded-lg"
    >
      <div className="p-4">
        <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
          <span className="w-5 h-5 bg-yellow-500 rounded text-white text-xs flex items-center justify-center">⚡</span>
          Live Resize Demo
        </h4>
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="w-full bg-transparent border border-yellow-300 rounded p-2 resize-none outline-none text-yellow-700"
            autoFocus
            rows={3}
          />
        ) : (
          <p 
            className="text-yellow-700 cursor-pointer hover:bg-yellow-100 p-2 rounded transition-colors"
            onClick={() => setIsEditing(true)}
          >
            {text}
          </p>
        )}
        <div className="text-xs text-yellow-600 mt-2 opacity-75">
          Content automatically resizes using ResizeObserver
        </div>
      </div>
    </AutoSizingContent>
  );
};

// Measurement statistics component
const MeasurementStatsDemo: React.FC<{ items: CanvasItem[] }> = ({ items }) => {
  const textMeasurements = [
    { text: "Short", ...measureText("Short", "14px Inter, sans-serif") },
    { text: "Medium length text", ...measureText("Medium length text example", "14px Inter, sans-serif", 200) },
    { text: "Very long text...", ...measureText("Very long text that wraps to multiple lines when constrained", "14px Inter, sans-serif", 180) },
  ];

  return (
    <div className="bg-white rounded-lg p-4 border-2 border-gray-200 h-full">
      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="w-6 h-6 bg-gray-600 rounded text-white text-xs flex items-center justify-center">📈</span>
        Measurement Statistics
      </h4>
      
      <div className="space-y-3 text-sm">
        <div>
          <div className="font-semibold text-gray-700 mb-1">Canvas Items</div>
          <div className="text-gray-600">Total: {items.length} items</div>
        </div>
        
        <div>
          <div className="font-semibold text-gray-700 mb-1">Text Measurements</div>
          <div className="space-y-1">
            {textMeasurements.map((measurement, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-600">{measurement.text}</span>
                <span className="font-mono text-gray-800">
                  {Math.round(measurement.width)}×{Math.round(measurement.height)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="font-semibold text-gray-700 mb-1">Performance</div>
          <div className="text-gray-600 text-xs">
            All content measured accurately with pixel-perfect precision using multiple measurement techniques.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartSizingShowcase; 