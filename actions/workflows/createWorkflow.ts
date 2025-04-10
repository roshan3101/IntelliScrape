/**
 * Server action for creating a new workflow
 * This action handles the creation of a new workflow with initial configuration
 * and sets up the basic flow structure with a launch browser node
 */

"use server"

import prisma from "@/lib/prisma";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { createWorkflowSchema, createWorkflowSchemaType } from "@/schema/workflow";
import { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { Edge } from "@xyflow/react";

/**
 * Creates a new workflow with initial configuration
 * @param form - Form data containing workflow details
 * @returns The created workflow object
 * @throws Error if form validation fails, user is unauthorized, or workflow creation fails
 */
export async function CreateWorkflow(
    form: createWorkflowSchemaType
){
    // Validate the form data against the schema
    const {success,data} = createWorkflowSchema.safeParse(form);
    if(!success) {
        throw new Error("invalid form data");
    }

    // Get the authenticated user's ID
    const {userId} = await auth();
    if(!userId){
        throw new Error("unauthorized");
    }

    // Initialize the workflow flow with empty nodes and edges
    const initialFlow: {nodes:AppNode[],edges: Edge[]} = {
        nodes: [],
        edges: [],
    }

    // Add the initial launch browser node to the flow
    initialFlow.nodes.push(CreateFlowNode(TaskType.LAUNCH_BROWSER))

    // Create the workflow in the database
    const result = await prisma.workflow.create({
        data:{
            userId,
            status: WorkflowStatus.DRAFT,
            definition: JSON.stringify(initialFlow),
            ...data,
        }
    })

    if(!result){
        throw new Error("failed to create workflow")
    }

    return result;
} 