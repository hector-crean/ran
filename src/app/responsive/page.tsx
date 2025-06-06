"use client";
import { composeTransforms, getInverseTransform, getMatrixFromTransform, getTransformFromMatrix, ResponsiveContainer, useResponsiveContainer } from "@/components/ui/responsive-container";
import { closestCorners, DndContext, DragEndEvent, MeasuringStrategy, Modifier, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Mat4Like } from "gl-matrix";
import React, { useState } from 'react';

export default function ResponsivePage() {
    return (
        <ResponsiveContainer width={1920} height={1080} fit="contain" scale={true} containerClassname='w-full h-full'>
            <DragExample />
        </ResponsiveContainer>
    );
}



interface DroppableProps {
    id: string;
    children: React.ReactNode;
}

export function Droppable({ id, children }: DroppableProps) {
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
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </div>
    );
}





const accountForResponsive = (containerTransform: Mat4Like): Modifier => {
    return ({ transform, draggingNodeRect }) => {
        if (!draggingNodeRect) return transform;

        // Get the inverse of the container transform (P^T)
        const containerInverse = getInverseTransform(containerTransform);

        // Convert drag transform to matrix (A)
        const dragMatrix = getMatrixFromTransform(transform);

        // Apply similarity transformation: P^T * A * P
        const inLocalSpace = composeTransforms(containerInverse, dragMatrix);
        const backToScreenSpace = composeTransforms(inLocalSpace, containerTransform);

        // Get the final transform that accounts for both drag and container space
        const adjustedTransform = getTransformFromMatrix(backToScreenSpace);

        // Ensure we're returning a transform that DnD-kit can work with
        return adjustedTransform;
        // return transform
    };
};

interface DraggableItem {
    id: string;
    content: string;
}

function DragExample() {
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
        ],
        'container4': [
            { id: 'item-7', content: 'Item 7' },
            { id: 'item-8', content: 'Item 8' },
        ],
        'container5': [
            { id: 'item-9', content: 'Item 9' },
        ]
    });

    const responsiveMat4 = useResponsiveContainer();

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
        <div className="w-full h-full bg-gray-900 p-8">
            <DndContext
                onDragEnd={handleDragEnd}
                modifiers={[accountForResponsive(responsiveMat4)]}
                measuring={{
                    droppable: {
                        strategy: MeasuringStrategy.Always
                    }
                }}
                collisionDetection={closestCorners}
            >
                <div className="grid grid-cols-3 gap-8 w-full h-full">
                    {Object.entries(items).map(([containerId, containerItems]) => (
                        <Droppable key={containerId} id={containerId}>
                            <div className="bg-gray-800 rounded-lg p-4 min-h-[300px] flex flex-col gap-3">
                                <h3 className="text-lg font-semibold mb-2 text-white">Container {containerId.slice(-1)}</h3>
                                {containerItems.map((item) => (
                                    <Draggable key={item.id} id={item.id}>
                                        <div className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg shadow-lg transition-colors">
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
    );
}