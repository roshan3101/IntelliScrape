import { React, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton';
import { GetStatsCardsValues } from '@/actions/analytics/GetStatsCardsValues';
import { CirclePlayIcon, CoinsIcon, WaypointsIcon } from 'lucide-react';
import StatsCard from './_components/StatsCard';
import { GetWorkflowExecutionStats } from '@/actions/analytics/GetWorkflowExecutionStats';
import ExecutionStatusChart from './_components/ExecutionStatusChart';
import { GetCreditsUsageInPeriod } from '@/actions/analytics/GetCreditsUsageInPeriod';
import CreditUsageChart from './_components/biling/_components/CreditUsageChart';
import { Period } from '@/types/analytics';

async function HomePage() {
  const currentDate = new Date();
  const period: Period = {
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
  }

  return (
    <div className='flex flex-1 flex-col h-full'>
        <div className='flex justify-between'>
          <h1 className='text-3xl font-bold'>Home</h1>
        </div>
      <div className='h-full py-6 flex flex-col gap-4'>
        <Suspense fallback={<StatsCardSkeleton />}>
          <StatsCards selectedPeriod={period} />
        </Suspense>
        <Suspense fallback={<Skeleton className='w-full h-[300px]' />}>
          <StatsExecutionStatus selectedPeriod={period} />
        </Suspense>
        <Suspense fallback={<Skeleton className='w-full h-[300px]' />}>
          <CreditsUsageInPeriod selectedPeriod={period} />
        </Suspense>
      </div>
    </div>
  )
}

async function StatsCards({selectedPeriod}:{selectedPeriod: Period}) {
  const data = await GetStatsCardsValues(selectedPeriod);
  return (
    <div className='grid gap-3 lg:gap-8 lg:grid-cols-3 min-h-[120px]'>
      <StatsCard
        title="Workflow executions" 
        value={data.workflowsExecution} 
        icon={CirclePlayIcon} 
      />
      <StatsCard
        title="Phase executions" 
        value={data.phaseExecutions} 
        icon={WaypointsIcon} 
      />
      <StatsCard
        title="Credits consumed" 
        value={data.creditsConsumed} 
        icon={CoinsIcon} 
      />
    </div>
  )
}

function StatsCardSkeleton(){
  return (
    <div className='grid grid-3 lg:gap-8 lg:grid-cols-3 '>
      {[1,2,3].map((i) => (
        <Skeleton key={i} className='w-full min-h-[120px]' />
      ))}
    </div>
  )
}

async function StatsExecutionStatus({selectedPeriod}:{selectedPeriod:Period}){
  const data = await GetWorkflowExecutionStats(selectedPeriod);
  return (
    <ExecutionStatusChart data={data} />
  )
}

async function CreditsUsageInPeriod({selectedPeriod}:{selectedPeriod:Period}){
  const data = await GetCreditsUsageInPeriod(selectedPeriod);
  return (
    <CreditUsageChart data={data} title="Daily credits spent" description="Daily credits consumed in current year" />
  )
}

export default HomePage