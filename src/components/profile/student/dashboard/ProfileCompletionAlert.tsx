
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileCompletionAlertProps {
  isProfileComplete: boolean;
}

export const ProfileCompletionAlert = ({ isProfileComplete }: ProfileCompletionAlertProps) => {
  const navigate = useNavigate();

  if (isProfileComplete) return null;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <div className="flex-1">
            <p className="text-orange-800 font-medium">
              Профиль не завершен
            </p>
            <p className="text-orange-700 text-sm">
              Заполните профиль для лучшего подбора репетиторов
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate("/profile/student/profile")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Заполнить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
