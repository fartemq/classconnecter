
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ValidationMessageProps {
  title: string;
  message: string;
  variant: "error" | "warning" | "info";
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  title,
  message,
  variant
}) => {
  return (
    <Alert 
      variant={variant === "error" ? "destructive" : variant === "warning" ? "default" : "default"}
      className={variant === "warning" ? "bg-amber-50 border-amber-200" : ""}
    >
      <AlertCircle className={`h-4 w-4 ${variant === "warning" ? "text-amber-500" : ""}`} />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
