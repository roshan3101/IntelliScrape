import React, { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server';
import Topbar from '../../_component/topbar/topbar'
import { GetWorkflowExecutions } from '@/actions/workflows/GetWorkflowExecutions';
import { InboxIcon, Loader2Icon } from 'lucide-react';
import ExecutionsTable from './_components/ExecutionsTable';

// Types for Next.js 15
type PageParams = Promise<{ workflowId: string }>;

type PageProps = {
  params: PageParams;
};

async function ExecutionsPage({ params }: PageProps) {
    const { workflowId } = await params;
    const {userId} = await auth();
    if(!userId){
        return <div>unauthorized</div>
    }

  return (
    <div className='h-full overflow-auto w-full'>
        <Topbar 
        workflowId={workflowId} 
        hideButtons
        title='All runs'
        subtitle='List of all your workflow rus'
        />
        <Suspense
        fallback={
            <div className='h-full w-full flex items-center justify-center'>
                <Loader2Icon size={30} className='animate-spin stroke-primary' />
            </div>
        }
        >
            <ExecutionsTableWrapper workflowId={workflowId} />    
        </Suspense>
    </div>
  )
}


async function ExecutionsTableWrapper({workflowId}:{workflowId: string}){
    const executions = await GetWorkflowExecutions(workflowId);
    if(!executions){
        return <div>No data</div>
    }

    if(executions.length === 0){
        return(
            <div className='container w-full py-6'>
                <div className='flex items-center justify-center flex-col gap-2 h-full w-full'>
                    <div className='rounded-full bg-accent w-20 h-20 flex items-center justify-center'>
                        <InboxIcon size={40} className='stroke-primary' />
                    </div>
                    <div className='flex flex-col gap-1 text-center'>
                        <p className='font-bold'>No runs have been triggered yet for this workflow.</p>
                        <p className='text-sm text-muted-foreground'>You can trigger a new run in the editor page.</p>
                    </div>
                </div>
            </div>
        )
    }

    return <div className='container py-6 w-full'>
        <ExecutionsTable workflowId={workflowId} initialData={executions} />
    </div>

}

export default ExecutionsPage