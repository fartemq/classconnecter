
import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

interface ValidationMessageProps {
  title: string;
  message: string;
  variant: "success" | "warning" | "error";
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  title,
  message,
  variant,
}) => {
  const getIconAndStyle = () => {
    switch (variant) {
      case "success":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          wrapperClass: "bg-green-50 border border-green-200 text-green-800",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
          wrapperClass: "bg-amber-50 border border-amber-200 text-amber-800",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          wrapperClass: "bg-red-50 border border-red-200 text-red-800",
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
          wrapperClass: "bg-gray-50 border border-gray-200 text-gray-800",
        };
    }
  };

  const { icon, wrapperClass } = getIconAndStyle();

  return (
    <div className={`p-3 rounded-md ${wrapperClass}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-1 text-sm">{message}</div>
        </div>
      </div>
    </div>
  );
};
