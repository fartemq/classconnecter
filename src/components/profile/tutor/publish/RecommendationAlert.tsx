
import React from "react";
import { Info } from "lucide-react";

interface RecommendationAlertProps {
  title: string;
  message: string;
}

export const RecommendationAlert: React.FC<RecommendationAlertProps> = ({ 
  title, 
  message 
}) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-500 mt-0.5" />
        <div>
          <h4 className="font-medium mb-1">{title}</h4>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    </div>
  );
};
