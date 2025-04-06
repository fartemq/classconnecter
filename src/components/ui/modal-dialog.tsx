
import React from "react";
import { 
  Dialog, 
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ModalDialogProps {
  title: string;
  description?: string;
  triggerButton: React.ReactNode;
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxWidth?: string;
}

export const ModalDialog = ({
  title,
  description,
  triggerButton,
  children,
  showCloseButton = true,
  maxWidth = "max-w-2xl"
}: ModalDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className={`${maxWidth} w-full rounded-xl shadow-lg border-none`}>
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-gray-800">{title}</DialogTitle>
          {description && <DialogDescription className="text-gray-600">{description}</DialogDescription>}
          <DialogClose className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>
        
        {showCloseButton && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full px-5 transition-all hover:bg-gray-100 hover:text-gray-800">
                Закрыть
              </Button>
            </DialogClose>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
