
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";

interface HomeworkDetailsDialogProps {
  selectedHomework: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatDate: (dateStr: string) => string;
}

export const HomeworkDetailsDialog = ({
  selectedHomework,
  open,
  onOpenChange,
  formatDate,
}: HomeworkDetailsDialogProps) => {
  if (!selectedHomework) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedHomework?.title}</DialogTitle>
          <Badge className="mt-1 w-fit">{selectedHomework?.subject}</Badge>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Описание:</h4>
            <p className="text-gray-700">{selectedHomework?.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Репетитор:</h4>
              <p className="text-gray-700">{selectedHomework?.tutor}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">
                {selectedHomework?.status === "completed" ? "Срок сдачи:" : "Сдать до:"}
              </h4>
              <p className="text-gray-700">
                {selectedHomework?.dueDate && formatDate(selectedHomework.dueDate)}
              </p>
            </div>
            {selectedHomework?.status === "completed" && (
              <>
                <div>
                  <h4 className="text-sm font-medium mb-1">Сдано:</h4>
                  <p className="text-gray-700">
                    {selectedHomework?.submittedDate && formatDate(selectedHomework.submittedDate)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Оценка:</h4>
                  <p className="text-gray-700">{selectedHomework?.grade} из 5</p>
                </div>
              </>
            )}
          </div>
          
          {selectedHomework?.status === "completed" && (
            <div>
              <h4 className="text-sm font-medium mb-1">Отзыв репетитора:</h4>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-gray-700">{selectedHomework?.feedback}</p>
              </div>
            </div>
          )}
          
          {selectedHomework?.status !== "completed" && (
            <>
              <div>
                <h4 className="text-sm font-medium mb-1">Прогресс:</h4>
                <div className="flex items-center gap-4">
                  <Progress value={selectedHomework?.progress} className="flex-grow" />
                  <span>{selectedHomework?.progress}%</span>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline">Сохранить как черновик</Button>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Отправить на проверку
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
