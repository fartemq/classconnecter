
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { FilterInputs } from './components/FilterInputs';
import { FilterCheckboxes } from './components/FilterCheckboxes';
import { PriceRangeSlider } from './components/PriceRangeSlider';
import { RatingSlider } from './components/RatingSlider';
import { ExperienceSlider } from './components/ExperienceSlider';
import { BudgetSlider } from './components/BudgetSlider';
import { TutorSearchFilters } from '@/services/tutor/types';

interface TutorFilterFormProps {
  initialFilters: TutorSearchFilters;
  onFilterChange: (filters: TutorSearchFilters) => void;
  onReset: () => void;
  loading?: boolean;
}

export const TutorFilterForm: React.FC<TutorFilterFormProps> = ({
  initialFilters,
  onFilterChange,
  onReset,
  loading = false
}) => {
  const [filters, setFilters] = useState<TutorSearchFilters>(initialFilters);

  const handleInputChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceMin: value[0],
      priceMax: value[1]
    }));
  };

  const handleRatingChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      rating: value[0]
    }));
  };

  const handleExperienceChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      experienceMin: value[0]
    }));
  };
  
  const handleBudgetChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      budget: value[0]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <Card className="h-fit">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FilterInputs
            subject={filters.subject || ''}
            city={filters.city || ''}
            onCityChange={(e) => handleInputChange('city', e.target.value)}
            onSubjectChange={(e) => handleInputChange('subject', e.target.value)}
          />
          
          <FilterCheckboxes
            verified={filters.verified || false}
            showExisting={filters.showExisting || false}
            onVerifiedChange={(checked) => handleCheckboxChange('verified', checked)}
            onShowExistingChange={(checked) => handleCheckboxChange('showExisting', checked)}
          />

          <PriceRangeSlider
            priceRange={[filters.priceMin || 500, filters.priceMax || 5000]}
            onPriceChange={handlePriceChange}
          />

          <RatingSlider
            rating={filters.rating || 0}
            onRatingChange={handleRatingChange}
          />

          <ExperienceSlider
            experience={filters.experienceMin || 0}
            onExperienceChange={handleExperienceChange}
          />
          
          <BudgetSlider
            budget={filters.budget || 1000}
            onBudgetChange={handleBudgetChange}
          />

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>Поиск...</>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Найти репетиторов
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              onClick={handleReset}
              disabled={loading}
              title="Сбросить фильтры"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
