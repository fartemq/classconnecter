
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface RatingSliderProps {
  rating: number;
  onRatingChange: (value: number[]) => void;
}

export const RatingSlider: React.FC<RatingSliderProps> = ({ 
  rating, 
  onRatingChange 
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Минимальный рейтинг</Label>
        <span className="text-sm">
          {rating || 0}+
        </span>
      </div>
      <Slider 
        min={0} 
        max={5} 
        step={0.5} 
        value={[rating || 0]}
        onValueChange={onRatingChange}
        className="py-4"
      />
    </div>
  );
};
