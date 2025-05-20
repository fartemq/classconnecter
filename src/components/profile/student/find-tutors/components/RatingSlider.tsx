
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingSliderProps {
  rating: number;
  onRatingChange: (value: number[]) => void;
}

export const RatingSlider: React.FC<RatingSliderProps> = ({
  rating,
  onRatingChange
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Минимальный рейтинг</Label>
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-500 mr-1">{rating}+</span>
          <Star className="h-3 w-3 text-yellow-500" fill="currentColor"/>
        </div>
      </div>
      
      <div className="pb-2">
        <Slider
          value={[rating]}
          min={0}
          max={5}
          step={0.5}
          onValueChange={onRatingChange}
          className="py-4"
        />
        <div className="h-1 w-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full -mt-5 -z-10 relative" />
      </div>
    </div>
  );
};
