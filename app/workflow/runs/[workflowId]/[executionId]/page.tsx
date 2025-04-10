import { GetWorkflowExecutionPhase } from "@/actions/workflows/GetWorkflowExecutionPhase";
import Topbar from "@/app/workflow/_component/topbar/topbar";
import { auth } from "@clerk/nextjs/server";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import ExecutionViewer from "./_components/ExecutionViewer";

// Types for Next.js 15
type PageParams = Promise<{ workflowId: string, executionId: string }>;

type PageProps = {
  params: PageParams;
};

export default async function ExecutionViewerPage({ params }: PageProps) {
    // Await the params object before accessing its properties
    const { workflowId, executionId } = await params;
    
    const {userId} = await auth();
    if(!userId){
        return <div>unauthorized</div>
    }
    
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