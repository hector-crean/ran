"use client"

import { useState } from "react"
import { DragDropGrid, GridConfig, Item } from "../../components/drag-drop"

const customItems: Item[] = [
    {
        id: "red-square",
        name: "Red",
        width: 1,
        height: 1,
        x: 0,
        y: 0,
        data: { color: "red" }
    },
    {
        id: "blue-rectangle",
        name: "Blue",
        width: 2,
        height: 1,
        x: 2,
        y: 0,
        data: { color: "blue" }
    },
    {
        id: "green-tall",
        name: "Green",
        width: 1,
        height: 3,
        x: 0,
        y: 2,
        data: { color: "green" }
    }
]

export default function DragDropDemoPage() {
    const [selectedConfig, setSelectedConfig] = useState<"small" | "medium" | "large">("medium")
    const [restrictColors, setRestrictColors] = useState(false)

    const configs: Record<string, GridConfig> = {
        small: {
            rows: 6,
            cols: 6,
            cellSize: 30,
            gap: 1
        },
        medium: {
            rows: 10,
            cols: 10,
            cellSize: 42,
            gap: 2
        },
        large: {
            rows: 15,
            cols: 15,
            cellSize: 25,
            gap: 1
        }
    }

    // Custom predicate function that restricts certain colors to certain areas
    const restrictedCanAcceptItem = (item: Item, gridX: number, gridY: number): boolean => {
        if (!restrictColors) return true

        const itemColor = item.data?.color

        // Red items can only be placed in the top-left quadrant
        if (itemColor === "red") {
            const config = configs[selectedConfig]
            return gridX < config.cols / 2 && gridY < config.rows / 2
        }

        // Blue items can only be placed in the right half
        if (itemColor === "blue") {
            const config = configs[selectedConfig]
            return gridX >= config.cols / 2
        }

        // Green items can only be placed in the bottom half
        if (itemColor === "green") {
            const config = configs[selectedConfig]
            return gridY >= config.rows / 2
        }

        return true
    }

    const handleItemMove = (item: Item, newPosition: { x: number; y: number }) => {
        console.log(`Item ${item.name} moved to position (${newPosition.x}, ${newPosition.y})`)
    }

    return (
        <div className="p-8 space-y-8">
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Configurable Drag & Drop Grid Demo</h1>

                <div className="flex gap-4 items-center">
                    <label className="font-semibold">Grid Size:</label>
                    <select
                        value={selectedConfig}
                        onChange={(e) => setSelectedConfig(e.target.value as "small" | "medium" | "large")}
                        className="px-3 py-1 border rounded"
                    >
                        <option value="small">Small (6x6)</option>
                        <option value="medium">Medium (10x10)</option>
                        <option value="large">Large (15x15)</option>
                    </select>
                </div>

                <div className="flex gap-4 items-center">
                    <label className="font-semibold">
                        <input
                            type="checkbox"
                            checked={restrictColors}
                            onChange={(e) => setRestrictColors(e.target.checked)}
                            className="mr-2"
                        />
                        Restrict items by color
                    </label>
                </div>

                {restrictColors && (
                    <div className="text-sm text-gray-600 space-y-1">
                        <p>• Red items can only be placed in the top-left quadrant</p>
                        <p>• Blue items can only be placed in the right half</p>
                        <p>• Green items can only be placed in the bottom half</p>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Current Configuration:</h2>
                <div className="text-sm text-gray-600">
                    <p>Rows: {configs[selectedConfig].rows}</p>
                    <p>Columns: {configs[selectedConfig].cols}</p>
                    <p>Cell Size: {configs[selectedConfig].cellSize}px</p>
                    <p>Gap: {configs[selectedConfig].gap}px</p>
                </div>
            </div>

            <div className="border border-gray-300 rounded p-4 inline-block">
                <DragDropGrid
                    items={customItems}
                    config={configs[selectedConfig]}
                    canAcceptItem={restrictColors ? restrictedCanAcceptItem : undefined}
                    onItemMove={handleItemMove}
                    className="shadow-lg"
                />
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Features Demonstrated:</h2>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong>Configurable Grid:</strong> Switch between different grid sizes and cell dimensions</li>
                    <li><strong>Custom Predicate Functions:</strong> Toggle color restrictions to see how drop zones can have custom logic</li>
                    <li><strong>Visual Feedback:</strong> Green highlights show valid drop zones, red shows invalid ones</li>
                    <li><strong>Drag Previews:</strong> See ghost images of original position and drop target</li>
                    <li><strong>Modular Components:</strong> Each part (grid, items, cells) is a separate component</li>
                    <li><strong>Type Safety:</strong> Full TypeScript support with proper typing</li>
                </ul>
            </div>
        </div>
    )
} 