/**
 * API endpoint for executing workflows
 * Handles both manual and scheduled workflow executions
 */

import prisma from "@/lib/prisma";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, WorkflowExecutionStatus, WorkflowExecutionTrigger } from "@/types/workflow";
import { timingSafeEqual } from "crypto";
import { CronExpressionParser } from "cron-parser"

/**
 * Validates the API secret using timing-safe comparison
 * @param secret - The secret to validate
 * @returns boolean indicating if the secret is valid
 */
function isValidSecret(secret: string){
    const API_SECRET = process.env.API_SECRET;
    if(!API_SECRET) return false;

    try {
        return timingSafeEqual(Buffer.from(secret),Buffer.from(API_SECRET));
    } catch (error) {
        return false;
    }
}

/**
 * GET endpoint for executing a workflow
 * Validates authentication and creates a new workflow execution
 */
export async function GET(request:Request) {
    // Validate authentication header
    const authHeader = request.headers.get("authorization");

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return Response.json({error: "Unauthorized"}, {status: 401});
    }

    const secret = authHeader.split(" ")[1];
    if(!isValidSecret(secret)){
        return Response.json({error: "Unauthorized"},{status: 401});
    }

    // Extract workflow ID from query parameters
    const {searchParams} = new URL(request.url);
    const workflowId = searchParams.get("workflowId") as string;

    if(!workflowId){
        return Response.json({error: "bad request"},{status: 400});
    }

    // Fetch workflow details from database
    const workflow = await prisma.workflow.findUnique({
        where:{
            id: workflowId
        }
    })

    if(!workflow){
        return Response.json({error: "bad request"},{status: 400});
    }

    // Parse workflow execution plan
    const executionPlan = JSON.parse(workflow.executionPlan!) as WorkflowExecutionPlan;

    if(!executionPlan){
        return Response.json({error: "bad request"},{status: 400});
    }

    try {
        // Calculate next execution time based on cron schedule
        const cron = CronExpressionParser.parse(workflow.cron!, { tz: 'UTC' });
        const nextRun = cron.next().toDate();
   
        // Create new workflow execution record
        const execution = await prisma.workflowExecution.create({
            data: {
                workflowId,
                userId: workflow.userId,
                definition: workflow.definition,
                status: WorkflowExecutionStatus.PENDING,
                startedAt: new Date(),
                trigger: WorkflowExecutionTrigger.CRON,
                phases:{
                    create: executionPlan.flatMap(phase => {
                        return phase.nodes.flatMap((node) => {
                            return {
                                userId:workflow.userId,
                                status: ExecutionPhaseStatus.CREATED,
                                number: phase.phase,
                                node: JSON.stringify(node),
                                name: TaskRegistry[node.data.type].label,
                            }
                        })
                    })
                },
            }
        })

        // Execute the workflow
        await ExecuteWorkflow(execution.id,nextRun);
        return new Response(null, {status: 200});
    } catch (error) {
        return Response.json({error: "Internal server error"},{status: 500});
    }
}