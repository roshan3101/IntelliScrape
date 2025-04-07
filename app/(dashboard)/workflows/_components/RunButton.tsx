"use client"

import { RunWorkflow } from '@/actions/workflows/runWorkflow'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { PlayIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function RunButton({workflowId}:{workflowId: string}) {
    const mutation = useMutation({
        mutationFn: RunWorkflow,
        onSuccess: () => {
            toast.success("Workflow started", {id: workflowId});
        },
        onError: (error) => {
            // Only show error toast if it's not a redirect
            if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
                toast.error("Something went wrong",{id: workflowId})
            } else {
                // Dismiss the loading toast and show success when it's a redirect
                toast.dismiss(workflowId);
                toast.success("Workflow started", {id: workflowId});
            }
        }
    })  
  return (
    <Button 
        variant={"outline"} 
        className='flex items-center gap-2' 
        size={"sm"} 
        disabled={mutation.isPending}
        onClick={() => {
            toast.loading("Scheduling run...",{id: workflowId});
            mutation.mutate({
                workflowId
            })
        }}
    >
        <PlayIcon size={16} />
        Run
    </Button>
  )
}

export default RunButton