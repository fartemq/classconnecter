
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Heart, CheckCircle, UserPlus, MessageSquare, Clock } from 'lucide-react';
import { TutorSearchResult } from '@/services/tutor/types';
import { cn } from '@/lib/utils';

interface TutorCardProps {
  tutor: TutorSearchResult;
  onRequestTutor?: () => void;
  onAddToFavorites?: () => void;
  isInFavorites?: boolean;
  relationshipStatus?: string;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  tutor,
  onRequestTutor,
  onAddToFavorites,
  isInFavorites,
  relationshipStatus
}) => {
  // Find minimum hourly rate across all subjects
  const minRate = tutor.subjects.length > 0
    ? Math.min(...tutor.subjects.map(s => s.hourlyRate))
    : null;

  // Create display name
  const displayName = `${tutor.firstName || ''} ${tutor.lastName || ''}`.trim() || 'Репетитор';
  
  // Initial letter for avatar fallback
  const initials = (tutor.firstName?.[0] || '') + (tutor.lastName?.[0] || '');

  // Determine button state based on relationship status
  const isRelationPending = relationshipStatus === 'pending';
  const isRelationAccepted = relationshipStatus === 'accepted';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left column - avatar & price */}
          <div className="w-full md:w-1/4 lg:w-1/5 bg-gray-50 p-4 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gray-100">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 border-4 border-white shadow-sm mb-2">
                <AvatarImage src={tutor.avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {tutor.isVerified && (
                <div className="flex items-center text-blue-600 text-xs font-medium mt-1">
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  <span>Проверенный</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              {minRate !== null ? (
                <div>
                  <p className="text-sm text-gray-500">от</p>
                  <p className="text-xl font-bold text-primary">{minRate} ₽/час</p>
                </div>
              ) : (
                <p className="text-sm font-medium">Цена по запросу</p>
              )}
            </div>
          </div>
          
          {/* Right column - details */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{displayName}</h3>
                {tutor.city && (
                  <p className="text-sm text-gray-500 mt-1">{tutor.city}</p>
                )}
              </div>
              
              {onAddToFavorites && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onAddToFavorites}
                  title={isInFavorites ? 'Удалить из избранного' : 'Добавить в избранное'}
                  className={cn(
                    'h-8 w-8',
                    isInFavorites ? 'text-rose-500 hover:text-rose-600' : 'text-gray-400 hover:text-gray-500'
                  )}
                >
                  <Heart className="h-5 w-5" fill={isInFavorites ? 'currentColor' : 'none'} />
                </Button>
              )}
            </div>
            
            {/* Subject tags */}
            <div className="mt-3 mb-4">
              {tutor.subjects.slice(0, 4).map((subject) => (
                <span
                  key={subject.id}
                  className="inline-block bg-gray-100 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700 mr-1.5 mb-1.5"
                >
                  {subject.name}
                </span>
              ))}
              {tutor.subjects.length > 4 && (
                <span className="inline-block bg-gray-100 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700">
                  +{tutor.subjects.length - 4}
                </span>
              )}
            </div>
            
            {/* Experience and rating */}
            <div className="flex flex-wrap gap-3 mb-4">
              {tutor.experience > 0 && (
                <span className="text-sm text-gray-600">
                  Опыт: {tutor.experience} {getPluralYears(tutor.experience)}
                </span>
              )}
              
              {tutor.rating !== null && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm font-medium">{tutor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              {onRequestTutor && !isRelationAccepted && (
                <Button
                  onClick={onRequestTutor}
                  disabled={isRelationPending}
                  variant={isRelationPending ? "outline" : "default"}
                  className={isRelationPending ? "text-amber-600 border-amber-300" : ""}
                  size="sm"
                >
                  {isRelationPending ? (
                    <>
                      <Clock className="mr-1.5 h-4 w-4" />
                      Запрос отправлен
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1.5 h-4 w-4" />
                      Отправить запрос
                    </>
                  )}
                </Button>
              )}
              
              {isRelationAccepted && (
                <Button variant="outline" size="sm">
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Связаться
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function for pluralization
function getPluralYears(years: number): string {
  if (years % 10 === 1 && years % 100 !== 11) {
    return 'год';
  } else if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) {
    return 'года';
  } else {
    return 'лет';
  }
}
