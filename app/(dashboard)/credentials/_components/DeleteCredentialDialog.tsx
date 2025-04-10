"use client" 

import { DeleteCredential } from "@/actions/credentials/DeleteCredential";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
  
interface Props {
    name: string;
}

function DeleteCredentialDialog({name}:Props) {

    const [open,setOpen] = useState(false);
    const [confirmText,setConfirmText] = useState("");
    const deleteMutation = useMutation({
        mutationFn: DeleteCredential,
        onSuccess: () => {
            toast.success("Credential deleted successfully",{id: name})
            setConfirmText("")
        },
        onError: () => {
            toast.error("Failed to delete credential",{id:name})
        }
    })

    const onSubmit = useCallback(() => {
        toast.loading("Deleting credential...",{id: "delete-credential"});
        deleteMutation.mutate(name);
    },[deleteMutation, name]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
            <Button variant={"destructive"} size={"icon"}>
                <XIcon size={18} />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    If you delete this credential, you will not be able to recover it.
                </AlertDialogDescription>
                <div className="flex flex-col py-4 gap-2">
                    <div>
                        If you are sure, enter <b>{name}</b> to confirm:
                    </div>
                    <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                    />
                </div>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={confirmText !== name || deleteMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onSubmit}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCredentialDialog