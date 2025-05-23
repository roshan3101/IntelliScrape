"use client"

import { DownloadInvoice } from '@/actions/biling/DownloadInvoice'
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import { Loader2Icon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

function InvoiceBtn({id}:{id: string}) {

    const mutation = useMutation({
        mutationFn: async () => await DownloadInvoice(id),
        onSuccess: (data) => (window.location.href = data as string),
        onError: () => {
            toast.error("Something went wrong")
        }
    })

  return (
    <Button
    variant={"ghost"}
    size={"sm"}
    className='text-xs gap-2 text-muted-foreground px-1'
    disabled={mutation.isPending}
    >
        Invoice
        {mutation.isPending && <Loader2Icon className='h-4 w-4 animate-spin' />}
    </Button>
  )
}

export default InvoiceBtn