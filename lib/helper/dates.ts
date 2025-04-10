import { Period } from "@/types/analytics";
import { endOfMonth, endOfYear, intervalToDuration, startOfMonth, startOfYear } from "date-fns";

export function DatesToDurationString(
    end: Date | null | undefined,
    start: Date | null | undefined
) {
    if(!start || !end) return null;

    const timeElapsed = end.getTime() - start.getTime();
    if(timeElapsed < 1000) {
        return `${timeElapsed}ms`;
    }

    const duration = intervalToDuration({
        start: 0,
        end: timeElapsed,
    });

    return `${duration.minutes || 0}m ${duration.seconds || 0}s`
}

export function PeriodToDateRange(period: Period) {
    if (period.month === null || period.month === undefined) {
        // If only year is provided, use start and end of year
        const startDate = startOfYear(new Date(period.year, 0))
        const endDate = endOfYear(new Date(period.year, 0));
        return {startDate, endDate};
    }
    
    // Otherwise use month-specific range
    const startDate = startOfMonth(new Date(period.year, period.month))
    const endDate = endOfMonth(new Date(period.year, period.month));
    return {startDate, endDate};
}