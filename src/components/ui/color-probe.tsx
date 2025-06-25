"use client"

import { type FC, useState, useCallback, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Pipette } from "lucide-react"
import { motion } from "motion/react"

interface Color {
  r: number
  g: number
  b: number
  a: number
}

interface ColorProbeProps {
  kernel: Color[]
  centerColor: Color
  position: { x: number; y: number }
  kernelSize?: number
  onClose?: () => void
}

const ColorProbe: FC<ColorProbeProps> = ({ kernel, centerColor, position, kernelSize = 5, onClose }) => {
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const probeRef = useRef<HTMLDivElement>(null)

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        probeRef.current &&
        !probeRef.current.contains(event.target as Node)
      ) {
        onClose?.()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Color format conversions with alpha
  const rgbaString = `rgba(${centerColor.r}, ${centerColor.g}, ${centerColor.b}, ${(centerColor.a / 255).toFixed(2)})`
  const hexColor = `#${centerColor.r.toString(16).padStart(2, "0")}${centerColor.g.toString(16).padStart(2, "0")}${centerColor.b.toString(16).padStart(2, "0")}`
  const hexAlpha = `#${centerColor.r.toString(16).padStart(2, "0")}${centerColor.g.toString(16).padStart(2, "0")}${centerColor.b.toString(16).padStart(2, "0")}${centerColor.a.toString(16).padStart(2, "0")}`

  // Convert RGB to HSL (alpha preserved separately)
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  const hsl = rgbToHsl(centerColor.r, centerColor.g, centerColor.b)
  const hslaString = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${(centerColor.a / 255).toFixed(2)})`

  // Get brightness for contrast
  const getBrightness = (r: number, g: number, b: number) => {
    return (r * 299 + g * 587 + b * 114) / 1000
  }

  const brightness = getBrightness(centerColor.r, centerColor.g, centerColor.b)
  const alphaPercentage = Math.round((centerColor.a / 255) * 100)

  const copyToClipboard = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedValue(label)
      setTimeout(() => setCopiedValue(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [])

  const ColorValue: FC<{ label: string; value: string; shortLabel?: string }> = ({ label, value, shortLabel }) => (
    <div className="flex items-center justify-between group">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className="text-sm font-mono">{value}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
        onClick={() => copyToClipboard(value, shortLabel || label)}
      >
        {copiedValue === (shortLabel || label) ? (
          <Check className="h-3 w-3 text-green-500" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  )

  return (
    <>
      {/* <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="probe-clip-path" clipPathUnits="objectBoundingBox">
            <path d="M 1 0 L 1 1 L 0 1 L 0 0.2 Q 0 0 0.2 0 Z" />
          </clipPath>
        </defs>
      </svg> */}
      <Card
        ref={probeRef}
        className="w-80 shadow-lg border-2 bg-background/95 backdrop-blur-sm z-20"
        style={{ clipPath: "url(#probe-clip-path)" }}
      >
        <CardContent className="p-4 space-y-4">
          {/* Header with animated color swatch (with alpha) */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Checkerboard background for transparency visualization */}
              <div className="w-12 h-12 rounded-lg border-2 border-border shadow-sm bg-checkerboard" 
                   style={{
                     backgroundImage: `conic-gradient(#f0f0f0 90deg, #e0e0e0 90deg 180deg, #f0f0f0 180deg 270deg, #e0e0e0 270deg)`,
                     backgroundSize: '6px 6px'
                   }}>
                <motion.div
                  className="w-full h-full rounded-md"
                  animate={{ 
                    backgroundColor: rgbaString,
                  }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeInOut" 
                  }}
                />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-background border border-border rounded-full flex items-center justify-center">
                <Pipette className="h-2 w-2 text-muted-foreground" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Color Probe</div>
              <div className="text-xs text-muted-foreground">
                Position: {position.x}, {position.y}
              </div>
            </div>
          </div>

          {/* Color values with alpha */}
          <div className="space-y-3">
            <ColorValue label="HEX" value={hexColor.toUpperCase()} shortLabel="HEX" />
            {/* <ColorValue label="HEXA" value={hexAlpha.toUpperCase()} shortLabel="HEXA" /> */}
            {/* <ColorValue label="RGB" value={`${centerColor.r}, ${centerColor.g}, ${centerColor.b}`} shortLabel="RGB" /> */}
            <ColorValue label="RGBA" value={`${centerColor.r}, ${centerColor.g}, ${centerColor.b}, ${(centerColor.a / 255).toFixed(2)}`} shortLabel="RGBA" />
            {/* <ColorValue label="HSL" value={`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`} shortLabel="HSL" /> */}
            {/* <ColorValue label="HSLA" value={`${hsl.h}°, ${hsl.s}%, ${hsl.l}%, ${(centerColor.a / 255).toFixed(2)}`} shortLabel="HSLA" /> */}
          </div>

          {/* Kernel visualization with alpha */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {kernelSize}×{kernelSize} Pixel Sample
              </span>
              <span className="text-xs text-muted-foreground">
                Brightness: {Math.round(brightness)}
              </span>
            </div>

            <div
              className="grid gap-0.5 mx-auto w-fit p-2 bg-muted/30 rounded-md relative"
              style={{ gridTemplateColumns: `repeat(${kernelSize}, 1fr)` }}
            >
              {/* Checkerboard background for each pixel */}
              <div 
                className="absolute inset-2 grid gap-0.5"
                style={{ 
                  gridTemplateColumns: `repeat(${kernelSize}, 1fr)`,
                  backgroundImage: `conic-gradient(#f8f8f8 90deg, #eeeeee 90deg 180deg, #f8f8f8 180deg 270deg, #eeeeee 270deg)`,
                  backgroundSize: '4px 4px'
                }}
              />
              {kernel.map((color, i) => {
                const isCenterPixel = i === Math.floor(kernel.length / 2)
                const colorString = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`
                
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm transition-all hover:scale-110 relative z-10 ${
                      isCenterPixel
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-background z-20"
                        : "hover:ring-1 hover:ring-border"
                    }`}
                    style={{
                      backgroundColor: colorString,
                    }}
                    title={`RGBA(${color.r}, ${color.g}, ${color.b}, ${(color.a / 255).toFixed(2)})`}
                  />
                )
              })}
            </div>
          </div>

          {/* Color info with alpha */}
          <div className="pt-2 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Luminance</span>
                <div className="font-mono">{Math.round((brightness / 255) * 100)}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Alpha</span>
                <div className="font-mono">{alphaPercentage}%</div>
              </div>
              <div>
                <span className="text-muted-foreground">Opacity</span>
                <div className="font-mono">{centerColor.a === 255 ? "Opaque" : centerColor.a === 0 ? "Transparent" : "Translucent"}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export { ColorProbe }