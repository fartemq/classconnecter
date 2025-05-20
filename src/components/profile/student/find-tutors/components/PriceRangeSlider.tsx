
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
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label>Стоимость за час</Label>
        <span className="text-sm">
          {priceRange[0]}₽ - {priceRange[1]}₽
        </span>
      </div>
      <Slider 
        min={500} 
        max={10000} 
        step={100} 
        value={priceRange}
        onValueChange={onPriceChange}
        className="py-4"
      />
    </div>
  );
};
