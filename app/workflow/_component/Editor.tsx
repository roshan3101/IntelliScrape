import { Workflow } from '@prisma/client'
import React from 'react'
import { ReactFlowProvider } from "@xyflow/react";
import FlowEditor from './FlowEditor';
import Topbar from './topbar/topbar';
import TaskMenu from './TaskMenu';
import { FlowValidationContextProvider } from '@/components/context/FlowValidationContext';

function Editor({workflow}:{workflow:Workflow}) {
  return (
    <FlowValidationContextProvider>
    <ReactFlowProvider>
        <div className='flex flex-col h-full w-full overflow-hidden'>
            <Topbar title='Workflow Editor' workflowId={workflow.id} subtitle={workflow.name} />
            <section className='flex h-full overflow-auto'>
              <TaskMenu />
                <FlowEditor workflow={workflow} />
            </section>
        </div>
    </ReactFlowProvider>
    </FlowValidationContextProvider>
  )
}

export default Editor