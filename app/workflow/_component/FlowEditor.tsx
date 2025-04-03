"use client"

import { Workflow } from '@prisma/client'
import { Background, BackgroundVariant, Controls, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react'
import React from 'react'

import "@xyflow/react/dist/style.css"
import { CreateFlowNode } from '@/lib/workflow/createFlowNode'
import { TaskType } from '@/types/task'
import NodeComponent from './nodes/NodeComponent'

const NodeTypes = {
    FlowScrapeNode: NodeComponent,
}

function FlowEditor({workflow}:{workflow:Workflow}) {

    const [nodes,setNodes,onNodesChange] = useNodesState([
        CreateFlowNode(TaskType.LAUNCH_BROWSER),
    ]);
    const [edges,setEdges,onEgdesChange] = useEdgesState([]);

    const snapGrid:[number,number] = [50,50];
    const fitviewOptions = {
        padding:1
    }

  return (
        <main className='h-full w-full'>
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onEdgesChange={onEgdesChange}
            onNodesChange={onNodesChange}
            nodeTypes={NodeTypes}
            snapToGrid
            snapGrid={snapGrid}
            fitView
            fitViewOptions={fitviewOptions}
            >
               <Controls position='top-left' />
               <Background variant={BackgroundVariant.Dots} gap={12} size={1} /> 
            </ReactFlow>
        </main>
    )
}

export default FlowEditor