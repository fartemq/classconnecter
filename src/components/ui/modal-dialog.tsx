
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
      <DialogContent className={`${maxWidth} w-full`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>
        
        {showCloseButton && (
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Закрыть</Button>
            </DialogClose>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
