/**
 * Server action for generating available analytics periods
 * This action determines the range of months available for analytics
 * based on the earliest workflow execution
 */

"use server"

import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { auth } from "@clerk/nextjs/server"

/**
 * Generates a list of available periods for analytics
 * @returns Array of periods from earliest execution to current date
 * @throws Error if user is unauthenticated
 */
export async function GetPeriods(){
    // Get the authenticated user's ID
    const { userId } = await auth();
    if(!userId){
        throw new Error("unauthenticated");
    }

    // Find the earliest workflow execution date
    const years = await prisma.workflowExecution.aggregate({
        where:{ userId },
        _min: { startedAt: true},
    });

    // Get current year for range calculation
    const currentYear = new Date().getFullYear();

    // Use earliest execution year or current year if no executions exist
    const minYear = years._min.startedAt? years._min.startedAt.getFullYear() : currentYear;

    // Generate array of all months between earliest execution and now
    const periods: Period[] = []
    for(let year = minYear; year <= currentYear; year++){
        for(let month = 0; month <= 11; month++){
            periods.push({year, month});
        }
    }

    return periods;
}