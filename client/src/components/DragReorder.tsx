import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LineItem {
    id: string;
    content: string;
}

interface DragReorderProps {
    initialLines: LineItem[];
    onOrderChange: (orderedLines: LineItem[]) => void;
}

interface SortableItemProps {
    id: string;
    content: string;
    index: number;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, content, index }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative flex items-center p-4 mb-3 rounded-lg border cursor-grab select-none
        ${isDragging ? 'z-50 shadow-2xl opacity-90 scale-105 border-cyan-400 bg-gray-800' : 'border-gray-700 bg-gray-900'}
        hover:border-cyan-500 hover:shadow-[0_0_10px_rgba(0,255,255,0.2)]
        transition-colors duration-200 ease-in-out`}
        >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-cyan-900/50 text-cyan-400 text-sm font-mono mr-4 border border-cyan-800/50 flex-shrink-0">
                {index + 1}
            </div>
            <pre className="text-gray-200 font-mono text-sm m-0 whitespace-pre overflow-x-hidden text-left flex-1">
                {content}
            </pre>

            {/* Drag handle icon */}
            <div className="ml-4 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
            </div>
        </div>
    );
};

export const DragReorder: React.FC<DragReorderProps> = ({ initialLines, onOrderChange }) => {
    const [items, setItems] = useState<LineItem[]>(initialLines);

    // Update internal state if props change entirely
    useEffect(() => {
        setItems(initialLines);
    }, [initialLines]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newOrdered = arrayMove(items, oldIndex, newIndex);

                // Notify parent component of order change
                onOrderChange(newOrdered);
                return newOrdered;
            });
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-gray-950 rounded-xl border border-gray-800 shadow-2xl">
            <div className="mb-6 flex justify-between items-center border-b border-gray-800 pb-4">
                <h3 className="text-xl font-bold font-mono text-cyan-400 flex items-center gap-2">
                    <span>&lt;/&gt;</span> Arrange Logic Sequence
                </h3>
                <div className="text-sm font-mono text-gray-400">
                    Lines: <span className="text-cyan-400">{items.length}</span>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col">
                        {items.map((item, index) => (
                            <SortableItem
                                key={item.id}
                                id={item.id}
                                content={item.content}
                                index={index}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default DragReorder;
