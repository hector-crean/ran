"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

// Types for content measurement
export interface ContentDimensions {
  width: number;
  height: number;
  measured: boolean;
}

export interface MeasurementOptions {
  maxWidth?: number;
  maxHeight?: number;
  padding?: number;
  defaultWidth?: number;
  defaultHeight?: number;
}

// Hook for measuring content dimensions
export const useContentMeasurement = (
  content: React.ReactNode,
  options: MeasurementOptions = {}
) => {
  const {
    maxWidth = 400,
    maxHeight = 300,
    padding = 16,
    defaultWidth = 200,
    defaultHeight = 100,
  } = options;

  const [dimensions, setDimensions] = useState<ContentDimensions>({
    width: defaultWidth,
    height: defaultHeight,
    measured: false,
  });

  const measureContent = useCallback(async () => {
    return new Promise<ContentDimensions>(resolve => {
      // Create a temporary measurement container
      const measurementDiv = document.createElement("div");
      measurementDiv.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        visibility: hidden;
        width: auto;
        height: auto;
        max-width: ${maxWidth}px;
        max-height: ${maxHeight}px;
        padding: ${padding}px;
        box-sizing: border-box;
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
      `;

      document.body.appendChild(measurementDiv);

      // Render the content into the measurement container
      import("react-dom/client").then(({ createRoot }) => {
        const root = createRoot(measurementDiv);
        root.render(content as React.ReactElement);

        // Wait for render and measure
        requestAnimationFrame(() => {
          const rect = measurementDiv.getBoundingClientRect();
          const measured = {
            width: Math.max(rect.width, defaultWidth),
            height: Math.max(rect.height, defaultHeight),
            measured: true,
          };

          // Cleanup
          root.unmount();
          document.body.removeChild(measurementDiv);

          resolve(measured);
        });
      });
    });
  }, [content, maxWidth, maxHeight, padding, defaultWidth, defaultHeight]);

  useEffect(() => {
    if (content) {
      measureContent().then(setDimensions);
    }
  }, [content, measureContent]);

  return dimensions;
};

// Text measurement utilities
export const measureText = (
  text: string,
  font: string = "14px Inter, sans-serif",
  maxWidth?: number
): { width: number; height: number } => {
  // Create a canvas for text measurement
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = font;

  if (maxWidth) {
    // For multi-line text, estimate height based on line breaks
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = context.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) lines.push(currentLine);

    const lineHeight = parseInt(font) * 1.2; // Approximate line height
    return {
      width: Math.min(
        maxWidth,
        Math.max(...lines.map(line => context.measureText(line).width))
      ),
      height: lines.length * lineHeight,
    };
  }

  // Single line measurement
  const metrics = context.measureText(text);
  const lineHeight = parseInt(font) * 1.2;

  return {
    width: metrics.width,
    height: lineHeight,
  };
};

// Component for auto-sizing content
interface AutoSizingContentProps {
  children: React.ReactNode;
  onSizeChange?: (dimensions: ContentDimensions) => void;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

export const AutoSizingContent: React.FC<AutoSizingContentProps> = ({
  children,
  onSizeChange,
  maxWidth = 400,
  maxHeight = 300,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ContentDimensions>({
    width: 0,
    height: 0,
    measured: false,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const newDimensions = {
          width: Math.min(width, maxWidth),
          height: Math.min(height, maxHeight),
          measured: true,
        };

        setDimensions(newDimensions);
        onSizeChange?.(newDimensions);
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [maxWidth, maxHeight, onSizeChange]);

  return (
    <div
      ref={containerRef}
      className={`h-fit w-fit ${className}`}
      style={{
        maxWidth: `${maxWidth}px`,
        maxHeight: `${maxHeight}px`,
      }}
    >
      {children}
    </div>
  );
};

// Preset content creators with known dimensions
export const createTextContent = (
  text: string,
  options: {
    fontSize?: number;
    fontFamily?: string;
    maxWidth?: number;
    padding?: number;
  } = {}
) => {
  const {
    fontSize = 14,
    fontFamily = "Inter, sans-serif",
    maxWidth = 300,
    padding = 16,
  } = options;

  const font = `${fontSize}px ${fontFamily}`;
  const textDimensions = measureText(text, font, maxWidth - padding * 2);

  return {
    content: (
      <div className="p-4 text-gray-800" style={{ fontSize, fontFamily }}>
        {text}
      </div>
    ),
    width: textDimensions.width + padding * 2,
    height: textDimensions.height + padding * 2,
  };
};

export const createCardContent = (
  title: string,
  description: string,
  options: {
    maxWidth?: number;
    padding?: number;
  } = {}
) => {
  const { maxWidth = 250, padding = 16 } = options;

  const titleDimensions = measureText(
    title,
    "bold 16px Inter, sans-serif",
    maxWidth - padding * 2
  );
  const descDimensions = measureText(
    description,
    "14px Inter, sans-serif",
    maxWidth - padding * 2
  );

  const totalHeight =
    titleDimensions.height + descDimensions.height + padding * 3; // Extra padding between elements

  return {
    content: (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-2 font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    ),
    width: maxWidth,
    height: totalHeight,
  };
};

// Batch measurement utility
export const measureMultipleContents = async (
  contents: Array<{
    id: string;
    content: React.ReactNode;
    options?: MeasurementOptions;
  }>
): Promise<Array<{ id: string; dimensions: ContentDimensions }>> => {
  const results = await Promise.all(
    contents.map(async ({ id, content, options = {} }) => {
      const measurementDiv = document.createElement("div");
      measurementDiv.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        visibility: hidden;
        width: auto;
        height: auto;
        max-width: ${options.maxWidth || 400}px;
        max-height: ${options.maxHeight || 300}px;
        padding: ${options.padding || 16}px;
        box-sizing: border-box;
      `;

      document.body.appendChild(measurementDiv);

      return new Promise<{ id: string; dimensions: ContentDimensions }>(
        resolve => {
          import("react-dom/client").then(({ createRoot }) => {
            const root = createRoot(measurementDiv);
            root.render(content as React.ReactElement);

            requestAnimationFrame(() => {
              const rect = measurementDiv.getBoundingClientRect();
              const dimensions = {
                width: Math.max(rect.width, options.defaultWidth || 200),
                height: Math.max(rect.height, options.defaultHeight || 100),
                measured: true,
              };

              root.unmount();
              document.body.removeChild(measurementDiv);

              resolve({ id, dimensions });
            });
          });
        }
      );
    })
  );

  return results;
};
