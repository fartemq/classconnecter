
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ExperienceSliderProps {
  experience: number;
  onExperienceChange: (value: number[]) => void;
}

export const ExperienceSlider: React.FC<ExperienceSliderProps> = ({
  experience,
  onExperienceChange
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Опыт работы (лет)</Label>
        <span className="text-xs font-medium text-gray-500">от {experience}</span>
      </div>
      
      <Slider
        value={[experience]}
        min={0}
        max={20}
        step={1}
        onValueChange={onExperienceChange}
        className="py-4"
        thumbClassName="h-4 w-4 bg-gradient-to-r from-green-400 to-teal-500"
        trackClassName="bg-gradient-to-r from-green-300 to-teal-400"
      />
    </div>
  );
};
