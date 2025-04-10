import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import React from 'react'
import Editor from '../../_component/Editor';

async function editor({params}:{params:{workflowId: string}}) {
  const {workflowId} = await params;
  const {userId} = await auth();

  if(!userId){
    return <div>unauthorized</div>
  }

  const workflow = await prisma.workflow.findUnique({
    where:{
      id: workflowId,
      userId,
    }
  })

  if(!workflow){
    return <div>Workflow not found</div>
  }

  return (
    <Editor workflow={workflow} />
  )
}

export default editor