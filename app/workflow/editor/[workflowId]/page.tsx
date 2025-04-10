'use client'
import { useParams } from 'next/navigation';
import prisma from '@/lib/prisma';
// import { auth } from '@clerk/nextjs/server';
import Editor from '../../_component/Editor';

export default async function Page() {
  // const { userId } = await auth();
  const { workflowId } = useParams();

  // if (!userId) {
  //   return <div>unauthorized</div>;
  // }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: workflowId as string,
      // userId,
    }
  });

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return <Editor workflow={workflow} />;
}