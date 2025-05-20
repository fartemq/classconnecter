
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

interface FilterCheckboxesProps {
  verified: boolean;
  showExisting: boolean;
  onVerifiedChange: (checked: boolean) => void;
  onShowExistingChange: (checked: boolean) => void;
}

export const FilterCheckboxes: React.FC<FilterCheckboxesProps> = ({
  verified,
  showExisting,
  onVerifiedChange,
  onShowExistingChange
}) => {
  return (
    <>
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox 
          id="verified" 
          checked={verified}
          onCheckedChange={onVerifiedChange}
        />
        <Label htmlFor="verified" className="cursor-pointer">
          Только проверенные репетиторы
        </Label>
      </div>
      
      <div className="flex items-center justify-between pt-2">
        <Label htmlFor="showExisting" className="cursor-pointer">
          Показать моих репетиторов
        </Label>
        <Switch 
          id="showExisting" 
          checked={showExisting}
          onCheckedChange={onShowExistingChange}
        />
      </div>
    </>
  );
};
