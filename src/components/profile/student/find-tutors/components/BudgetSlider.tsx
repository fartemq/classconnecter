
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface BudgetSliderProps {
  budget: number | null;
  onBudgetChange: (value: number[]) => void;
}

export const BudgetSlider: React.FC<BudgetSliderProps> = ({
  budget,
  onBudgetChange
}) => {
  const currentBudget = budget || 1000;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Бюджет (₽ в час)</Label>
        <span className="text-xs font-medium text-gray-500">до {currentBudget} ₽</span>
      </div>
      
      <div className="pb-2">
        <Slider
          value={[currentBudget]}
          min={500}
          max={5000}
          step={100}
          onValueChange={onBudgetChange}
          className="py-4"
        />
        <div className="h-1 w-full bg-gradient-to-r from-green-300 to-blue-400 rounded-full -mt-5 -z-10 relative" />
      </div>
    </div>
  );
};
