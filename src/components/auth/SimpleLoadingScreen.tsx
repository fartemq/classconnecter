
import React from "react";
import { Loader } from "@/components/ui/loader";

interface SimpleLoadingScreenProps {
  message?: string;
}

export const SimpleLoadingScreen: React.FC<SimpleLoadingScreenProps> = ({ 
  message = "Загрузка..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};
