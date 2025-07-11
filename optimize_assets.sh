#!/bin/bash

# Asset Optimizer Runner Script
# This script builds and runs the Rust asset optimizer

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
OPTIMIZER_DIR="$SCRIPT_DIR/asset_optimizer"

echo "🚀 Asset Optimizer for TypeScript/React Project"
echo "================================================"

# Check if Rust is installed
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust is not installed. Please install Rust first:"
    echo "   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg is not installed. Please install FFmpeg first:"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu/Debian: sudo apt install ffmpeg"
    exit 1
fi

# Create optimizer directory if it doesn't exist
if [ ! -d "$OPTIMIZER_DIR" ]; then
    echo "❌ Asset optimizer directory not found at: $OPTIMIZER_DIR"
    echo "Please make sure the asset_optimizer folder is in your project root."
    exit 1
fi

# Navigate to optimizer directory
cd "$OPTIMIZER_DIR"

# Build the project if binary doesn't exist or if source is newer
if [ ! -f "target/release/asset_optimizer" ] || [ "src/main.rs" -nt "target/release/asset_optimizer" ]; then
    echo "🔨 Building asset optimizer..."
    cargo build --release
    echo "✅ Build complete!"
    echo ""
fi

# Return to project root
cd "$SCRIPT_DIR"

# Run the optimizer with the project's public/assets directory
echo "🎯 Running asset optimizer..."
echo "   Input: public/assets/"
echo "   Output: public/assets/optimized/"
echo ""

# Pass all command line arguments to the optimizer
"$OPTIMIZER_DIR/target/release/asset_optimizer" "$@"

echo ""
echo "🎉 Asset optimization complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update your components to use the optimized assets"
echo "   2. Implement progressive enhancement with fallbacks"
echo "   3. Test the optimized assets in your application"
echo ""
echo "💡 Example usage in your components:"
echo "   <video>"
echo "     <source src='/assets/optimized/video.webm' type='video/webm' />"
echo "     <source src='/assets/video.mp4' type='video/mp4' />"
echo "   </video>"
echo ""
echo "   <picture>"
echo "     <source srcSet='/assets/optimized/image.webp' type='image/webp' />"
echo "     <img src='/assets/image.png' alt='...' />"
echo "   </picture>" 