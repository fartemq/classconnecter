
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
      
      {tutors.map((tutor) => {
        // Transform TutorSearchResult to match TutorCard props
        const transformedTutor = {
          id: tutor.id,
          first_name: tutor.firstName,
          last_name: tutor.lastName,
          avatar_url: tutor.avatarUrl,
          city: tutor.city,
          bio: undefined, // TutorSearchResult doesn't have bio
          subjects: tutor.subjects?.map(subject => ({
            subject: { name: subject.name },
            hourly_rate: subject.hourlyRate,
            experience_years: tutor.experience
          })),
          reviews: tutor.rating ? {
            average_rating: tutor.rating,
            total_reviews: 0 // We don't have this data in TutorSearchResult
          } : undefined,
          is_online: undefined // We don't have this data in TutorSearchResult
        };

        return (
          <TutorCard 
            key={tutor.id} 
            tutor={transformedTutor} 
            onRequestTutor={onRequestTutor ? () => onRequestTutor(tutor.id) : undefined}
            onAddToFavorites={onAddToFavorites ? () => onAddToFavorites(tutor.id) : undefined}
            isInFavorites={tutor.isFavorite}
            relationshipStatus={tutor.relationshipStatus}
          />
        );
      })}
    </div>
  );
};
