
import React from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, UserMinus, CheckCircle, MessageSquare } from "lucide-react";

interface StudentRequestActionsProps {
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  onAccept: () => void;
  onReject: () => void;
  onComplete: () => void;
  onContact: () => void;
}

export const StudentRequestActions = ({ 
  status, 
  onAccept, 
  onReject, 
  onComplete, 
  onContact 
}: StudentRequestActionsProps) => {
  if (status === 'pending') {
    return (
      <div className="flex justify-end gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 px-2 text-green-700"
          onClick={onAccept}
        >
          <UserCheck className="h-4 w-4" />
          <span className="sr-only">Принять</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 px-2 text-red-700"
          onClick={onReject}
        >
          <UserMinus className="h-4 w-4" />
          <span className="sr-only">Отклонить</span>
        </Button>
      </div>
    );
  }
  
  if (status === 'accepted') {
    return (
      <div className="flex justify-end gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 px-2"
          onClick={onComplete}
        >
          <CheckCircle className="h-4 w-4" />
          <span className="sr-only">Завершить</span>
        </Button>
        <Button 
          size="sm" 
          className="h-8 px-2"
          onClick={onContact}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="sr-only">Связаться</span>
        </Button>
      </div>
    );
  }
  
  return (
    <Button 
      size="sm" 
      variant="outline" 
      className="h-8 px-4"
      onClick={onContact}
    >
      <MessageSquare className="h-4 w-4 mr-1" />
      Связаться
    </Button>
  );
};
