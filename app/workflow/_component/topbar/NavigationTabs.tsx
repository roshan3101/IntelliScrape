"use client"

import { Tabs, TabsTrigger } from '@/components/ui/tabs'
import { TabsList } from '@radix-ui/react-tabs'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React from 'react'

function NavigationTabs({workflowId}:{workflowId: string}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeValue = pathname?.split("/")[2];

  return (
    <Tabs value={activeValue} className='w-[400px]'>
        <TabsList className='grid w-full grid-cols-2'>
            <Link href={`/workflow/editor?id=${workflowId}`}>
                <TabsTrigger value="editor"className='w-full'>Editor</TabsTrigger>
            </Link>
            <Link href={`/workflow/runs/${workflowId}`}>
                <TabsTrigger value='runs' className='w-full'>Runs</TabsTrigger>
            </Link>
        </TabsList>
    </Tabs>
  )
}

export default NavigationTabs