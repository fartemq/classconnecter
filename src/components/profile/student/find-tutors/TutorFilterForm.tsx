
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { TutorSearchFilters } from '@/services/tutor/types';
import { ActiveFilters } from './ActiveFilters';
import {
  PriceRangeSlider,
  RatingSlider,
  ExperienceSlider,
  FilterCheckboxes,
  FilterInputs
} from './components';

interface TutorFilterFormProps {
  filters: TutorSearchFilters;
  onChange: (filters: TutorSearchFilters) => void;
  onReset: () => void;
}

export const TutorFilterForm: React.FC<TutorFilterFormProps> = ({ filters, onChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState<TutorSearchFilters>(filters);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin || 500, 
    filters.priceMax || 5000
  ]);

  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
    setPriceRange([
      filters.priceMin || 500, 
      filters.priceMax || 5000
    ]);
  }, [filters]);

  // Handle city input change
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({ ...localFilters, city: e.target.value });
  };

  // Handle subject input change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({ ...localFilters, subject: e.target.value });
  };
  
  // Handle price range change
  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
    // Don't update filters immediately to avoid too many re-renders
  };
  
  // Handle rating change
  const handleRatingChange = (value: number[]) => {
    setLocalFilters({ ...localFilters, rating: value[0] });
  };
  
  // Handle experience change
  const handleExperienceChange = (value: number[]) => {
    setLocalFilters({ ...localFilters, experienceMin: value[0] });
  };
  
  // Handle verified checkbox change
  const handleVerifiedChange = (checked: boolean) => {
    setLocalFilters({ ...localFilters, verified: checked || undefined });
  };

  // Handle "Show my tutors" switch change
  const handleShowExistingChange = (checked: boolean) => {
    setLocalFilters({ ...localFilters, showExisting: checked || undefined });
  };
  
  // Apply filters
  const applyFilters = () => {
    const updatedFilters = {
      ...localFilters,
      priceMin: priceRange[0],
      priceMax: priceRange[1]
    };
    
    // Remove empty filters
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] === '' || updatedFilters[key] === undefined) {
        delete updatedFilters[key];
      }
    });
    
    onChange(updatedFilters);
  };
  
  // Reset filters
  const handleReset = () => {
    setLocalFilters({});
    setPriceRange([500, 5000]);
    onReset();
  };

  return (
    <Card className="overflow-hidden border border-gray-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg font-medium">Фильтры поиска</span>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2 text-gray-500 hover:text-red-500">
            <X className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-5">
        {/* Input filters */}
        <FilterInputs
          city={localFilters.city || ''}
          subject={localFilters.subject || ''}
          onCityChange={handleCityChange}
          onSubjectChange={handleSubjectChange}
        />
        
        {/* Price range filter */}
        <PriceRangeSlider
          priceRange={priceRange}
          onPriceChange={handlePriceChange}
        />
        
        {/* Rating filter */}
        <RatingSlider
          rating={localFilters.rating || 0}
          onRatingChange={handleRatingChange}
        />
        
        {/* Experience filter */}
        <ExperienceSlider
          experience={localFilters.experienceMin || 0}
          onExperienceChange={handleExperienceChange}
        />
        
        {/* Checkbox filters */}
        <FilterCheckboxes
          verified={localFilters.verified || false}
          showExisting={localFilters.showExisting || false}
          onVerifiedChange={handleVerifiedChange}
          onShowExistingChange={handleShowExistingChange}
        />
        
        {/* Action buttons */}
        <Button 
          onClick={applyFilters} 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Filter className="h-4 w-4 mr-2" />
          Применить фильтры
        </Button>
      </CardContent>
    </Card>
  );
};
