"use client";

import Head from "next/head";
import React, { useRef, useState } from "react";
import InfiniteCanvas, {
  CanvasItem,
  InfiniteCanvasAPI,
} from "../../components/ui/infinite-canvas";
import { Australia, BaseCountries, EastAsia, Europe, SouthAfrica, SouthAmerica } from "./map/base-countries";

const InfiniteCanvasPage = () => {
  const api = useRef<InfiniteCanvasAPI>(null);

  // Apply root-level CSS for optimal touch handling
  React.useEffect(() => {
    const style = document.createElement("style");
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

  const [items, setItems] = useState<CanvasItem[]>([

    {
      type: 'SVG',
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "1",
      x: 2728.78,
      y: 2612.96,
      width: 228.01,
      height: 200.95,
      render: ({ selected, viewport }) => <SouthAfrica />,
      expansion: {
        dx: 200,
        dy: 0,
        width: 228.01,
        height: 200.95,
        render: ({ selected, parent, viewport }) => (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-lg">
            <h4 className="font-bold text-blue-800 mb-2">🎉 Dynamic Reveal!</h4>
            <p className="text-sm text-gray-700 mb-2">
              This content is generated dynamically when selected.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Selected: {selected ? '✅' : '❌'}</div>
            </div>
          </div>
        ),
      }
    },
    {
      type: 'SVG',
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "2",
      x: 1370.14,
      y: 2224.32,
      width: 646.57,
      height: 571.49,
      render: ({ selected, viewport }) => <SouthAmerica />,
      expansion: {
        dx: 200,
        dy: 0,
        width: 228.01,
        height: 200.95,
        render: ({ selected, parent, viewport }) => (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-lg">
            <h4 className="font-bold text-blue-800 mb-2">🎉 Dynamic Reveal!</h4>
            <p className="text-sm text-gray-700 mb-2">
              This content is generated dynamically when selected.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Selected: {selected ? '✅' : '❌'}</div>
            </div>
          </div>
        ),
      }
    },
    {
      type: 'SVG',
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "3",
      x: 4068.4,
      y: 2447.19,
      width: 565.06,
      height: 525.24,
      render: ({ selected, viewport }) => <Australia />,
      expansion: {
        dx: 200,
        dy: 0,
        width: 228.01,
        height: 200.95,
        render: ({ selected, parent, viewport }) => (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-lg">
            <h4 className="font-bold text-blue-800 mb-2">🎉 Dynamic Reveal!</h4>
            <p className="text-sm text-gray-700 mb-2">
              This content is generated dynamically when selected.
            </p>
          </div>
        ),
      }
    },
    {
      type: 'SVG',
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "4",
      x: 1641.67,//1653
      y: 322.95,//313
      width: 1634.17,
      height: 1500,
      render: ({ selected, viewport }) => <Europe />,
      expansion: {
        dx: 200,
        dy: 0,
        width: 228.01,
        height: 200.95,
        render: ({ selected, parent, viewport }) => (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-lg">
            <h4 className="font-bold text-blue-800 mb-2">🎉 Dynamic Reveal!</h4>
            <p className="text-sm text-gray-700 mb-2">
              This content is generated dynamically when selected.
            </p>
          </div>
        ),
      }
    },

    {
      type: 'SVG',
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "5",
      x: 3938.89,
      y: 1587.68,
      width: 584.07,
      height: 692.22,
      render: ({ selected, viewport }) => <EastAsia />,
      expansion: {
        dx: 200,
        dy: 0,
        width: 228.01,
        height: 200.95,
        render: ({ selected, parent, viewport }) => (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-lg">
            <h4 className="font-bold text-blue-800 mb-2">🎉 Dynamic Reveal!</h4>
            <p className="text-sm text-gray-700 mb-2">
              This content is generated dynamically when selected.
            </p>
          </div>
        ),
      }
    },
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const handleItemsChange = (newItems: CanvasItem[]) => {
    setItems(newItems);
  };

  // Presentation controls
  const startPresentation = () => {
    setCurrentSlide(0);
    api.current?.fitToItemsAndSelect(["1"], { animate: true, duration: 800 });
  };

  const nextSlide = () => {
    const nextIndex = (currentSlide + 1) % items.length;
    const prevIndex = currentSlide === 0 ? items.length - 1 : currentSlide - 1;
    setCurrentSlide(nextIndex);
    api.current?.deselectItems([items[prevIndex].id]);
    api.current?.fitToItemsAndSelect([items[nextIndex].id], {
      animate: true,
      duration: 600,
      padding: 100,
    });
  };

  const prevSlide = () => {
    const nextIndex = (currentSlide + 1) % items.length;
    const prevIndex = currentSlide === 0 ? items.length - 1 : currentSlide - 1;
    setCurrentSlide(prevIndex);
    api.current?.deselectItems([items[nextIndex].id]);
    api.current?.fitToItemsAndSelect([items[prevIndex].id], {
      animate: true,
      duration: 600,
      padding: 100,
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
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>Infinite Canvas Demo</title>
      </Head>
      <div className="h-screen w-full bg-gray-50">
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Infinite Canvas Demo
          </h1>
          <p className="text-gray-600 text-sm"></p>
          <ul className="text-gray-600 text-sm mt-2 space-y-1">
            <li>
              🖱️ <strong>Pan:</strong> Click and drag empty space
            </li>
            <li>
              🔍 <strong>Zoom:</strong> Mouse wheel or trackpad pinch
            </li>
            <li>
              📱 <strong>Touch:</strong> Single finger pan, two finger zoom
            </li>
            <li>
              🎯 <strong>Select:</strong> Click items, Cmd/Ctrl for multi-select
            </li>
            <li>
              ↔️ <strong>Drag:</strong> Click and drag selected items
            </li>
          </ul>
        </div>

        {/* Presentation Controls */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Presentation Mode
          </h2>
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
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Viewport Controls
          </h2>
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
          zoomSensitivity={0.03}
        >
          <BaseCountries />
        </InfiniteCanvas>
      </div>
    </>
  );
};

export default InfiniteCanvasPage;
