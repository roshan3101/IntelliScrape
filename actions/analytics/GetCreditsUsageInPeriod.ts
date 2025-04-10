/**
 * Server action for retrieving credit usage statistics over a specified period
 * This action calculates daily credit consumption for both successful and failed executions
 */

import { PeriodToDateRange } from "@/lib/helper/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { eachDayOfInterval, format } from "date-fns";

// Date format for consistent date string representation
const dateFormat = "yyyy-MM-dd"

// Type definition for credit usage statistics
type Stats = Record<string, {
    success: number,  // Credits consumed by successful executions
    failed: number    // Credits consumed by failed executions
}>

/**
 * Retrieves credit usage statistics for a specified time period
 * @param period - The time period to analyze (e.g., last 7 days, last 30 days)
 * @returns Array of daily credit usage statistics
 * @throws Error if user is not found
 */
export async function GetCreditsUsageInPeriod(period: Period) {
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("user not found");
    }

    // Convert period to date range
    const daterange = PeriodToDateRange(period);

    // Destructure execution phase statuses for cleaner code
    const {COMPLETED,FAILED} = ExecutionPhaseStatus;

    // Fetch execution phases within the date range
    const executionPhases = await prisma.executionPhase.findMany({
        where: {
            userId,
            startedAt:{
                gte: daterange.startDate,
                lte: daterange.endDate,
            },
            status:{
                in: [COMPLETED,FAILED]
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

    // Aggregate credit consumption by date and status
    executionPhases.forEach(phase => {
        const date = format(phase.startedAt!, dateFormat);
        if(phase.status === COMPLETED){
            stats[date].success += phase.creditsConsumed || 0;
        }
        if(phase.status === FAILED){
            stats[date].failed += phase.creditsConsumed || 0;
        }
    })

    // Convert stats object to array format for easier consumption
    const results = Object.entries(stats).map(([date,infos]) => ({
        date,
        ...infos
    }));

    return results;
}