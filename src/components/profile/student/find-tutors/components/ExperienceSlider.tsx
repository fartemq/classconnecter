
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

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
      
      <div className="pb-2 relative">
        <Slider
          value={[experience]}
          min={0}
          max={20}
          step={1}
          onValueChange={onExperienceChange}
          className="py-4"
        />
        <div className="h-1 w-full bg-gradient-to-r from-green-300 to-teal-400 rounded-full -mt-5 -z-10 absolute bottom-2 left-0" />
      </div>
    </div>
  );
};
