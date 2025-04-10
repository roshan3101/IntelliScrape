"use client"

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
    DialogFooter,
} from "@/components/ui/dialog"

import { Button } from '@/components/ui/button';
import { CalendarIcon, ClockIcon, TriangleAlertIcon } from 'lucide-react';
import CustomDialogHeader from '@/components/CustomDialogHeader';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UpdateWorkflow } from '@/actions/workflows/updateWorkflow';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { RemoveWorkflowSchedule } from '@/actions/workflows/RemoveWorkflowSchedule';
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";

function SchedulerDialog(props:{cron:string | null;workflowId: string}) {
    const [cron,setCron] = useState(props.cron || "");
    const [validCron,setValidCron] = useState(false);
    const [readableCron,setReadableCron] = useState("");

    const mutation = useMutation({
        mutationFn: UpdateWorkflow,
        onSuccess:() => {
            toast.success("schedule updated successfully",{id: "cron"});
        },
        onError:() => {
            toast.error("Something went wrong",{id: "cron"})
        }
    })

    const removeScheduleMutation = useMutation({
        mutationFn: RemoveWorkflowSchedule,
        onSuccess:() => {
            toast.success("schedule updated successfully",{id: "cron"});
        },
        onError:() => {
            toast.error("Something went wrong",{id: "cron"})
        }
    })

    useEffect(() => {
        if (!cron || cron.trim() === '') {
            setValidCron(false);
            setReadableCron("");
            return;
        }
        
        try {
            // Use the correct API for cron-parser v5.1.1
            const interval = CronExpressionParser.parse(cron);
            // Just checking if it's valid by getting the next date
            interval.next();
            
            const humanCronStr = cronstrue.toString(cron);
            setValidCron(true);
            setReadableCron(humanCronStr);
        } catch (error) {
            console.error("Cron validation error:", error);
            setValidCron(false);
            setReadableCron("");
        }
    },[cron])

    const workflowHasValidCron = props.cron && props.cron.length > 0;
    const readableSavedCron = workflowHasValidCron && cronstrue.toString(props.cron!);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"link"} className={cn("text-sm p-0 h-auto text-orange-500",workflowHasValidCron && "text-primary")} size={"sm"}>
                    {workflowHasValidCron && <div className='flex items-center gap-2'>
                        <ClockIcon />
                        {readableSavedCron}
                    </div>}

                    {!workflowHasValidCron && (
                        <div className='flex items-center gap-1'>
                            <TriangleAlertIcon className='h-3 w-3' />
                            Set schedule
                        </div>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className='px-0'>
                <CustomDialogHeader title='Schedule workflow execution' icon={CalendarIcon} />
                <div className='p-6 space-y-4'>
                    <p className='text-muted-foreground text-sm'>
                        Specify a cron expression to schedule periodic workflow execution.
                        All times are in UTC
                    </p>
                    <Input placeholder='Eg. * * * * *' value={cron} onChange={(e) => setCron(e.target.value)} />
                    <div className={cn("bg-accent rounded-md p-4 border text-sm border-destructive text-destructive",validCron && "border-primary text-primary")}>
                        {validCron ? readableCron : "Not a valid cron expression"}
                    </div>

                    {workflowHasValidCron && <DialogClose asChild>
                        <div className="px-8">
                            <Button className='w-full text-destructive border-destructive hover:text-destructive' variant={"outline"} disabled={mutation.isPending || removeScheduleMutation.isPending} onClick={() => {
                                toast.loading("removing schedule...",{id:"cron"});
                                removeScheduleMutation.mutate(props.workflowId);
                            }}>
                                Remove current schedule
                            </Button>
                            <Separator className='my-4'/>
                        </div>
                    </DialogClose>}
                </div>
                <DialogFooter className='px-6 gap-2'>
                    <DialogClose asChild>
                        <Button className='w-1/2' variant={"secondary"}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button className='w-1/2' disabled={mutation.isPending || !validCron} onClick={() => {
                            toast.loading("Saving...",{id: "cron"})
                            mutation.mutate({
                                id:props.workflowId,
                                cron
                            })
                        }}>Save</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default SchedulerDialog