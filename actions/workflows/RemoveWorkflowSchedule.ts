/**
 * Server action for removing a workflow's scheduled execution
 * This action clears the cron schedule and next run time for a workflow
 */

"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

/**
 * Removes the scheduled execution settings from a workflow
 * @param id - The ID of the workflow to remove the schedule from
 * @throws Error if user is unauthenticated
 */
export async function RemoveWorkflowSchedule (id: string) {
    // Get the authenticated user's ID
    const {userId} = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Clear the workflow's schedule settings
    await prisma.workflow.update({
        where:{
            id,
            userId
        },
        data:{
            cron: null,
            nextRunAt: null,
        }
    })

    // Revalidate the workflows page to reflect changes
    revalidatePath('/workflows')
}