import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Editor from '../_component/Editor';

export default async function Page({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const workflowId = searchParams.id;
  
  if (!workflowId) {
    return <div>Missing workflow ID. Please specify using ?id=your-workflow-id</div>;
  }

  const { userId } = await auth();

  if (!userId) {
    return <div>unauthorized</div>;
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId,
      userId,
    }
  });

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return <Editor workflow={workflow} />;
} 