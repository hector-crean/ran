"use client";
import React from "react";
import GlowFilter, { 
  AnimatedGlowFilter, 
  MultiGlowFilter, 
  useGlowFilter 
} from "./glow-filter";

// Example 1: Basic Static Glow
export const BasicGlowExample = () => (
  <svg width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <GlowFilter
        id="basic-glow"
        color="#4f46e5"
        intensity={1.5}
      />
    </defs>
    <circle
      cx="100"
      cy="100"
      r="40"
      fill="#4f46e5"
      filter="url(#basic-glow)"
    />
  </svg>
);

// Example 2: Animated Pulsing Glow
export const AnimatedGlowExample = () => (
  <svg width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <GlowFilter
        id="animated-glow"
        color="#10b981"
        intensity={2}
        animated
        pulsing
        duration={2}
        easing="easeInOut"
        glowLayers={4}
      />
    </defs>
    <rect
      x="60"
      y="60"
      width="80"
      height="80"
      fill="#10b981"
      filter="url(#animated-glow)"
      rx="10"
    />
  </svg>
);

// Example 3: Interactive Hover Glow
export const InteractiveGlowExample = () => (
  <svg width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <GlowFilter
        id="interactive-glow"
        color="#f59e0b"
        intensity={1}
        interactive
        animated
        maxIntensity={3}
        duration={1}
        easing="backOut"
        onHover={(isHovering) => console.log('Glow hovering:', isHovering)}
      />
    </defs>
    <polygon
      points="100,20 140,80 100,140 60,80"
      fill="#f59e0b"
      filter="url(#interactive-glow)"
      style={{ cursor: 'pointer' }}
    />
  </svg>
);

// Example 4: Color-Cycling Glow
export const ColorCyclingGlowExample = () => (
  <svg width="200" height="200" viewBox="0 0 200 200">
    <defs>
      <AnimatedGlowFilter
        id="color-cycling-glow"
        colors={["#ef4444", "#3b82f6", "#8b5cf6", "#06d6a0"]}
        intensity={2}
        duration={2}
      />
    </defs>
    <circle
      cx="100"
      cy="100"
      r="50"
      fill="white"
      filter="url(#color-cycling-glow)"
    />
  </svg>
);

// Example 5: Multi-Glow Composite
export const MultiGlowExample = () => (
  <svg width="300" height="200" viewBox="0 0 300 200">
    <defs>
      <MultiGlowFilter
        id="multi-glow"
        glowConfigs={[
          { color: "#ff6b6b", intensity: 1.5, offset: { x: -2, y: -2 } },
          { color: "#4ecdc4", intensity: 1.2, offset: { x: 2, y: 2 } },
          { color: "#45b7d1", intensity: 1, offset: { x: 0, y: 0 } },
        ]}
      />
    </defs>
    <text
      x="150"
      y="100"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="36"
      fontWeight="bold"
      fill="white"
      filter="url(#multi-glow)"
    >
      GLOW
    </text>
  </svg>
);

// Example 6: Using the Hook for Complex Interactions
export const HookControlledGlowExample = () => {
  const { isGlowing, intensity, handlers } = useGlowFilter({
    glowOnHover: true,
    glowOnClick: true,
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <GlowFilter
            id="hook-controlled-glow"
            color={isGlowing ? "#dc2626" : "#6b7280"}
            intensity={intensity}
            animated={isGlowing}
            pulsing={isGlowing}
            duration={1.5}
          />
        </defs>
        <path
          d="M100,20 L140,60 L180,100 L140,140 L100,180 L60,140 L20,100 L60,60 Z"
          fill={isGlowing ? "#dc2626" : "#6b7280"}
          filter="url(#hook-controlled-glow)"
          style={{ cursor: 'pointer' }}
          {...handlers}
        />
      </svg>
      <p className="text-sm text-gray-600">
        {isGlowing ? "Glowing! (Hover or click)" : "Hover or click to glow"}
      </p>
    </div>
  );
};

// Example 7: Text with Dynamic Glow
export const DynamicTextGlowExample = () => {
  const [glowColor, setGlowColor] = React.useState("#8b5cf6");
  const [glowIntensity, setGlowIntensity] = React.useState(2);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="400" height="100" viewBox="0 0 400 100">
        <defs>
          <GlowFilter
            id="dynamic-text-glow"
            color={glowColor}
            intensity={glowIntensity}
            animated
            pulsing
            duration={3}
            glowLayers={5}
          />
        </defs>
        <text
          x="200"
          y="50"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fontWeight="bold"
          fill="white"
          filter="url(#dynamic-text-glow)"
        >
          Dynamic Glow Effect
        </text>
      </svg>
      
      <div className="flex gap-4 items-center">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Color:</label>
          <div className="flex gap-2">
            {["#8b5cf6", "#ef4444", "#10b981", "#f59e0b"].map((color) => (
              <button
                key={color}
                onClick={() => setGlowColor(color)}
                className="w-6 h-6 rounded border-2"
                style={{ 
                  backgroundColor: color,
                  borderColor: glowColor === color ? "#000" : "transparent"
                }}
              />
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Intensity:</label>
          <input
            type="range"
            min="0.5"
            max="4"
            step="0.5"
            value={glowIntensity}
            onChange={(e) => setGlowIntensity(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-xs text-center">{glowIntensity}</span>
        </div>
      </div>
    </div>
  );
};

// Complete showcase component
export const GlowFilterShowcase = () => (
  <div className="p-8 space-y-8 bg-gray-900 min-h-screen">
    <h1 className="text-3xl font-bold text-white text-center mb-8">
      Enhanced Glow Filter Examples
    </h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white text-lg font-semibold mb-4">Basic Glow</h3>
        <BasicGlowExample />
      </div> */}
      
       <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white text-lg font-semibold mb-4">Animated Pulse</h3>
        <AnimatedGlowExample />
      </div>
      
      {/* <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white text-lg font-semibold mb-4">Interactive Hover</h3>
        <InteractiveGlowExample />
      </div> */}
     
      {/* <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white text-lg font-semibold mb-4">Color Cycling</h3>
        <ColorCyclingGlowExample />
      </div> */}
      
      {/* <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white text-lg font-semibold mb-4">Multi-Glow</h3>
        <MultiGlowExample />
      </div> */}
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-white text-lg font-semibold mb-4">Hook Controlled</h3>
        <HookControlledGlowExample />
      </div> 
    </div>
    
    {/* <div className="bg-gray-800 p-6 rounded-lg">
      <h3 className="text-white text-lg font-semibold mb-4">Dynamic Controls</h3>
      <DynamicTextGlowExample />
    </div> */}
  </div>
);

export default GlowFilterShowcase; 