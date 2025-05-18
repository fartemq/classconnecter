
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

interface FormStepFooterProps {
  isLoading: boolean;
  onClick: () => void;
  isSubmit?: boolean;
}

export const FormStepFooter = ({ isLoading, onClick, isSubmit = false }: FormStepFooterProps) => {
  return (
    <div className="flex justify-end mt-4">
      <Button 
        type={isSubmit ? "submit" : "button"} 
        onClick={isSubmit ? undefined : onClick} 
        disabled={isLoading}
      >
        {isLoading && <Loader size="sm" className="mr-2" />}
        {isLoading 
          ? "Сохранение..." 
          : isSubmit 
            ? "Завершить регистрацию" 
            : "Сохранить и продолжить"}
      </Button>
    </div>
  );
};
