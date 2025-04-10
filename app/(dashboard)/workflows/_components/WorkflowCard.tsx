"use client"

import React from 'react'
import { Workflow } from '@prisma/client'
import {
    Card,
    CardContent,
} from "@/components/ui/card"

import { Button } from '@/components/ui/button';
import { Layers2Icon, PlayIcon, Settings2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import DeleteWorkflowDialog from './DeleteWorkflowDialog';
import DuplicateWorkflowsDialog from './DuplicateWorkflowDialog';
import SchedulerDialog from './SchedulerDialog';

interface Props {
    workflow: Workflow;
    className?: string;
}

function WorkflowCard({workflow, className}: Props) {
    const router = useRouter();
    
    return (
        <Card className={cn("group/card", className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Layers2Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">{workflow.name}</h3>
                            {workflow.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {workflow.description}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/workflow/editor/${workflow.id}`)}
                        >
                            <Settings2Icon className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/workflow/executor/${workflow.id}`)}
                        >
                            <PlayIcon className="w-4 h-4" />
                        </Button>
                        <DuplicateWorkflowsDialog workflowId={workflow.id} />
                        <DeleteWorkflowDialog 
                            open={false} 
                            setOpen={() => {}} 
                            workflowName={workflow.name} 
                            workflowId={workflow.id} 
                        />
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                        Last run: {workflow.lastRunAt ? formatDistanceToNow(workflow.lastRunAt, { addSuffix: true }) : 'Never'}
                    </div>
                    {workflow.cron && (
                        <div>
                            Next run: {formatInTimeZone(workflow.nextRunAt || new Date(), 'UTC', 'MMM d, yyyy h:mm a')}
                        </div>
                    )}
                </div>
                {workflow.cron && (
                    <div className="mt-2">
                        <SchedulerDialog cron={workflow.cron} workflowId={workflow.id} />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default WorkflowCard