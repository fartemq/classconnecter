
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ 
  isSubmitting,
  onCancel
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        <X className="mr-2 h-4 w-4" />
        Отменить
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader className="mr-2 h-4 w-4" />
            Сохранение...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </>
        )}
      </Button>
    </div>
  );
};
