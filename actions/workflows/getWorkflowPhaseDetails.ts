/**
 * Server action for retrieving detailed information about a workflow execution phase
 * This action fetches phase details including associated logs
 */

"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"

/**
 * Retrieves detailed information about a specific workflow execution phase
 * @param phaseId - The ID of the execution phase to get details for
 * @returns Phase details including ordered logs
 * @throws Error if user is unauthorized
 */
export async function GetWorkflowPhaseDetails(phaseId: string){
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("unauthorized");
    }

    // Fetch and return phase details with logs
    return prisma.executionPhase.findUnique({
        where: {
            id: phaseId,
            execution: {
                userId
            }
        },
        include:{
            logs: {
                orderBy: {
                    timestamp: "asc"
                }
            }
        }
    })
}