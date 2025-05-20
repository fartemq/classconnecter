
import React from 'react';
import { TutorCard } from './TutorCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { TutorSearchResult } from '@/services/tutor/types';

interface TutorsListProps {
  tutors: TutorSearchResult[];
  isLoading: boolean;
  onRequestTutor: (tutorId: string) => Promise<void>;
  onAddToFavorites: (tutorId: string) => Promise<void>;
  onResetFilters: () => void;
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
      <div className="flex justify-center py-10">
        <Loader size="lg" />
      </div>
    );
  }
  
  if (tutors.length === 0) {
    return (
      <Card className="text-center p-10">
        <h3 className="text-xl font-medium mb-2">Репетиторы не найдены</h3>
        <p className="text-gray-500 mb-4">
          Попробуйте изменить параметры поиска или сбросить фильтры
        </p>
        <Button onClick={onResetFilters} variant="secondary">Сбросить фильтры</Button>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      {tutors.map((tutor) => (
        <TutorCard
          key={tutor.id}
          tutor={tutor}
          onRequestTutor={onRequestTutor}
          onAddToFavorites={onAddToFavorites}
        />
      ))}
    </div>
  );
};
