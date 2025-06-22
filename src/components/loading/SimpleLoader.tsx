
import React from "react";

interface SimpleLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const SimpleLoader: React.FC<SimpleLoaderProps> = ({ 
  message = "Загрузка...", 
  size = "md" 
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};
