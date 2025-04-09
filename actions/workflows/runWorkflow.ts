/**
 * Server action for executing a workflow
 * This action handles both manual execution of published workflows
 * and draft workflows with provided flow definitions
 */

"use server"

import prisma from "@/lib/prisma";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, WorkflowExecutionStatus, WorkflowExecutionTrigger, WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Executes a workflow either from its published state or with a provided flow definition
 * @param form - Object containing workflowId and optional flowDefinition
 * @throws Error if user is unauthorized, workflow not found, or execution plan generation fails
 * @redirects to the workflow execution details page on success
 */
export async function RunWorkflow(form: {
    workflowId: string;
    flowDefinition?: string
}) {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId) {
        throw new Error("unauthorized")
    }

    // Validate required parameters
    const {workflowId, flowDefinition} = form;
    if(!workflowId){
        throw new Error("workflow is required");
    }

    // Fetch the workflow and verify ownership
    const workflow = await prisma.workflow.findUnique({
        where:{
            userId,
            id: workflowId
        }
    });

    if(!workflow){
        throw new Error("workflow not defined");
    }

    // Handle execution plan generation based on workflow status
    let executionPlan: WorkflowExecutionPlan;
    let workflowDefinition = flowDefinition;
    
    if(workflow.status === WorkflowStatus.PUBLISHED){
        // For published workflows, use the stored execution plan
        if(!workflow.executionPlan){
            throw new Error("no execution plan found in published workflow")
        }
        executionPlan = JSON.parse(workflow.executionPlan);
        workflowDefinition = workflow.definition
    } else {
        // For draft workflows, generate execution plan from provided flow definition
        if(!flowDefinition) {
            throw new Error("flow definition is not defined")
        }
    
        const flow = JSON.parse(flowDefinition);
        const result = FlowToExecutionPlan(flow.nodes, flow.edges);
        if(result.error){
            throw new Error("flow definition not valid")
        }
    
        if(!result.executionPlan){
            throw new Error("no execution plan generated");
        }
    
        executionPlan = result.executionPlan;
    }
    
    // Create the workflow execution record
    const execution = await prisma.workflowExecution.create({
        data: {
            workflowId,
            userId,
            status: WorkflowExecutionStatus.PENDING,
            startedAt: new Date(),
            trigger: WorkflowExecutionTrigger.MANUAL,
            definition:workflowDefinition,
            phases:{
                create: executionPlan.flatMap(phase => {
                    return phase.nodes.flatMap((node) => {
                        return {
                            userId,
                            status: ExecutionPhaseStatus.CREATED,
                            number: phase.phase,
                            node: JSON.stringify(node),
                            name: TaskRegistry[node.data.type].label,
                        }
                    })
                })
            },
        },
        select:{
            id: true,
            phases: true
        }
    })

    if(!execution) {
        throw new Error("workflow execution not created")
    }

    // Start the workflow execution
    ExecuteWorkflow(execution.id);
    
    // Redirect to the execution details page
    redirect(`/workflow/runs/${workflowId}/${execution.id}`)
}