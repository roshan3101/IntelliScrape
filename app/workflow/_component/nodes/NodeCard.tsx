"use client"

import { useReactFlow } from '@xyflow/react';
import React from 'react'

interface NodeCardProps {
    data: {
        label: string;
        type: string;
        description?: string;
        icon?: string;
    };
    selected: boolean;
}

function NodeCard({
    data,
    selected
}: NodeCardProps) {
    const { setNodes } = useReactFlow();
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        if (event.dataTransfer) {
            event.dataTransfer.setData('application/reactflow', nodeType);
            event.dataTransfer.effectAllowed = 'move';
        }
    };

    return (
        <div
            className={`p-3 border rounded-lg shadow-sm cursor-move hover:shadow-md transition-shadow ${
                selected ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            draggable
            onDragStart={(e) => onDragStart(e, data.type)}
        >
            <div className="flex items-center gap-2">
                {data.icon && <div className="text-primary">{data.icon}</div>}
                <div>
                    <h3 className="font-medium">{data.label}</h3>
                    {data.description && (
                        <p className="text-sm text-muted-foreground">{data.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NodeCard;