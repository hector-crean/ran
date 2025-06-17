"use client";
import { useState } from 'react';
import ClipPathComparator from '@/components/clip-path-comparator';
import MorphingClipPath from './morphing-clip-path';

interface MorphingClipPathDemoProps {
  /** Array of SVG path strings to morph between */
  clipPaths: string[];
  /** Array of content to show for each clip path */
  contentGroups: Array<{
    content: React.ReactNode;
    label?: string;
  }>;
  /** SVG viewBox - defaults to "0 0 100 100" */
  viewBox?: string;
  /** Container className */
  className?: string;
  /** Animation duration for morphing */
  morphDuration?: number;
  /** Whether to show the clip path outline */
  showOutline?: boolean;
  /** Background pattern or color */
  background?: React.ReactNode;
  /** Initial path index */
  initialIndex?: number;
  /** Labels for the before/after comparison */
  beforeLabel?: string;
  afterLabel?: string;
}

const MorphingClipPathDemo: React.FC<MorphingClipPathDemoProps> = ({
  clipPaths,
  contentGroups,
  viewBox = "0 0 100 100",
  className = "w-96 h-96 border rounded-lg bg-gray-50",
  morphDuration = 1.2,
  showOutline = true,
  background,
  initialIndex = 0,
  beforeLabel = "Without Clipping",
  afterLabel = "With Morphing Clip"
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  return (
    <div className="flex flex-col items-center gap-4">
      <ClipPathComparator
        beforeContent={
          <MorphingClipPath
            clipPaths={clipPaths}
            contentGroups={contentGroups}
            width={100}
            height={100}
            className={className}
            showControls={false}
            autoCycle={false}
            morphDuration={morphDuration}
            showOutline={false}
            background={background}
            initialIndex={currentIndex}
            clipContent={false}
          />
        }
        afterContent={
          <MorphingClipPath
            clipPaths={clipPaths}
            contentGroups={contentGroups}
            width={100}
            height={100}
            className={className}
            showControls={false}
            autoCycle={false}
            morphDuration={morphDuration}
            showOutline={showOutline}
            background={background}
            initialIndex={currentIndex}
            clipContent={true}
          />
        }
        beforeLabel={beforeLabel}
        afterLabel={afterLabel}
      />
      
      {/* Manual controls for both sides */}
      <div className="flex gap-2 flex-wrap">
        {contentGroups.map((group, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              index === currentIndex
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {group.label || `Shape ${index + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MorphingClipPathDemo; 