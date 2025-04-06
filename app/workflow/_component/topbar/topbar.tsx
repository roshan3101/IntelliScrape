"use client"

import TooltipWrapper from '@/components/TooltipWrapper'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import SaveBtn from './SaveBtn'
import ExecBtn from './ExecBtn'
import NavigationTabs from './NavigationTabs'
import PublishBtn from './PublishBtn'
import UnpublishBtn from './UnpublishBtn'

interface Props {
    title: string;
    subtitle?:string;
    workflowId:string;
    hideButtons?: boolean;
    isPublished?: boolean;
}

function Topbar({title,subtitle,workflowId,hideButtons=false,isPublished=false} : Props) {

    const router = useRouter();

  return (
    <div className='flex p-2 border-b-2 border-separate justify-between w-full h-[60px] sticky top-0 bg-background z-10'>
        <div className='flex gap-1 flex-1'>
            <TooltipWrapper content="Back">
                <Button variant={"ghost"} size={"icon"} onClick={() => router.back()}>
                    <ChevronLeftIcon size={20} />
                </Button>
            </TooltipWrapper>
            <div>
                <p className='font-bold text-ellipsis truncate'>{title}</p>
                {subtitle && (
                    <p className='text-xs text-muted-foreground truncate text-ellipsis'>{subtitle}</p>
                )}
            </div>
        </div>
        <NavigationTabs workflowId={workflowId} />
        <div className='flex flex-1 gap-1 justify-end'>
            {hideButtons === false && (
                <>
                    <ExecBtn workflowId={workflowId} />
                    {isPublished && <UnpublishBtn workflowId={workflowId} />}
                        {!isPublished && (<>
                            <SaveBtn workflowId={workflowId} />
                            <PublishBtn workflowId={workflowId} />
                            </>
                        )}
                    
                </>
            )}
            
        </div>
    </div>
  )
}

export default Topbar