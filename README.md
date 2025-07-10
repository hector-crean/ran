# RAN - Video Slideshow Applications

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🛠️ Development Setup & Knowledge

### Core Technology Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Frontend**: React 19, TypeScript 5
- **Styling**: Tailwind CSS 4 with custom design system
- **Animations**: Framer Motion 12.16.0
- **3D Graphics**: Three.js with React Three Fiber
- **State Management**: React Context API
- **UI Components**: Radix UI primitives + custom components

### Code Quality & Development Tools

#### ESLint & Prettier Integration

- **ESLint**: Configured with Next.js core web vitals and TypeScript support
- **Prettier**: Integrated with ESLint for consistent code formatting
- **Auto-formatting**: Configured for VSCode with format-on-save
- **Tailwind**: Automatic class sorting with prettier-plugin-tailwindcss

**Configuration Highlights:**

- Unused variables rule disabled for development flexibility
- React hooks exhaustive deps disabled for performance optimization
- Production builds ignore ESLint errors for deployment flexibility

#### Scripts Available

```bash
npm run dev        # Development server with Turbopack
npm run build      # Production build
npm run lint       # ESLint check
npm run lint:fix   # ESLint with auto-fix
npm run format     # Format all files with Prettier
npm run format:check # Check formatting without changes
```

#### VSCode Integration

- Auto-formatting on save enabled
- ESLint auto-fix on save
- Prettier as default formatter for all supported file types
- Optimized for TypeScript and React development

### Project Architecture

```
src/
├── app/                    # Next.js 15 App Router
│   ├── video-slideshow/    # Slideshow routes and components
│   └── globals.css         # Global styles with custom CSS variables
├── components/             # Reusable UI components
│   └── ui/                 # Base UI component library
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
├── types/                  # TypeScript type definitions
└── utils/                  # Helper functions
```

## 📽️ Video Slideshow - Slide Types

The application features numerous distinct slide types, each serving specific interactive and presentation purposes.

### VideoSlide

**Purpose**: Full-featured video playback with comprehensive controls

- **Implementation**: Custom video player with ref-based control system
- **Features**:
  - Play/pause, seek, volume control
  - Playback speed adjustment
  - Mute/unmute functionality
  - Progress tracking with time display
  - Auto-advance to next slide on completion
- **UI Challenges**:
  - Cross-browser video compatibility
  - Performance optimization for large videos
  - Responsive controls overlay
- **Improvements Needed**: Better mobile controls, keyboard shortcuts

### InteractiveSlide

**Purpose**: Container for interactive elements and user engagement

- **Implementation**: Flexible content structure with interactive_elements array
- **Use Case**: Embedded interactivity, user input collection
- **Current Status**: Basic structure defined, needs implementation
- **Potential Enhancements**: Click handlers, form integration, real-time feedback

### RotationalSequenceSlide

**Purpose**: Interactive 360-degree object rotation with image sequences

- **Implementation**: Motion-based drag system with circular progress indication
- **Features**:
  - Image sequence preloading with `useImageSequence` hook
  - Drag-based rotation control
  - Visual rotation indicator
  - Spring animation for snap-back behavior
  - Loading state management
- **UI Challenges**:
  - Smooth sequence playback
  - Drag sensitivity calibration
  - Performance with large image sequences
- **Improvements Needed**: Touch gesture optimization, frame rate control

### LinearSequenceSlide

**Purpose**: Linear progression through image sequences via horizontal drag

- **Implementation**: Horizontal drag interaction with linear progress indicator
- **Features**:
  - Horizontal drag direction mapping
  - Progress bar visualization
  - Configurable slider text
  - Auto-reset on completion
  - Scale factor for drag sensitivity
- **UI Challenges**:
  - Drag precision control
  - Visual feedback during interaction
  - Loading sequence optimization
- **Improvements Needed**: Multi-touch support, better progress visualization

### FreezeFrameSlide

**Purpose**: Static image with positioned interactive elements

- **Implementation**: Absolute positioning system with screen coordinate mapping
- **Features**:
  - Background image display
  - Positioned interactive elements via screen coordinates
  - Overlay content support
  - Responsive positioning
- **UI Challenges**:
  - Coordinate system accuracy
  - Responsive design across devices
  - Element collision detection
- **Improvements Needed**: Visual editor for positioning, coordinate helpers

### ClipPathComparatorSlide

**Purpose**: Before/after image comparison with interactive slider

- **Implementation**: CSS clip-path with motion-based dragging
- **Features**:
  - Smooth drag interaction
  - Click-to-position functionality
  - Responsive width calculation
  - Visual drag indicators
  - Customizable before/after labels
- **UI Challenges**:
  - Clip path browser compatibility
  - Smooth performance during drag
  - Responsive behavior maintenance
- **Improvements Needed**: Touch optimization, accessibility improvements

### TargetedLinearSequenceSlide

**Purpose**: Directional drag interaction with configurable drag direction

- **Implementation**: Extends LinearSequenceSlide with normalized direction vector
- **Features**:
  - Configurable drag direction (normalisedDragDirection)
  - 2D drag input mapping to 1D progress
  - Hollow button instruction display
  - Same sequence management as LinearSequenceSlide
- **UI Challenges**:
  - Direction vector calibration
  - User intuition for non-horizontal drags
  - Visual direction indicators
- **Improvements Needed**: Direction visualization, better user guidance

### GpuPickingVideoSlide

**Purpose**: Advanced GPU-powered video interaction with mask-based object selection

- **Implementation**: WebGPU-based video processing with mask overlay
- **Features**:
  - GPU-accelerated video processing
  - Mask-based object detection and selection
  - Configurable outline settings (thickness, colors, opacity)
  - Click and hover interactions on video objects
  - Real-time shader parameter adjustment
- **UI Challenges**:
  - WebGPU browser support
  - Performance optimization for real-time processing
  - Complex shader parameter tuning
- **Improvements Needed**: Fallback for non-WebGPU browsers, preset configurations

### Performance Optimization

- **Image Sequence Preloading**: Custom hook for efficient image loading
