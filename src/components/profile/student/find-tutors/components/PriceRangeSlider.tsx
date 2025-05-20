
import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

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
      
      <Slider
        value={priceRange}
        min={500}
        max={5000}
        step={100}
        onValueChange={onPriceChange}
        className="py-4" 
        thumbClassName="h-4 w-4 bg-gradient-to-r from-blue-500 to-purple-500"
        trackClassName="bg-gradient-to-r from-blue-400 to-purple-400"
      />
    </div>
  );
};
