import React, { useState } from 'react';
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

interface SortableItemProps {
    id: string;
    text: string;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, text }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-gray-800 p-3 mb-2 rounded border border-cyan-500 text-cyan-50 cursor-grab active:cursor-grabbing font-mono">
            {text}
        </div>
    );
};

interface DragDropCodeProps {
    initialLines: { id: string, text: string }[];
    onOrderChange: (newOrder: { id: string, text: string }[]) => void;
}

export const DragAndDropCode: React.FC<DragDropCodeProps> = ({ initialLines, onOrderChange }) => {
    const [items, setItems] = useState<{ id: string, text: string }[]>(initialLines);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((i) => i.id === active.id);
            const newIndex = items.findIndex((i) => i.id === over.id);
            const newOrder = arrayMove(items, oldIndex, newIndex);
            setItems(newOrder);
            onOrderChange(newOrder);
        }
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="bg-gray-900 border border-purple-600 rounded-lg p-6 max-w-2xl mx-auto shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <h2 className="text-xl font-bold text-white mb-4">Rearrange the statements:</h2>
                    {items.map((item) => (
                        <SortableItem key={item.id} id={item.id} text={item.text} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
