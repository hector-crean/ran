"use client";

import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import React, { useState } from 'react';

// The container that uses container queries
const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            className="w-full h-full"
            style={{
                containerType: 'size',
                containerName: 'responsive'
            }}
        >
            <div className="w-full h-full">
                {children}
            </div>
        </div>
    );
};

interface DroppableProps {
    id: string;
    children: React.ReactNode;
}

function Droppable({ id, children }: DroppableProps) {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });
    const style = {
        borderStyle: 'dashed',
        borderWidth: '2px',
        borderColor: isOver ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
        transition: 'border-color 0.2s ease',
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full">
            {children}
        </div>
    );
}

interface DraggableProps {
    id: string;
    children: React.ReactNode;
}

function Draggable({ id, children }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
    });
    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </div>
    );
}

interface DraggableItem {
    id: string;
    content: string;
}

export default function ContainerQueryExample() {
    const mouseSensor = useSensor(MouseSensor);
    const touchSensor = useSensor(TouchSensor);
    const sensors = useSensors(mouseSensor, touchSensor);

    const [items, setItems] = useState<{ [key: string]: DraggableItem[] }>({
        'container1': [
            { id: 'item-1', content: 'Item 1' },
            { id: 'item-2', content: 'Item 2' },
        ],
        'container2': [
            { id: 'item-3', content: 'Item 3' },
            { id: 'item-4', content: 'Item 4' },
        ],
        'container3': [
            { id: 'item-5', content: 'Item 5' },
            { id: 'item-6', content: 'Item 6' },
        ]
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const sourceContainer = Object.keys(items).find(key =>
            items[key].find(item => item.id === active.id)
        );

        const destinationContainer = over.id as string;

        if (sourceContainer && destinationContainer !== sourceContainer) {
            setItems(prev => {
                const sourceItems = [...prev[sourceContainer]];
                const destItems = [...prev[destinationContainer]];

                const [movedItem] = sourceItems.splice(
                    sourceItems.findIndex(item => item.id === active.id),
                    1
                );

                destItems.push(movedItem);

                return {
                    ...prev,
                    [sourceContainer]: sourceItems,
                    [destinationContainer]: destItems,
                };
            });
        }
    };

    return (
        <ResponsiveContainer>
            <div className="w-full h-full bg-gray-900 p-8">
                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full h-full @container">
                        {/* Items scale based on container size */}
                        <style jsx>{`
              @container (min-width: 800px) {
                .card {
                  font-size: 1.2rem;
                  padding: 2rem;
                }
              }
              @container (max-width: 799px) {
                .card {
                  font-size: 1rem;
                  padding: 1rem;
                }
              }
            `}</style>

                        {Object.entries(items).map(([containerId, containerItems]) => (
                            <Droppable key={containerId} id={containerId}>
                                <div className="bg-gray-800 rounded-lg p-4 min-h-[200px] flex flex-col gap-3">
                                    <h3 className="text-lg font-semibold mb-2 text-white">Container {containerId.slice(-1)}</h3>
                                    {containerItems.map((item) => (
                                        <Draggable key={item.id} id={item.id}>
                                            <div className="card bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg transition-all">
                                                {item.content}
                                            </div>
                                        </Draggable>
                                    ))}
                                    {containerItems.length === 0 && (
                                        <div className="text-gray-400 text-center py-12">
                                            Drop items here
                                        </div>
                                    )}
                                </div>
                            </Droppable>
                        ))}
                    </div>
                </DndContext>
            </div>
        </ResponsiveContainer>
    );
} 