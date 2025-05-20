
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface PriceRangeSliderProps {
  priceRange: [number, number];
  onPriceChange: (value: number[]) => void;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  priceRange,
  onPriceChange
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Стоимость за час</Label>
        <span className="text-xs font-medium text-gray-500">
          {priceRange[0]}₽ - {priceRange[1]}₽
        </span>
      </div>
      
      <div className="pb-2">
        <Slider
          value={priceRange}
          min={500}
          max={5000}
          step={100}
          onValueChange={onPriceChange}
          className="py-4"
        />
        <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full -mt-5 -z-10 relative" />
      </div>
    </div>
  );
};
