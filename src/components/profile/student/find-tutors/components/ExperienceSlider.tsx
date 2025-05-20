
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
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Опыт работы (лет)</Label>
        <span className="text-sm">
          от {experience || 0}
        </span>
      </div>
      <Slider 
        min={0} 
        max={20} 
        step={1} 
        value={[experience || 0]}
        onValueChange={onExperienceChange}
        className="py-4"
      />
    </div>
  );
};
