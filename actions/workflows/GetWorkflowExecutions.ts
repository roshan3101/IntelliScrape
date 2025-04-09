/**
 * Server action for retrieving workflow executions
 * This action fetches all executions for a specific workflow
 */

"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"

/**
 * Retrieves all executions for a specific workflow
 * @param workflowId - The ID of the workflow to get executions for
 * @returns Array of workflow executions ordered by creation date
 * @throws Error if user is unauthenticated
 */
export async function GetWorkflowExecutions(workflowId:string) {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Fetch and return workflow executions
    return prisma.workflowExecution.findMany({
        where: {
            workflowId,
            userId
        },
        orderBy:{
            createdAt: "desc"
        }
    })
}