import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import Editor from '../../_component/Editor';
import { Workflow } from '@prisma/client';

// Separate async function to load the workflow data
async function getWorkflow(workflowId: string): Promise<{ error: string } | { workflow: Workflow }> {
  const { userId } = await auth();
  
  if (!userId) {
    return { error: "unauthorized" };
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
      userId,
    }
  });

  if (!workflow) {
    return { error: "not_found" };
  }

  return { workflow };
}

// Page component as a regular function (not async)
export default function EditorPage({ params }: { params: { workflowId: string } }) {
  const { workflowId } = params;
  const result = React.use(getWorkflow(workflowId));
  
  if ('error' in result) {
    if (result.error === "unauthorized") {
      return <div>unauthorized</div>;
    }
    
    if (result.error === "not_found") {
      return <div>Workflow not found</div>;
    }
    
    return <div>An error occurred</div>;
  }

  return (
    <Editor workflow={result.workflow} />
  );
}