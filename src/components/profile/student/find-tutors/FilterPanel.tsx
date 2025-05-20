
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { CheckCircle, X, Star } from 'lucide-react';
import { TutorSearchFilters } from '@/services/tutor/types';

interface FilterPanelProps {
  filters: TutorSearchFilters;
  subjects: string[];
  priceRange: [number, number];
  cityFilter: string;
  ratingFilter: number | undefined;
  verifiedFilter: boolean;
  experienceFilter: number | undefined;
  showExistingTutors: boolean;
  setPriceRange: (range: [number, number]) => void;
  setSubjectFilter: (subject: string | undefined) => void;
  setCityFilter: (city: string) => void;
  setRatingFilter: (rating: number | undefined) => void;
  setVerifiedFilter: (verified: boolean) => void;
  setExperienceFilter: (experience: number | undefined) => void;
  setShowExistingTutors: (show: boolean) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  onClose: () => void;
}

interface PriceRangeOption {
  min: number;
  max: number;
  label: string;
}

interface ExperienceRangeOption {
  min: number;
  max: number;
  label: string;
}

const priceRanges: PriceRangeOption[] = [
  { min: 0, max: 1000, label: "До 1000 ₽" },
  { min: 1000, max: 2000, label: "1000 ₽ - 2000 ₽" },
  { min: 2000, max: 3000, label: "2000 ₽ - 3000 ₽" },
  { min: 3000, max: 5000, label: "3000 ₽ - 5000 ₽" },
  { min: 5000, max: Infinity, label: "От 5000 ₽" },
];

const experienceRanges: ExperienceRangeOption[] = [
  { min: 0, max: 1, label: "До 1 года" },
  { min: 1, max: 3, label: "1-3 года" },
  { min: 3, max: 5, label: "3-5 лет" },
  { min: 5, max: 10, label: "5-10 лет" },
  { min: 10, max: Infinity, label: "Более 10 лет" },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  subjects,
  priceRange,
  cityFilter,
  ratingFilter,
  verifiedFilter,
  experienceFilter,
  showExistingTutors,
  setPriceRange,
  setSubjectFilter,
  setCityFilter,
  setRatingFilter,
  setVerifiedFilter,
  setExperienceFilter,
  setShowExistingTutors,
  onApplyFilters,
  onResetFilters,
  onClose
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Фильтры поиска</h3>
          <Button variant="ghost" size="sm" onClick={onResetFilters}>Сбросить</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Subject filter */}
          <div>
            <Label className="mb-2 block">Предмет</Label>
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`subject-${subject}`} 
                    checked={filters.subject === subject}
                    onCheckedChange={() => {
                      if (filters.subject === subject) {
                        setSubjectFilter(undefined);
                      } else {
                        setSubjectFilter(subject);
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`subject-${subject}`}
                    className="text-sm font-normal"
                  >
                    {subject}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Price range filter */}
          <div>
            <Label className="mb-2 block">Стоимость занятия</Label>
            <div className="px-2">
              <Slider 
                value={priceRange} 
                min={0} 
                max={5000} 
                step={100}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="my-4"
              />
              <div className="flex justify-between">
                <span className="text-sm">{priceRange[0]} ₽</span>
                <span className="text-sm">{priceRange[1] === 5000 ? '5000+ ₽' : `${priceRange[1]} ₽`}</span>
              </div>
            </div>
            <div className="mt-2 space-y-2">
              {priceRanges.map((range, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`price-${idx}`} 
                    checked={priceRange[0] === range.min && priceRange[1] === range.max}
                    onCheckedChange={() => {
                      setPriceRange([range.min, range.max]);
                    }}
                  />
                  <Label 
                    htmlFor={`price-${idx}`}
                    className="text-sm font-normal"
                  >
                    {range.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Experience filter */}
          <div>
            <Label className="mb-2 block">Опыт преподавания</Label>
            <div className="space-y-2">
              {experienceRanges.map((range, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`exp-${idx}`} 
                    checked={experienceFilter === range.min}
                    onCheckedChange={() => {
                      if (experienceFilter === range.min) {
                        setExperienceFilter(undefined);
                      } else {
                        setExperienceFilter(range.min);
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`exp-${idx}`}
                    className="text-sm font-normal"
                  >
                    {range.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* More filters */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="flex flex-wrap gap-4">
              {/* Show existing tutors filter */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="showExisting" 
                  checked={showExistingTutors}
                  onCheckedChange={(checked) => setShowExistingTutors(checked as boolean)}
                />
                <Label 
                  htmlFor="showExisting"
                  className="text-sm font-normal"
                >
                  Показывать моих репетиторов
                </Label>
              </div>
              
              {/* Verified filter */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="verified" 
                  checked={verifiedFilter}
                  onCheckedChange={(checked) => setVerifiedFilter(checked as boolean)}
                />
                <Label 
                  htmlFor="verified"
                  className="text-sm font-normal flex items-center"
                >
                  Проверенные репетиторы
                  <CheckCircle className="ml-1 h-4 w-4 text-green-500" />
                </Label>
              </div>
              
              {/* Rating filter options */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="highRating" 
                  checked={ratingFilter === 4}
                  onCheckedChange={(checked) => {
                    if (checked) setRatingFilter(4);
                    else setRatingFilter(undefined);
                  }}
                />
                <Label 
                  htmlFor="highRating"
                  className="text-sm font-normal flex items-center"
                >
                  Рейтинг 4+
                  <Star className="ml-1 h-4 w-4 text-yellow-500" />
                </Label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 gap-2">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={onApplyFilters}>Применить</Button>
        </div>
      </CardContent>
    </Card>
  );
};
