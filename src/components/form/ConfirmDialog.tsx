"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

type ConfirmDialogProps = {
  trigger: React.ReactNode;
  title?: string; 
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmClassName?: string;
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  trigger,
  title = "Title ?",
  description = "This is a description ?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmClassName = "bg-red-600 text-white hover:bg-red-700",
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            className={confirmClassName}
            onClick={onConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
