
import React from 'react';
import { TutorCard } from './TutorCard';
import { Loader } from '@/components/ui/loader';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TutorSearchResult } from '@/services/tutor/types';

interface TutorsListProps {
  tutors: TutorSearchResult[];
  isLoading: boolean;
  onRequestTutor?: (tutorId: string) => void;
  onAddToFavorites?: (tutorId: string) => void;
  onResetFilters?: () => void;
}

export const TutorsList: React.FC<TutorsListProps> = ({ 
  tutors, 
  isLoading, 
  onRequestTutor, 
  onAddToFavorites,
  onResetFilters
}) => {
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-60">
        <Loader className="h-8 w-8 mb-4" />
        <p className="text-gray-500">Загрузка репетиторов...</p>
      </div>
    );
  }
  
  if (tutors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Репетиторы не найдены</h3>
        <p className="text-gray-500 mb-4">
          По вашему запросу не найдено ни одного репетитора. Попробуйте изменить параметры поиска.
        </p>
        {onResetFilters && (
          <Button onClick={onResetFilters} variant="outline">
            Сбросить фильтры
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Найдено репетиторов: {tutors.length}</p>
      
      {tutors.map((tutor) => (
        <TutorCard 
          key={tutor.id} 
          tutor={tutor} 
          onRequestTutor={onRequestTutor ? () => onRequestTutor(tutor.id) : undefined}
          onAddToFavorites={onAddToFavorites ? () => onAddToFavorites(tutor.id) : undefined}
          isInFavorites={tutor.isFavorite}
          relationshipStatus={tutor.relationshipStatus}
        />
      ))}
    </div>
  );
};
