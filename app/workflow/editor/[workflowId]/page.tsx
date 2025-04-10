import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import Editor from '../../_component/Editor';
import { Metadata } from 'next';
import { Workflow } from '@prisma/client';

// Types for Next.js 15
type PageParams = Promise<{ workflowId: string }>;

type PageProps = {
  params: PageParams;
};

export default async function Page({ params }: PageProps) {
  const { userId } = await auth();
  const { workflowId } = await params;

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { workflowId } = await params;
  
  return {
    title: `Workflow Editor - ${workflowId}`,
  };
}