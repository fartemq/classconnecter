
import React from "react";
import { Loader } from "@/components/ui/loader";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Проверка сессии..." 
}) => {
  return (
    <div className="text-center">
      <Loader size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};
