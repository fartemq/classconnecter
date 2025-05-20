
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, CheckCircle, BookOpen, Star, Heart } from 'lucide-react';
import { TutorSearchResult } from '@/services/tutor/types';
import { useNavigate } from 'react-router-dom';

interface TutorCardProps {
  tutor: TutorSearchResult;
  onRequestTutor: (tutorId: string) => Promise<void>;
  onAddToFavorites: (tutorId: string) => Promise<void>;
}

export const TutorCard: React.FC<TutorCardProps> = ({ 
  tutor, 
  onRequestTutor, 
  onAddToFavorites 
}) => {
  const navigate = useNavigate();

  // Function to get the correct ending for years in Russian
  const getPluralYears = (years: number) => {
    if (years % 10 === 1 && years % 100 !== 11) {
      return 'год';
    } else if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) {
      return 'года';
    } else {
      return 'лет';
    }
  };

  // Function to render the appropriate action buttons based on relationship status
  const renderActionButtons = () => {
    if (tutor.relationshipStatus === 'accepted') {
      return (
        <>
          <Button 
            onClick={() => handleViewTutorProfile(tutor.id)}
            variant="secondary" 
            className="flex-1"
          >
            Посмотреть профиль
          </Button>
          <Button 
            onClick={() => navigate(`/profile/student/chats/${tutor.id}`)}
            className="flex-1"
          >
            Написать сообщение
          </Button>
        </>
      );
    } else if (tutor.relationshipStatus === 'pending') {
      return (
        <>
          <Button 
            onClick={() => handleViewTutorProfile(tutor.id)}
            variant="secondary" 
            className="flex-1"
          >
            Посмотреть профиль
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            disabled
          >
            Запрос отправлен
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button 
            onClick={() => handleViewTutorProfile(tutor.id)}
            variant="secondary" 
            className="flex-1"
          >
            Посмотреть профиль
          </Button>
          <Button 
            onClick={() => onRequestTutor(tutor.id)}
            className="flex-1"
          >
            Отправить запрос
          </Button>
          <Button
            onClick={() => onAddToFavorites(tutor.id)}
            variant="outline"
            className={`flex-shrink-0 ${tutor.isFavorite ? 'text-red-500' : ''}`}
            disabled={tutor.isFavorite}
          >
            <Heart className={`h-4 w-4 ${tutor.isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </>
      );
    }
  };

  const handleViewTutorProfile = (id: string) => {
    navigate(`/tutors/${id}`);
  };

  return (
    <Card 
      key={tutor.id} 
      className={`overflow-hidden ${tutor.relationshipStatus === 'accepted' ? 'border-primary border-2' : ''}`}
    >
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Tutor photo */}
          <div className="w-full md:w-1/4 bg-slate-50 p-6 flex flex-col items-center justify-center">
            <div className="relative">
              <Avatar className="h-28 w-28">
                {tutor.avatarUrl ? (
                  <AvatarImage src={tutor.avatarUrl} alt={`${tutor.firstName} ${tutor.lastName}`} />
                ) : (
                  <AvatarFallback className="text-xl">
                    {tutor.firstName.charAt(0)}
                    {tutor.lastName ? tutor.lastName.charAt(0) : ''}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {/* Show status badge if applicable */}
              {tutor.relationshipStatus && (
                <Badge 
                  className={
                    tutor.relationshipStatus === 'accepted' 
                      ? "bg-green-500 absolute -bottom-2 left-1/2 transform -translate-x-1/2" 
                      : tutor.relationshipStatus === 'pending' 
                        ? "bg-amber-500 absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                        : "hidden"
                  }
                >
                  {tutor.relationshipStatus === 'accepted' ? 'Мой репетитор' : 'Запрос отправлен'}
                </Badge>
              )}
            </div>
            
            <h3 className="font-medium text-lg mt-3 text-center">{tutor.firstName} {tutor.lastName}</h3>
            
            {tutor.city && (
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <MapPin size={14} className="mr-1" />
                {tutor.city}
              </div>
            )}
            
            {tutor.isVerified && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Проверен
                </Badge>
              </div>
            )}
          </div>
          
          {/* Right side - Tutor info */}
          <div className="p-6 w-full md:w-3/4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {tutor.subjects.map(s => s.name).join(", ")}
                  </span>
                </div>
                
                {tutor.rating !== null && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span>{tutor.rating.toFixed(1)}</span>
                  </div>
                )}
                
                {tutor.experience !== null && tutor.experience !== undefined && (
                  <div className="text-sm text-gray-600">
                    Опыт: {tutor.experience} {getPluralYears(tutor.experience)}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                {tutor.subjects.length > 0 && tutor.subjects.some(s => s.hourlyRate > 0) 
                  ? `от ${Math.min(...tutor.subjects.filter(s => s.hourlyRate > 0).map(s => s.hourlyRate))} ₽`
                  : "Цена не указана"}
                <div className="text-sm text-gray-500">за занятие</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-1">Предметы и стоимость:</h4>
              <ul className="space-y-1">
                {tutor.subjects.map((subject) => (
                  <li key={subject.id} className="flex justify-between">
                    <span>{subject.name}</span>
                    <span className="font-medium">
                      {subject.hourlyRate && subject.hourlyRate > 0 
                        ? `${subject.hourlyRate} ₽/час` 
                        : "Цена по запросу"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {renderActionButtons()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
