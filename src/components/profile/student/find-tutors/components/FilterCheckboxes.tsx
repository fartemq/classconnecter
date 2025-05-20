
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, Users } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="verified" 
          checked={verified}
          onCheckedChange={onVerifiedChange}
          className="bg-white border-gray-200 text-purple-600 data-[state=checked]:bg-purple-600"
        />
        <div className="flex items-center">
          <Label htmlFor="verified" className="text-sm font-medium cursor-pointer">
            Только проверенные репетиторы
          </Label>
          <CheckCircle className="h-4 w-4 ml-1.5 text-green-500" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-blue-500" />
          <Label htmlFor="showExisting" className="text-sm font-medium">
            Показать моих репетиторов
          </Label>
        </div>
        <Switch
          id="showExisting"
          checked={showExisting}
          onCheckedChange={onShowExistingChange}
          className="bg-gray-300 data-[state=checked]:bg-purple-600"
        />
      </div>
    </div>
  );
};
