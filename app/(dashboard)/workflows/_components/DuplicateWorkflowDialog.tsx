"use client"

import React, { useCallback, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Button } from '@/components/ui/button';
import { CopyIcon, Layers2Icon, Loader2 } from 'lucide-react';
import CustomDialogHeader from '@/components/CustomDialogHeader';
import { useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod"
import { duplicateWorkflowSchema, duplicateWorkflowSchemaType } from '@/schema/workflow';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DuplicateWorkflow } from '@/actions/workflows/DuplicateWorkflow';
import { cn } from '@/lib/utils';

function DuplicateWorkflowsDialog({workflowId}:{
    workflowId? : string
}) {
    const [open,setOpen] = useState(false);

    const form = useForm<duplicateWorkflowSchemaType>({
        resolver: zodResolver(duplicateWorkflowSchema),
        defaultValues: {
            workflowId,
            name: "",
            description: ""
        }
    })
    
    const {mutate,isPending} = useMutation({
        mutationFn: DuplicateWorkflow,
        onSuccess: () => {
            toast.success("Workflow duplicated", {id: "duplicate-workflow"})
            setOpen((prev) => !prev)
        },
        onError: () => {
            toast.error("Failed to duplicate workflow",{id: "duplicate-workflow"})
        },
    });

    const onSubmit = useCallback((values:duplicateWorkflowSchemaType) => {
        toast.loading("Duplicating workflow...",{id: "duplicate-workflow"});
        mutate(values);
    },[mutate])

  return (
    <Dialog open={open} onOpenChange={(open) => {
        form.reset();
        setOpen(open);
    }}>
        <DialogTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className={cn("ml-2 transition-opacity duration-200 opacity-0 group-hover/card:opacity-100")}>
                <CopyIcon className='w-4 h-4 cursor-pointer text-muted-foreground' />
            </Button>
        </DialogTrigger>
        <DialogContent className='px-0'>
            <CustomDialogHeader 
            icon={Layers2Icon} 
            title="Duplicate workflow" 
            />
            <div className='p-6'>
                <Form {...form}>
                    <form className='space-y-8 w-full' onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='flex gap-1 items-center'>
                                        Name
                                        <p className='text-xs text-primary'>(required)</p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Choose a descriptive and unique name
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name='description'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='flex gap-1 items-center'>
                                        Description
                                        <p className='text-xs text-muted-foreground'>(optional)</p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Provide a brief description of what your woorkflow does.<br />This is optional bit it can help you remember what it does.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button className='w-full' type='submit' disabled={isPending}>
                                {!isPending && "Proceed"}
                                {isPending && <Loader2 className='animate-spin' />}

                            </Button>
                    </form>
                </Form>
            </div>
        </DialogContent>
    </Dialog>
  )
}

export default DuplicateWorkflowsDialog