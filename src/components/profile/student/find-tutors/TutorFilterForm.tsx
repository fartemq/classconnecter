
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilterPanel } from './FilterPanel';
import { ActiveFilters } from './ActiveFilters';
import { TutorSearchFilters } from '@/services/tutor/types';

interface TutorFilterFormProps {
  filters: TutorSearchFilters;
  onChange: (filters: TutorSearchFilters) => void;
  onReset: () => void;
}

export const TutorFilterForm: React.FC<TutorFilterFormProps> = ({
  filters,
  onChange,
  onReset
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(filters.subject);
  const [cityFilter, setCityFilter] = useState<string>(filters.city || '');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(filters.rating);
  const [verifiedFilter, setVerifiedFilter] = useState<boolean>(!!filters.verified);
  const [experienceFilter, setExperienceFilter] = useState<number | undefined>(filters.experienceMin);
  const [showExistingTutors, setShowExistingTutors] = useState<boolean>(!!filters.showExisting);

  // Sample subjects for the filter
  const popularSubjects = [
    "Математика",
    "Физика",
    "Химия",
    "Русский язык",
    "Английский язык",
    "История",
    "Информатика",
    "Биология"
  ];

  const handleApplyFilters = () => {
    const newFilters: TutorSearchFilters = {};
    
    // Apply subject filter
    if (subjectFilter) {
      newFilters.subject = subjectFilter;
    }
    
    // Apply price range filter
    if (priceRange[0] > 0) {
      newFilters.priceMin = priceRange[0];
    }
    if (priceRange[1] < 5000) {
      newFilters.priceMax = priceRange[1];
    }
    
    // Apply city filter
    if (cityFilter) {
      newFilters.city = cityFilter;
    }
    
    // Apply rating filter
    if (ratingFilter) {
      newFilters.rating = ratingFilter;
    }
    
    // Apply verified filter
    if (verifiedFilter) {
      newFilters.verified = true;
    }
    
    // Apply experience filter
    if (experienceFilter) {
      newFilters.experienceMin = experienceFilter;
    }
    
    // Apply show existing tutors filter
    if (showExistingTutors) {
      newFilters.showExisting = true;
    }
    
    onChange(newFilters);
    setShowFilters(false);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Фильтры</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleFilters}
            >
              {showFilters ? 'Скрыть' : 'Показать все'}
            </Button>
          </div>

          <ActiveFilters 
            filters={filters}
            onRemove={(key) => {
              const newFilters = { ...filters };
              delete newFilters[key as keyof TutorSearchFilters];
              onChange(newFilters);
            }}
            onReset={onReset}
          />
          
          {showFilters && (
            <FilterPanel 
              filters={filters}
              subjects={popularSubjects}
              priceRange={priceRange}
              cityFilter={cityFilter}
              ratingFilter={ratingFilter}
              verifiedFilter={verifiedFilter}
              experienceFilter={experienceFilter}
              showExistingTutors={showExistingTutors}
              setPriceRange={setPriceRange}
              setSubjectFilter={setSubjectFilter}
              setCityFilter={setCityFilter}
              setRatingFilter={setRatingFilter}
              setVerifiedFilter={setVerifiedFilter}
              setExperienceFilter={setExperienceFilter}
              setShowExistingTutors={setShowExistingTutors}
              onApplyFilters={handleApplyFilters}
              onResetFilters={onReset}
              onClose={() => setShowFilters(false)}
            />
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              className="w-full" 
              variant="outline"
              onClick={toggleFilters}
            >
              {showFilters ? 'Применить фильтры' : 'Настроить фильтры'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
