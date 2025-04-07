"use client"

import { RunWorkflow } from '@/actions/workflows/runWorkflow'
import useExecutionPlan from '@/components/hooks/useExecutionPlan'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { useReactFlow } from '@xyflow/react'
import { PlayIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function ExecBtn({workflowId}: {workflowId: string}) {

    const generate = useExecutionPlan();
    const { toObject }= useReactFlow();

    const mutation = useMutation({
      mutationFn: RunWorkflow,
      onSuccess: () => {
        toast.success("Execution started", {id: "flow-execution"});
      },
      onError: (error) => {
        // Only show error toast if it's not a redirect
        if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
          toast.error("Something went wrong", {id: "flow-execution"})
        } else {
          // Dismiss the loading toast and show success when it's a redirect
          toast.dismiss("flow-execution");
          toast.success("Execution started", {id: "flow-execution"});
        }
      }
    });

  return (
    <Button 
      variant={"outline"} 
      className='flex items-center'
      disabled={mutation.isPending}
      onClick={() => {
        const plan = generate();
        if(!plan){
          return;
        }

        toast.loading("Starting execution...", {id: "flow-execution"});
        mutation.mutate({
          workflowId: workflowId,
          flowDefinition: JSON.stringify(toObject())
        })
      }}
    >
        <PlayIcon size={16} className='stroke-yellow-600' />
        Execute
    </Button>
  )
}

export default ExecBtn