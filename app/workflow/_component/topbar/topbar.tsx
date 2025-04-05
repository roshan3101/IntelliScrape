"use client"

import TooltipWrapper from '@/components/TooltipWrapper'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import SaveBtn from './SaveBtn'
import ExecBtn from './ExecBtn'

function Topbar({title,subtitle,workflowId} : {title: string;subtitle?:string;workflowId:string}) {

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
        <div className='flex flex-1 gap-1 justify-end'>
            <ExecBtn workflowId={workflowId} />
            <SaveBtn workflowId={workflowId} />
        </div>
    </div>
  )
}

export default Topbar