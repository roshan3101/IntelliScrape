import { PeriodToDateRange } from "@/lib/helper/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { eachDayOfInterval, format } from "date-fns";

const dateFormat = "yyyy-MM-dd"

type Stats = Record<string, {
    success: number,
    failed: number
}>

export async function GetCreditsUsageInPeriod(period: Period) {
    const { userId } = await auth();
    if(!userId){
        throw new Error("user not found");
    }

    const daterange = PeriodToDateRange(period);

    const {COMPLETED,FAILED} = ExecutionPhaseStatus;

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

    executionPhases.forEach(phase => {
        const date = format(phase.startedAt!, dateFormat);
        if(phase.status === COMPLETED){
            stats[date].success += phase.creditsConsumed || 0;
        }
        if(phase.status === FAILED){
            stats[date].failed += phase.creditsConsumed || 0;
        }
    })

    const results = Object.entries(stats).map(([date,infos]) => ({
        date,
        ...infos
    }));

    
    return results;

}