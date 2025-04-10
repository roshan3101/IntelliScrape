'use client'

import { GetWorkflowExecutionPhase } from "@/actions/workflows/GetWorkflowExecutionPhase";
import Topbar from "@/app/workflow/_component/topbar/topbar";
// import { auth } from "@clerk/nextjs/server";
import { useParams } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import ExecutionViewer from "./_components/ExecutionViewer";

export default function ExecutionViewerPage() {
    // Await the params object before accessing its properties
    const params = useParams();
    const { workflowId, executionId } = params;
    
    return (
    <div className="flex flex-col h-screen w-full overflow-hidden">
        <Topbar workflowId={workflowId as string}
        title="Workflow run details"
        subtitle={`Run ID: ${executionId}`}
        hideButtons
        />

        <section className="flex h-full overflow-auto">
            <Suspense
            fallback={
                <div className="flex w-full items-center justify-center">
                    <Loader2Icon className="h-10 w-10 animate-spin stroke-primary" />
                </div>
            }
            >
                <ExecutionViewerWrapper executionId={executionId as string} />
            </Suspense>
        </section>
    </div>
    )
}

async function ExecutionViewerWrapper({
    executionId,
}: {
    executionId: string
}) {
    
    const workflowExecution = await GetWorkflowExecutionPhase(executionId);
    if(!workflowExecution){
        return <div>Not found</div>
    }

    return (
        <ExecutionViewer initialData={workflowExecution} />
    )
}