
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Star } from 'lucide-react';

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
      
      <Slider
        value={[rating]}
        min={0}
        max={5}
        step={0.5}
        onValueChange={onRatingChange}
        className="py-4"
        thumbClassName="h-4 w-4 bg-gradient-to-r from-yellow-400 to-yellow-500"
        trackClassName="bg-gradient-to-r from-yellow-300 to-yellow-400"
      />
    </div>
  );
};
