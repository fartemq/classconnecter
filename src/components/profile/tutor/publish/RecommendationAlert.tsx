
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RecommendationAlertProps {
  title: string;
  message: string;
}

export const RecommendationAlert: React.FC<RecommendationAlertProps> = ({ 
  title, 
  message 
}) => {
  return (
    <Alert variant="default" className="bg-amber-50 border-amber-200">
      <AlertCircle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-800">{title}</AlertTitle>
      <AlertDescription className="text-amber-700">
        {message}
      </AlertDescription>
    </Alert>
  );
};
