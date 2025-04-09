/**
 * Server action for retrieving workflow execution statistics
 * This action calculates key metrics for workflow executions in a given period
 */

"use server"

import { PeriodToDateRange } from "@/lib/helper/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { WorkflowExecutionStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";

// Destructure relevant workflow execution statuses
const {COMPLETED,FAILED} = WorkflowExecutionStatus;

/**
 * Retrieves statistics about workflow executions for a specific period
 * @param period - The time period to analyze
 * @returns Object containing execution counts and credit consumption
 * @throws Error if user is not found
 */
export async function GetStatsCardsValues(period: Period) {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("user not found");
    }
    
    // Convert period to date range and fetch executions
    const dateRange = PeriodToDateRange(period);
    const executions = await prisma.workflowExecution.findMany({
        where: {
            userId,
            startedAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
            status: {
                in: [COMPLETED,FAILED]
            }
        },
        select: {
            creditsConsumed: true,
            phases: {
                where: {
                    creditsConsumed: {
                        not: null
                    }
                },
                select: { creditsConsumed:true}
            }
        }
    })

    // Initialize statistics object
    const stats = {
        workflowsExecution: executions.length,  // Total number of workflow executions
        creditsConsumed: 0,                     // Total credits consumed
        phaseExecutions: 0,                     // Total number of phase executions
    }

    // Calculate total credits consumed
    stats.creditsConsumed = executions.reduce(
        (sum,execution) => sum + execution.creditsConsumed,
        0
    );

    // Calculate total phase executions
    stats.phaseExecutions = executions.reduce(
        (sum,execution) => sum + execution.phases.length,
        0
    )

    return stats;
}


// {
//     "workflowsExecution": 46,
//     "creditsConsumed": 253,
//     "phaseExecutions": 70
// }