/**
 * Server action for unpublishing a workflow
 * This action transitions a workflow from published to draft status,
 * clearing its execution plan and credit cost
 */

"use server"

import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

/**
 * Unpublishes a workflow by changing its status to draft
 * @param id - The ID of the workflow to unpublish
 * @throws Error if user is unauthenticated, workflow not found, or workflow is not published
 */
export async function UnpublishWorkflow(id: string){
    // Get the authenticated user's ID
    const {userId} = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Fetch the workflow and verify ownership
    const workflow = await prisma.workflow.findUnique({
        where:{
            id,userId
        }
    });

    if(!workflow){
        throw new Error("workflow is not found")
    }

    // Ensure the workflow is in published status
    if(workflow.status !== WorkflowStatus.PUBLISHED){
        throw new Error("workflow is not published")
    }

    // Update the workflow to draft status and clear execution-related data
    await prisma.workflow.update({
        where:{
            id,
            userId
        },
        data:{
            status: WorkflowStatus.DRAFT,
            executionPlan: null,
            creditsCost: 0
        }
    });

    // Revalidate the workflow editor page to reflect changes
    revalidatePath(`/workflow/editor/${id}`);
}