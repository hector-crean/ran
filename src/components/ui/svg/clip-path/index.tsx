// Additional clip path effect examples
const createClipPathEffects = {
    // 1. Animated reveal effect
    createRevealEffect: (maskId: string, pathData: string) => (
      <clipPath id={`reveal-${maskId}`}>
        <path d={pathData}>
          <animateTransform
            attributeName="transform"
            type="scale"
            values="0;1"
            dur="2s"
            begin="0s"
          />
        </path>
      </clipPath>
    ),
  
    // 2. Morphing clip path
    createMorphingClip: (maskId: string, pathData1: string, pathData2: string) => (
      <clipPath id={`morph-${maskId}`}>
        <path d={pathData1}>
          <animate
            attributeName="d"
            values={`${pathData1};${pathData2};${pathData1}`}
            dur="3s"
            repeatCount="indefinite"
          />
        </path>
      </clipPath>
    ),
  
    // 3. Multiple overlapping clips for layered effects
    createLayeredClips: (maskId: string, pathData: string) => [
      <clipPath id={`layer1-${maskId}`} key="layer1">
        <path d={pathData} transform="scale(1.1)" opacity="0.7" />
      </clipPath>,
      <clipPath id={`layer2-${maskId}`} key="layer2">
        <path d={pathData} transform="scale(0.9)" opacity="0.9" />
      </clipPath>,
    ],
  
    // 4. Geometric pattern clips
    createPatternClip: (maskId: string, width: number, height: number) => (
      <clipPath id={`pattern-${maskId}`}>
        <defs>
          <pattern id={`circles-${maskId}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="8" fill="white" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill={`url(#circles-${maskId})`} />
      </clipPath>
    ),
  
    // 5. Text-based clipping
    createTextClip: (maskId: string, text: string) => (
      <clipPath id={`text-${maskId}`}>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="48" fontWeight="bold">
          {text}
        </text>
      </clipPath>
    ),
  };

  export { createClipPathEffects };