
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

interface RecommendationAlertProps {
  title: string;
  message: string;
}

export const RecommendationAlert: React.FC<RecommendationAlertProps> = ({ 
  title, 
  message 
}) => {
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Lightbulb className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">{title}</AlertTitle>
      <AlertDescription className="text-blue-700">
        {message}
      </AlertDescription>
    </Alert>
  );
};
