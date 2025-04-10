"use client"

import { Workflow } from '@prisma/client'
import { addEdge, Background, BackgroundVariant, Connection, Controls, Edge, getOutgoers, ReactFlow, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react'
import React, { useCallback, useEffect } from 'react'

import "@xyflow/react/dist/style.css"
import { CreateFlowNode } from '@/lib/workflow/createFlowNode'
import { TaskType } from '@/types/task'
import NodeComponent from './nodes/NodeComponent'
import { AppNode } from '@/types/appNode'
import DeletableEdges from './edges/DeletableEdges'
import { TaskRegistry } from '@/lib/workflow/task/registry'

const NodeTypes = {
    FlowScrapeNode: NodeComponent,
}

const EdgeTypes = {
    default: DeletableEdges,
}

const snapGrid:[number,number] = [50,50];
const fitviewOptions = {
    padding:1
}


function FlowEditor({workflow}:{workflow:Workflow}) {

    const [nodes,setNodes,onNodesChange] = useNodesState<AppNode>([
        // CreateFlowNode(TaskType.LAUNCH_BROWSER),
    ]);
    const [edges,setEdges,onEgdesChange] = useEdgesState<Edge>([]);
    const {setViewport,screenToFlowPosition,updateNodeData} = useReactFlow();

    useEffect(() => {
        try {
            const flow = JSON.parse(workflow.definition);
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            setViewport(flow.viewport || { x: 0, y: 0, zoom: 1 });
        } catch {
            console.error("Failed to parse flow data");
        }
    }, [workflow.definition, setNodes, setEdges, setViewport]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    },[])

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const taskType = event.dataTransfer.getData("application/reactflow");
        if(typeof taskType === undefined || !taskType) return;


        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY
        })

        const newNode = CreateFlowNode(taskType as TaskType, position);
        setNodes((nds)=> nds.concat(newNode));
    },[screenToFlowPosition,setNodes])

    const onConnect = useCallback((connection : Connection) => {
        // First add the edge
        setEdges((egs) => addEdge({...connection,animated:true},egs));
        
        // Then update the node data if we have a target handle
        if(!connection.targetHandle) return;
        
        // Use a timeout to ensure the edge is added first
        const node = nodes.find((nd) => nd.id === connection.target);
        if(!node) return;
        const nodeInputs = node.data.inputs;
        updateNodeData(node.id,{
            inputs: {
                ...nodeInputs,
                [connection.targetHandle]:"",
            }
        })
    }, [setEdges, updateNodeData, nodes]);

    const isValidConnection = useCallback((connection:Edge | Connection) => {
        //No self connection allowed
        if(connection.source === connection.target) return false;

        //Same taskParam type connection
        const source = nodes.find((node)=> node.id === connection.source);
        const target = nodes.find((node) => node.id === connection.target);
        if(!source || !target){
            console.error("invalid connection: source and target node not found");
            return false;
        }

        const sourceTask = TaskRegistry[source.data.type];
        const targetTask = TaskRegistry[target.data.type];

        const output = sourceTask.outputs.find(
            (o) => o.name === connection.sourceHandle
        )

        const input = targetTask.inputs.find(
            (o) => o.name === connection.targetHandle
        )

        if(input?.type !== output?.type){
            console.log("invalid connection: type mismatch");
            return false;
        }

        const hasCycle = (node:AppNode, visited = new Set()) => {
            if(visited.has(node.id)) return false;
            visited.add(node.id);

            for(const outgoer of getOutgoers(node,nodes,edges)) {
                if(outgoer.id === connection.source) return true;
                if(hasCycle(outgoer,visited)) return true;
            }
        };

        const detectedCycle = hasCycle(target);
        return !detectedCycle;

    },[nodes,edges])

  return (
        <main className='h-full w-full'>
            <ReactFlow
            nodes={nodes}
            edges={edges}
            onEdgesChange={onEgdesChange}
            onNodesChange={onNodesChange}
            nodeTypes={NodeTypes}
            edgeTypes={EdgeTypes}
            snapToGrid
            snapGrid={snapGrid}
            fitViewOptions={fitviewOptions}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            >
               <Controls position='top-left' />
               <Background variant={BackgroundVariant.Dots} gap={12} size={1} /> 
            </ReactFlow>
        </main>
    )
}

export default FlowEditor