# Asset Optimizer Setup Guide

This guide will help you set up and use the Rust-based asset optimizer to compress your 1GB of video and image assets.

## Quick Start

```bash
# 1. Install prerequisites (if not already installed)
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# FFmpeg (macOS)
brew install ffmpeg

# 2. Run the optimizer
./optimize_assets.sh

# 3. Preview first (recommended)
./optimize_assets.sh --dry-run
```

## What This Will Do

- **Convert 26 MP4 videos** → WebM format (30-40% smaller)
- **Convert 371 PNG images** → WebP format (25-35% smaller)
- **Save ~300-400MB** from your 1GB asset folder
- **Dramatically improve** page load times

## Prerequisites

### 1. Install Rust

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### 2. Install FFmpeg

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows (use WSL or download binary)
# https://ffmpeg.org/download.html
```

### 3. Verify Installation

```bash
# Check Rust
cargo --version

# Check FFmpeg with required codecs
ffmpeg -codecs | grep -E "(vp9|webp)"
```

## Usage Options

### Basic Usage

```bash
# Convert all assets with default settings
./optimize_assets.sh
```

### Advanced Usage

```bash
# Preview what will be converted
./optimize_assets.sh --dry-run

# High quality settings
./optimize_assets.sh --video-crf 25 --webp-quality 90

# Custom output directory
./optimize_assets.sh --output public/assets/compressed

# More concurrent processing (if you have a powerful CPU)
./optimize_assets.sh --concurrent 8
```

## Quality Settings

### Video Quality (CRF)

- `--video-crf 18`: Highest quality, largest files
- `--video-crf 25`: High quality, good balance
- `--video-crf 30`: Good quality, smaller files (default)
- `--video-crf 35`: Lower quality, smallest files

### Image Quality

- `--webp-quality 95`: Highest quality, largest files
- `--webp-quality 85`: Good quality, balanced size (default)
- `--webp-quality 75`: Lower quality, smaller files

## Expected Results

Your asset folder will be optimized as follows:

```
public/assets/                    # Original: 1.0 GB
├── Scene_3.1.mp4                # 39MB
├── Scene_2.1.mp4                # 37MB
├── Scene_2.2.1_00001.png        # 1.7MB
└── ...

public/assets/optimized/          # Optimized: ~650MB
├── Scene_3.1.webm               # ~23MB (40% smaller)
├── Scene_2.1.webm               # ~22MB (40% smaller)
├── Scene_2.2.1_00001.webp       # ~1.2MB (30% smaller)
└── ...
```

## Integration with Your Next.js Project

After optimization, update your components to use the new formats:

### 1. Create Optimized Components

```tsx
// components/OptimizedVideo.tsx
interface OptimizedVideoProps {
  src: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export function OptimizedVideo({ src, ...props }: OptimizedVideoProps) {
  const baseName = src.replace(/\.[^/.]+$/, "");

  return (
    <video {...props}>
      <source
        src={`${baseName.replace("/assets/", "/assets/optimized/")}.webm`}
        type="video/webm"
      />
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
```

```tsx
// components/OptimizedImage.tsx
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function OptimizedImage({ src, alt, ...props }: OptimizedImageProps) {
  const baseName = src.replace(/\.[^/.]+$/, "");

  return (
    <picture>
      <source
        srcSet={`${baseName.replace("/assets/", "/assets/optimized/")}.webp`}
        type="image/webp"
      />
      <img src={src} alt={alt} {...props} />
    </picture>
  );
}
```

### 2. Update Your Existing Components

Replace your current video/image usage:

```tsx
// Before
<video src="/assets/Scene_3.1.mp4" controls />
<img src="/assets/Scene_2.2.1_00001.png" alt="Scene" />

// After
<OptimizedVideo src="/assets/Scene_3.1.mp4" controls />
<OptimizedImage src="/assets/Scene_2.2.1_00001.png" alt="Scene" />
```

## Performance Benefits

After optimization, you'll see:

- **35% smaller asset bundle** (300-400MB savings)
- **Faster page loads** especially on mobile
- **Reduced bandwidth costs** for you and your users
- **Better Core Web Vitals** scores
- **Improved user experience** with faster video streaming

## Browser Support

The optimizer generates modern formats with fallbacks:

- **WebM**: Chrome 6+, Firefox 4+, Opera 10.6+, Edge 14+
- **WebP**: Chrome 23+, Firefox 65+, Safari 14+, Edge 18+
- **Fallbacks**: Original MP4/PNG files for older browsers

## Troubleshooting

### "FFmpeg not found"

```bash
# Verify installation
ffmpeg -version

# macOS: reinstall with Homebrew
brew reinstall ffmpeg

# Ubuntu: install with apt
sudo apt install ffmpeg
```

### "Permission denied"

```bash
# Make script executable
chmod +x optimize_assets.sh

# Fix output directory permissions
chmod -R 755 public/assets/optimized
```

### "Out of memory"

```bash
# Reduce concurrent processing
./optimize_assets.sh --concurrent 2
```

### "Build failed"

```bash
# Update Rust
rustup update

# Clean and rebuild
cd asset_optimizer
cargo clean
cargo build --release
```

## File Structure After Setup

```
your-project/
├── optimize_assets.sh           # Main runner script
├── SETUP.md                     # This guide
├── asset_optimizer/             # Rust project
│   ├── Cargo.toml
│   ├── src/main.rs
│   └── README.md
├── public/
│   └── assets/
│       ├── Scene_3.1.mp4       # Original files
│       ├── Scene_2.1.mp4
│       ├── *.png
│       └── optimized/          # New optimized files
│           ├── Scene_3.1.webm
│           ├── Scene_2.1.webm
│           └── *.webp
└── src/
    └── components/
        ├── OptimizedVideo.tsx   # New components
        └── OptimizedImage.tsx
```

## Next Steps

1. **Run the optimizer**: `./optimize_assets.sh --dry-run` first
2. **Check the results**: Verify file sizes and quality
3. **Update your components**: Use the optimized versions
4. **Test thoroughly**: Ensure everything works across browsers
5. **Deploy**: Push the optimized assets to production

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Run with `--dry-run` to see what would be processed
4. Check the asset_optimizer/README.md for detailed documentation

Good luck optimizing your assets! 🚀
