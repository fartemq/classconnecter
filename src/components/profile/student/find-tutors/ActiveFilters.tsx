
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X, MapPin } from 'lucide-react';

interface ActiveFiltersProps {
  subjectFilter: string | undefined;
  cityFilter: string;
  verifiedFilter: boolean;
  ratingFilter: number | undefined;
  experienceFilter: number | undefined;
  priceRange: [number, number];
  showExistingTutors: boolean;
  onClearSubject: () => void;
  onClearCity: () => void;
  onClearVerified: () => void;
  onClearRating: () => void;
  onClearExperience: () => void;
  onClearPrice: () => void;
  onClearExisting: () => void;
  onResetAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  subjectFilter,
  cityFilter,
  verifiedFilter,
  ratingFilter,
  experienceFilter,
  priceRange,
  showExistingTutors,
  onClearSubject,
  onClearCity,
  onClearVerified,
  onClearRating,
  onClearExperience,
  onClearPrice,
  onClearExisting,
  onResetAll
}) => {
  const hasActiveFilters = subjectFilter || 
    cityFilter || 
    verifiedFilter || 
    ratingFilter || 
    experienceFilter || 
    priceRange[0] > 0 || 
    priceRange[1] < 5000 || 
    showExistingTutors;
    
  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {subjectFilter && (
        <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
          {subjectFilter}
          <X 
            size={14} 
            className="cursor-pointer" 
            onClick={onClearSubject}
          />
        </Badge>
      )}
      
      {cityFilter && (
        <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
          <MapPin size={14} />
          {cityFilter}
          <X 
            size={14} 
            className="cursor-pointer" 
            onClick={onClearCity}
          />
        </Badge>
      )}
      
      {(priceRange[0] > 0 || priceRange[1] < 5000) && (
        <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
          {priceRange[0]} ₽ — {priceRange[1]} ₽
          <X 
            size={14} 
            className="cursor-pointer" 
            onClick={onClearPrice}
          />
        </Badge>
      )}
      
      {verifiedFilter && (
        <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
          Проверенные
          <X 
            size={14} 
            className="cursor-pointer" 
            onClick={onClearVerified}
          />
        </Badge>
      )}
      
      {ratingFilter && (
        <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
          Рейтинг {ratingFilter}+
          <X 
            size={14} 
            className="cursor-pointer" 
            onClick={onClearRating}
          />
        </Badge>
      )}
      
      {experienceFilter !== undefined && (
        <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
          Опыт от {experienceFilter} лет
          <X 
            size={14} 
            className="cursor-pointer" 
            onClick={onClearExperience}
          />
        </Badge>
      )}
      
      {showExistingTutors && (
        <Badge variant="outline" className="flex items-center gap-1 bg-slate-100">
          Мои репетиторы включены
          <X 
            size={14} 
            className="cursor-pointer" 
            onClick={onClearExisting}
          />
        </Badge>
      )}
      
      <Badge 
        variant="outline" 
        className="flex items-center gap-1 bg-slate-100 cursor-pointer"
        onClick={onResetAll}
      >
        Сбросить все
        <X size={14} />
      </Badge>
    </div>
  );
};
