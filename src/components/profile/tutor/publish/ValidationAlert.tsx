
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface ValidationAlertProps {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

export const ValidationAlert: React.FC<ValidationAlertProps> = ({ 
  isValid, 
  missingFields, 
  warnings 
}) => {
  if (isValid && warnings.length === 0) {
    return null;
  }

  if (!isValid) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Профиль не полностью заполнен</AlertTitle>
        <AlertDescription>
          <p>Следующие поля требуют заполнения:</p>
          <ul className="list-disc pl-5 mt-2">
            {missingFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  }

  if (warnings.length > 0) {
    return (
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <AlertTitle className="text-amber-800">Рекомендации по улучшению профиля</AlertTitle>
        <AlertDescription className="text-amber-700">
          <ul className="list-disc pl-5 mt-2">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
