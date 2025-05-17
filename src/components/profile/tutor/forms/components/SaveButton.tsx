
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Save } from "lucide-react";

interface SaveButtonProps {
  isLoading: boolean;
  onClick?: () => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  isLoading,
  onClick
}) => {
  return (
    <div className="sticky bottom-4 flex justify-end mt-6 bg-white p-4 border rounded-lg shadow-md z-10">
      <Button 
        type="submit" 
        disabled={isLoading} 
        className="min-w-[150px]"
        onClick={onClick}
      >
        {isLoading ? <Loader size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        {isLoading ? "Сохранение..." : "Сохранить изменения"}
      </Button>
    </div>
  );
};
