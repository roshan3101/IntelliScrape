/**
 * Server action for retrieving phases of a workflow execution
 * This action fetches all phases associated with a specific execution
 */

"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"

/**
 * Retrieves all phases for a specific workflow execution
 * @param executionId - The ID of the workflow execution to get phases for
 * @returns Workflow execution with ordered phases
 * @throws Error if user is unauthenticated
 */
export async function GetWorkflowExecutionPhase(executionId: string) {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("unauthenticated");
    }

    // Fetch and return execution with ordered phases
    return prisma.workflowExecution.findUnique({
        where: {
            id: executionId,
            userId,
        },
        include: {
            phases: {
                orderBy:{
                    number: "asc"
                }
            }
        }
    })
}