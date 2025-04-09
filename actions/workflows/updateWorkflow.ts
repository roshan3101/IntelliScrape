/**
 * Server action for updating an existing workflow
 * This action handles updating the workflow definition while ensuring
 * proper authorization and workflow status validation
 */

"use server"

import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Updates the definition of an existing workflow
 * @param id - The ID of the workflow to update
 * @param definition - The new workflow definition
 * @throws Error if user is unauthorized, workflow not found, or workflow is not in draft status
 */
export async function UpdateWorkflow({
    id,
    definition
}: {
    id: string;
    definition: string;
}) {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId) {
        throw new Error("unauthorized");
    }

    // Verify the workflow exists and belongs to the user
    const workflow = await prisma.workflow.findUnique({
        where: {
            id,
            userId,
        }
    })

    if(!workflow){
        throw new Error("workflow not found")
    }

    // Ensure the workflow is in draft status before allowing updates
    if(workflow.status !== WorkflowStatus.DRAFT){
        throw new Error("Workflow is not a draft")
    }

    // Update the workflow definition
    await prisma.workflow.update({
        data:{
            definition,
        },
        where:{
            id,
            userId
        }
    })

    // Revalidate the workflows page to reflect changes
    revalidatePath("/workflows")
}