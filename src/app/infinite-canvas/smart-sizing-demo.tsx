"use client";

import React, { useState, useEffect } from 'react';
import { CanvasItem } from '../../components/ui/infinite-canvas';
import {
  useContentMeasurement,
  measureText,
  createTextContent,
  createCardContent,
  measureMultipleContents,
  AutoSizingContent,
  type ContentDimensions,
} from '../../components/ui/infinite-canvas/content-measurer';

// Example 1: Hook-based measurement
const MeasuredContentExample = () => {
  const complexContent = (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg p-6">
      <h2 className="text-xl font-bold text-purple-800 mb-4">Dynamic Content</h2>
      <p className="text-purple-600 mb-4">
        This content is measured automatically using the useContentMeasurement hook. 
        The dimensions are calculated before adding to the canvas.
      </p>
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-purple-500 text-white rounded text-sm">
          Action 1
        </button>
        <button className="px-3 py-1 bg-pink-500 text-white rounded text-sm">
          Action 2
        </button>
      </div>
    </div>
  );

  const dimensions = useContentMeasurement(complexContent, {
    maxWidth: 350,
    padding: 0, // Content already has internal padding
  });

  return { content: complexContent, dimensions };
};

// Example 2: Batch content creation
const createSmartCanvasItems = async (): Promise<CanvasItem[]> => {
  // Text-based items with calculated dimensions
  const textItems = [
    createTextContent(
      "This is a simple text block that automatically calculates its dimensions based on font size and content length.",
      { maxWidth: 280, fontSize: 14 }
    ),
    createTextContent(
      "Short text",
      { maxWidth: 200, fontSize: 16 }
    ),
  ];

  // Card-based items
  const cardItems = [
    createCardContent(
      "Smart Sizing",
      "This card automatically calculates its height based on the title and description content, with proper text wrapping.",
      { maxWidth: 250 }
    ),
    createCardContent(
      "Dynamic Layout",
      "Another card with different content length.",
      { maxWidth: 300 }
    ),
  ];

  // Complex content that needs measurement
  const complexContents = [
    {
      id: 'complex-1',
      content: (
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <h3 className="font-bold text-blue-800 mb-2">Feature List</h3>
          <ul className="text-blue-600 text-sm space-y-1">
            <li>• Automatic dimension calculation</li>
            <li>• Text measurement utilities</li>
            <li>• Batch processing support</li>
            <li>• ResizeObserver integration</li>
          </ul>
          <div className="mt-3 text-xs text-blue-500">
            Measured: {new Date().toLocaleTimeString()}
          </div>
        </div>
      ),
      options: { maxWidth: 280, padding: 0 },
    },
    {
      id: 'complex-2',
      content: (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-bold text-green-800">Status: Active</span>
          </div>
          <p className="text-green-600 text-sm mb-3">
            This component demonstrates real-time content measurement with complex layouts.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-green-100 p-2 rounded">Metric A: 92%</div>
            <div className="bg-green-100 p-2 rounded">Metric B: 78%</div>
          </div>
        </div>
      ),
      options: { maxWidth: 250, padding: 0 },
    },
  ];

  // Measure complex content
  const measuredComplexContent = await measureMultipleContents(complexContents);

  // Create canvas items
  const items: CanvasItem[] = [];
  let xPos = 50;
  let yPos = 50;

  // Add text items
  textItems.forEach((item, index) => {
    items.push({
      id: `text-${index}`,
      x: xPos,
      y: yPos,
      width: item.width,
      height: item.height,
      content: item.content,
    });
    xPos += item.width + 20;
    if (xPos > 800) {
      xPos = 50;
      yPos += 150;
    }
  });

  // Add card items
  cardItems.forEach((item, index) => {
    items.push({
      id: `card-${index}`,
      x: xPos,
      y: yPos,
      width: item.width,
      height: item.height,
      content: item.content,
    });
    xPos += item.width + 20;
    if (xPos > 800) {
      xPos = 50;
      yPos += 200;
    }
  });

  // Add measured complex content
  measuredComplexContent.forEach(({ id, dimensions }) => {
    const contentItem = complexContents.find(c => c.id === id)!;
    items.push({
      id,
      x: xPos,
      y: yPos,
      width: dimensions.width,
      height: dimensions.height,
      content: contentItem.content,
    });
    xPos += dimensions.width + 20;
    if (xPos > 800) {
      xPos = 50;
      yPos += 200;
    }
  });

  return items;
};

// Example 3: Live auto-sizing component
interface LiveAutoSizingItemProps {
  id: string;
  x: number;
  y: number;
  onSizeChange: (id: string, dimensions: ContentDimensions) => void;
}

const LiveAutoSizingItem: React.FC<LiveAutoSizingItemProps> = ({
  id,
  x,
  y,
  onSizeChange,
}) => {
  const [text, setText] = useState('Click to edit this text...');
  const [isEditing, setIsEditing] = useState(false);

  return (
    <AutoSizingContent
      maxWidth={300}
      maxHeight={200}
      onSizeChange={(dimensions) => onSizeChange(id, dimensions)}
      className="bg-yellow-50 border-2 border-yellow-200 rounded-lg"
    >
      <div className="p-4">
        <h4 className="font-bold text-yellow-800 mb-2">Live Resize Demo</h4>
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => setIsEditing(false)}
            className="w-full bg-transparent border-none resize-none outline-none text-yellow-600"
            autoFocus
          />
        ) : (
          <p 
            className="text-yellow-600 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {text}
          </p>
        )}
        <div className="text-xs text-yellow-500 mt-2">
          Click text to edit and watch it resize!
        </div>
      </div>
    </AutoSizingContent>
  );
};

// Example 4: Text measurement utility demonstration
const TextMeasurementDemo = () => {
  const sampleTexts = [
    "Short text",
    "This is a medium length text that should wrap to multiple lines when constrained by width.",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  ];

  const measurements = sampleTexts.map((text, index) => {
    const dimensions = measureText(text, '14px Inter, sans-serif', 200);
    return {
      text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      ...dimensions,
      index,
    };
  });

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <h4 className="font-bold text-gray-800 mb-3">Text Measurement Results</h4>
      <div className="space-y-2 text-sm">
        {measurements.map(({ text, width, height, index }) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-600 flex-1 mr-4">{text}</span>
            <span className="text-gray-800 font-mono">
              {Math.round(width)} × {Math.round(height)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export {
  MeasuredContentExample,
  createSmartCanvasItems,
  LiveAutoSizingItem,
  TextMeasurementDemo,
};

export type { ContentDimensions }; 