/**
 * Server action for retrieving daily workflow execution statistics
 * This action calculates success and failure counts for each day in a given period
 */

import { PeriodToDateRange } from "@/lib/helper/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { WorkflowExecutionStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { eachDayOfInterval, format } from "date-fns";

// Date format for consistent date string representation
const dateFormat = "yyyy-MM-dd"

// Type definition for daily execution statistics
type Stats = Record<string, {
    success: number,  // Count of successful executions
    failed: number    // Count of failed executions
}>

/**
 * Retrieves daily workflow execution statistics for a specific period
 * @param period - The time period to analyze
 * @returns Array of daily execution statistics
 * @throws Error if user is not found
 */
export async function GetWorkflowExecutionStats(period: Period) {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("user not found");
    }

    // Convert period to date range
    const daterange = PeriodToDateRange(period);

    // Fetch all executions within the date range
    const executions = await prisma.workflowExecution.findMany({
        where: {
            userId,
            startedAt:{
                gte: daterange.startDate,
                lte: daterange.endDate,
            }
        }
    });

    // Initialize stats object with all dates in the range
    const stats:Stats  = eachDayOfInterval({
        start: daterange.startDate,
        end: daterange.endDate
    })
    .map((date) => format(date,dateFormat))
    .reduce((acc,date) => {
        acc[date] = {
            success:0,
            failed:0
        };
        return acc;
    },{} as any);

    // Count successes and failures for each day
    executions.forEach(execution => {
        const date = format(execution.startedAt!, dateFormat);
        if(execution.status === WorkflowExecutionStatus.COMPLETED){
            stats[date].success += 1;
        }
        if(execution.status === WorkflowExecutionStatus.FAILED){
            stats[date].failed += 1;
        }
    })

    // Convert stats object to array format for easier consumption
    const results = Object.entries(stats).map(([date,infos]) => ({
        date,
        ...infos
    }));

    return results;
}