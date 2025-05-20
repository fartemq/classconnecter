
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { TutorSearchFilters } from '@/services/tutor/types';
import { Switch } from '@/components/ui/switch';
import { ActiveFilters } from './ActiveFilters';
import { X } from 'lucide-react';

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
  
  // Remove single filter
  const handleRemoveFilter = (key: string) => {
    const updatedFilters = { ...filters };
    delete updatedFilters[key];
    onChange(updatedFilters);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Фильтры поиска</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* City filter */}
          <div className="space-y-2">
            <Label htmlFor="city">Город</Label>
            <Input 
              id="city" 
              placeholder="Введите город" 
              value={localFilters.city || ''} 
              onChange={handleCityChange} 
            />
          </div>
          
          {/* Subject filter */}
          <div className="space-y-2">
            <Label htmlFor="subject">Предмет</Label>
            <Input 
              id="subject" 
              placeholder="Например: Математика" 
              value={localFilters.subject || ''} 
              onChange={handleSubjectChange} 
            />
          </div>
          
          {/* Price range filter */}
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
              onValueChange={handlePriceChange}
              className="py-4"
            />
          </div>
          
          {/* Rating filter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Минимальный рейтинг</Label>
              <span className="text-sm">
                {localFilters.rating || 0}+
              </span>
            </div>
            <Slider 
              min={0} 
              max={5} 
              step={0.5} 
              value={[localFilters.rating || 0]}
              onValueChange={handleRatingChange}
              className="py-4"
            />
          </div>
          
          {/* Experience filter */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Опыт работы (лет)</Label>
              <span className="text-sm">
                от {localFilters.experienceMin || 0}
              </span>
            </div>
            <Slider 
              min={0} 
              max={20} 
              step={1} 
              value={[localFilters.experienceMin || 0]}
              onValueChange={handleExperienceChange}
              className="py-4"
            />
          </div>
          
          {/* Verified checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="verified" 
              checked={localFilters.verified || false}
              onCheckedChange={handleVerifiedChange}
            />
            <Label htmlFor="verified" className="cursor-pointer">
              Только проверенные репетиторы
            </Label>
          </div>
          
          {/* Show existing tutors */}
          <div className="flex items-center justify-between pt-2">
            <Label htmlFor="showExisting" className="cursor-pointer">
              Показать моих репетиторов
            </Label>
            <Switch 
              id="showExisting" 
              checked={localFilters.showExisting || false}
              onCheckedChange={handleShowExistingChange}
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex items-center"
              disabled={Object.keys(filters).length === 0}
            >
              <X className="mr-1 h-4 w-4" />
              Сбросить
            </Button>
            <Button onClick={applyFilters}>
              Применить
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Show active filters */}
      {Object.keys(filters).length > 0 && (
        <ActiveFilters 
          filters={filters} 
          onRemove={handleRemoveFilter} 
          onReset={onReset}
        />
      )}
    </div>
  );
};
