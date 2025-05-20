
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TutorSearchFilters } from '@/services/tutor/types';

interface ActiveFiltersProps {
  filters: TutorSearchFilters;
  onRemove: (key: string) => void;
  onReset: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemove,
  onReset
}) => {
  // If no filters are active, don't render anything
  if (Object.keys(filters).length === 0) {
    return null;
  }

  const getFilterLabel = (key: string, value: any): string => {
    switch (key) {
      case 'subject':
        return `Предмет: ${value}`;
      case 'priceMin':
        return `От ${value} ₽`;
      case 'priceMax':
        return `До ${value} ₽`;
      case 'city':
        return `Город: ${value}`;
      case 'rating':
        return `Рейтинг: ${value}+`;
      case 'verified':
        return 'Проверенные';
      case 'experienceMin':
        return `Опыт: от ${value} лет`;
      case 'showExisting':
        return 'Мои репетиторы';
      default:
        return `${key}: ${value}`;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {Object.entries(filters).map(([key, value]) => {
          if (value === undefined || value === null) return null;
          
          return (
            <Badge key={key} variant="secondary" className="flex items-center gap-1">
              {getFilterLabel(key, value)}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onRemove(key)} 
              />
            </Badge>
          );
        })}
        
        {Object.keys(filters).length > 1 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="h-6 px-2 text-xs"
          >
            Сбросить все
          </Button>
        )}
      </div>
    </div>
  );
};
