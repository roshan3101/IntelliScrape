/**
 * Server action for updating a workflow's cron schedule
 * This action handles the validation and update of cron expressions
 * for workflow scheduling
 */

"use server"

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { CronExpressionParser } from "cron-parser"
import { revalidatePath } from "next/cache";

/**
 * Updates the cron schedule for a workflow
 * @param id - The ID of the workflow to update
 * @param cron - The new cron expression for scheduling
 * @throws Error if user is unauthenticated or cron expression is invalid
 */
export async function UpdateWorkflowCron ({
    id,
    cron,
}: {
    id: string;
    cron: string;
}) {
    // Get the authenticated user's ID
    const {userId} = await auth();
    if(!userId){
        throw new Error("unauthenticated");
    }

    try {
        // Validate and parse the cron expression
        const interval = CronExpressionParser.parse(cron, { tz: 'UTC' })

        // Update the workflow with the new cron schedule and next run time
        await prisma.workflow.update({
            where:{
                id, userId
            },
            data:{
                cron,
                nextRunAt: interval.next().toDate(),
            }
        })

    } catch (error:any) {
        // Log and handle invalid cron expressions
        console.error("invalid cron",error.message);
        throw new Error("invalid cron expression")
    }

    // Revalidate the workflows page to reflect changes
    revalidatePath(`/workflows`)
}