
import React from "react";
import { Loader } from "@/components/ui/loader";

export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader size="lg" />
      <p className="mt-4 text-gray-600">Загрузка профиля...</p>
    </div>
  );
};
