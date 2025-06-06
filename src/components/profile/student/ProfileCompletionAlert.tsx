
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileCompletionAlertProps {
  isComplete: boolean;
  completionPercentage: number;
}

export const ProfileCompletionAlert = ({ isComplete, completionPercentage }: ProfileCompletionAlertProps) => {
  const navigate = useNavigate();

  if (isComplete) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="space-y-3">
          <div>
            <p className="font-medium">Завершите заполнение профиля</p>
            <p className="text-sm">Ваш профиль заполнен на {completionPercentage}%</p>
          </div>
          <Progress value={completionPercentage} className="w-full" />
          <Button 
            size="sm" 
            onClick={() => navigate('/student/edit-profile')}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Завершить профиль
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
