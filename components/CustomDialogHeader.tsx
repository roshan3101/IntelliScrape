"use client"

import { LucideIcon } from 'lucide-react';
import React from 'react'
import { DialogHeader } from './ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface Props {
    title?: string;
    subTitle?: string;
    icon?: LucideIcon;
    iconClassname?: string;
    titleClassname?: string;
    subtitleClassname?: string;
}

function CustomDialogHeader(props:Props) {

    const Icon = props.icon;

  return (
    <DialogHeader className='pt-6'>
        <DialogTitle asChild>
            <div className='flex flex-col items-center gap-2 mb-2'>
                {Icon && (
                    <Icon size={30} className={cn("stroke-primary",props.iconClassname)} />
                )}
                {
                    props.title && (
                        <p className={cn("text-xl text-primary",props.titleClassname)}>
                            {props.title}
                        </p>
                    )
                }
                {
                    props.subTitle && (
                        <p className={cn("text-sm text-muted-foreground",props.subtitleClassname)}>
                            {props.subTitle}
                        </p>
                    )
                }
            </div>
        </DialogTitle>
        <Separator />
    </DialogHeader>
    )
}

export default CustomDialogHeader