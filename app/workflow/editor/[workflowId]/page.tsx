import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import Editor from '../../_component/Editor';

export default async function Page({ params }: { params: { workflowId: string } }) {
  const { userId } = await auth();

  if (!userId) {
    return <div>unauthorized</div>;
  }

  const workflow = await prisma.workflow.findUnique({
    where: {
      id: params.workflowId,
      userId,
    }
  });

  if (!workflow) {
    return <div>Workflow not found</div>;
  }

  return <Editor workflow={workflow} />;
}