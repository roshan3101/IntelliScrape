/**
 * Server action for duplicating an existing workflow
 * This action creates a new workflow based on an existing one,
 * copying its definition while allowing customization of name and description
 */

"use server"

import prisma from "@/lib/prisma";
import { duplicateWorkflowSchema, duplicateWorkflowSchemaType } from "@/schema/workflow";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a duplicate of an existing workflow
 * @param form - Form data containing the source workflow ID and new workflow details
 * @throws Error if form validation fails, user is unauthenticated, source workflow not found,
 *         or duplication fails
 */
export async function DuplicateWorkflow(form: duplicateWorkflowSchemaType) {
    // Validate the form data against the schema
    const {success, data} = duplicateWorkflowSchema.safeParse(form);
    if(!success){
        throw new Error("invalid form data")
    }

    // Get the authenticated user's ID
    const {userId} = await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Fetch the source workflow and verify ownership
    const sourceWorkflow = await prisma.workflow.findUnique({
        where: {
            id: data.workflowId,
            userId
        }
    })

    if(!sourceWorkflow){
        throw new Error("workflow not found")
    }

    // Create a new workflow with the source workflow's definition
    const result = await prisma.workflow.create({
        data:{
            userId,
            name: data.name,
            description: data.description,
            status: WorkflowStatus.DRAFT,
            definition: sourceWorkflow.definition,
        }
    })

    if(!result){
        throw new Error("failed to duplicate workflow")
    }

    // Revalidate the workflows page to reflect changes
    revalidatePath('/workflows');
}