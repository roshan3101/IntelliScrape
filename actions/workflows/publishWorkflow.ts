/**
 * Server action for publishing a workflow
 * This action handles the transition of a workflow from draft to published status,
 * including validation of the flow definition and calculation of credit costs
 */

"use server"

import prisma from "@/lib/prisma";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { CalculateWorkflowCost } from "@/lib/workflow/helpers";
import { WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache";

/**
 * Publishes a workflow by updating its status and generating an execution plan
 * @param id - The ID of the workflow to publish
 * @param flowDefinition - The workflow flow definition to validate and publish
 * @throws Error if user is unauthenticated, workflow not found, workflow is not a draft,
 *         flow definition is invalid, or no execution plan can be generated
 */
export async function PublishWorkflow({
    id,
    flowDefinition,
}: {
    id: string,
    flowDefinition: string
}) {
    // Get the authenticated user's ID
    const { userId } =await auth();
    if(!userId){
        throw new Error("unauthenticated")
    }

    // Verify the workflow exists and belongs to the user
    const workflow = await prisma.workflow.findUnique({
        where: {
            id,
            userId
        }
    });

    if(!workflow){
        throw new Error("workflow not found")
    }

    // Ensure the workflow is in draft status before publishing
    if(workflow.status !== WorkflowStatus.DRAFT){
        throw new Error("workflow is not a draft")
    }

    // Parse and validate the flow definition
    const flow = JSON.parse(flowDefinition);
    const result = FlowToExecutionPlan(flow.nodes,flow.edges);
    if(result.error){
        throw new Error("flow definition not valid")
    }

    if(!result.executionPlan){
        throw new Error("no execution plan generated");
    }

    // Calculate the credit cost for the workflow
    const creditsCost = CalculateWorkflowCost(flow.nodes);

    // Update the workflow with the new status and execution plan
    await prisma.workflow.update({
        where:{
            id,
            userId
        },
        data:{
            definition: flowDefinition,
            executionPlan: JSON.stringify(result.executionPlan),
            creditsCost,
            status: WorkflowStatus.PUBLISHED
        }
    })

    // Revalidate the workflow editor page to reflect changes
    revalidatePath(`/workflow/editor?id=${id}`);
}