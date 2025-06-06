"use client";
import { composeTransforms, getInverseTransform, getMatrixFromTransform, getTransformFromMatrix, useResponsiveContainer } from "@/components/ui/responsive-container";
import { DndContext, DragEndEvent, getClientRect, KeyboardSensor, MeasuringStrategy, Modifier, MouseSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Mat4Like } from "gl-matrix";
import { ComponentPropsWithoutRef, useMemo, useState } from 'react';



interface DroppableProps extends ComponentPropsWithoutRef<'div'> {
    id: string;
}

function Droppable({ id, children, style, ...props }: DroppableProps) {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });
    const s = {
        ...style,
        borderStyle: 'dashed',
        borderWidth: '2px',
        borderColor: isOver ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
        transition: 'border-color 0.2s ease',
    };

    return (
        <div ref={setNodeRef} style={s}  {...props}>
            {children}
        </div>
    );
}

interface DraggableProps extends ComponentPropsWithoutRef<'div'> {
    id: string;
}

function Draggable({ id, children, style, ...props }: DraggableProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id
    });

    const transform3d = useMemo(() => {
        return CSS.Translate.toString(transform)
    }, [transform])

    console.log(transform3d);

    const s = {
        ...style,
        transform: transform ? transform3d : undefined,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    return (
        <div ref={setNodeRef} style={s} {...listeners} {...attributes} {...props}>
            {children}
        </div>
    );
}





const coordinateSystemModifier = (containerTransform: Mat4Like): Modifier => {
    return ({ transform, draggingNodeRect, active, over, overlayNodeRect }) => {


        // If there's no transform, return as is
        if (!transform) return transform;

        if (draggingNodeRect) {
            // Get the inverse of the container transform (P^T)
            const containerInverse = getInverseTransform(containerTransform);

            // Convert drag transform to matrix (A)
            const dragMatrix = getMatrixFromTransform(transform);

            // Apply similarity transformation: P^-1 * A * P
            const inLocalSpace = composeTransforms(containerInverse, dragMatrix);
            const backToScreenSpace = composeTransforms(inLocalSpace, containerTransform);

            // Get the final transform that accounts for both drag and container space
            const adjustedTransform = getTransformFromMatrix(backToScreenSpace);


            return adjustedTransform;
        }



        return transform;

    };
};


interface DraggableItem {
    id: string;
    content: string;
}

function DragExample() {

    const mouseSensor = useSensor(MouseSensor);
    const touchSensor = useSensor(TouchSensor);
    const keyboardSensor = useSensor(KeyboardSensor);

    const sensors = useSensors(
        mouseSensor,
        touchSensor,
        keyboardSensor,
    );



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
        <div className="w-full h-full bg-gray-900 p-8 overflow-hidden">
            <DndContext
                sensors={sensors}
                onDragEnd={handleDragEnd}
                modifiers={[coordinateSystemModifier(responsiveMat4)]}
                measuring={{
                    droppable: {
                        strategy: MeasuringStrategy.Always,
                        measure: getClientRect

                    }
                }}
            // collisionDetection={createResponsiveCollisionDetection(responsiveMat4)}
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

export { DragExample };

