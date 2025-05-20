
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader } from '@/components/ui/loader';
import { Heart, MessageSquare, Star, MapPin, Check, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define our TutorItem type to match what's returned from the search service
interface TutorItem {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  city: string | null;
  rating: number | null;
  subjects: Array<{ id: string; name: string; hourlyRate: number }>;
  isVerified: boolean;
  experience: number;
  relationshipStatus?: string;
  isFavorite?: boolean;
}

interface TutorsListProps {
  tutors: TutorItem[];
  isLoading: boolean;
  onRequestTutor: (tutorId: string) => void;
  onAddToFavorites: (tutorId: string) => void;
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
      <div className="flex flex-col items-center justify-center py-16">
        <Loader className="h-12 w-12 text-primary mb-4" />
        <p className="text-muted-foreground">Загрузка репетиторов...</p>
      </div>
    );
  }

  if (tutors.length === 0) {
    return (
      <Card className="text-center">
        <CardContent className="py-16 flex flex-col items-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Репетиторы не найдены</CardTitle>
          <CardDescription className="mb-6">
            По заданным параметрам не найдено ни одного репетитора
          </CardDescription>
          <Button onClick={onResetFilters}>Сбросить фильтры</Button>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (first: string, last?: string | null) => {
    return `${first.charAt(0)}${last ? last.charAt(0) : ''}`;
  };

  const formatSubjectsList = (subjects: TutorItem['subjects']) => {
    if (!subjects || subjects.length === 0) return 'Предметы не указаны';
    return subjects.map(s => s.name).join(', ');
  };

  const getMinHourlyRate = (subjects: TutorItem['subjects']) => {
    if (!subjects || subjects.length === 0) return 0;
    const rates = subjects.map(s => s.hourlyRate).filter(r => r > 0);
    return rates.length > 0 ? Math.min(...rates) : 0;
  };

  // Calculate relationship status display properties
  const getRelationshipStatus = (status?: string) => {
    if (!status || status === 'pending') {
      return { text: 'Запрос отправлен', color: 'bg-yellow-100 text-yellow-800' };
    } else if (status === 'accepted') {
      return { text: 'Ваш репетитор', color: 'bg-green-100 text-green-800' };
    } else if (status === 'rejected') {
      return { text: 'Запрос отклонен', color: 'bg-red-100 text-red-800' };
    }
    return { text: '', color: '' };
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Найдено репетиторов: <span className="font-medium">{tutors.length}</span>
      </p>

      <div className="space-y-4">
        {tutors.map((tutor) => {
          const relationship = getRelationshipStatus(tutor.relationshipStatus);
          
          return (
            <Card key={tutor.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Avatar and basic info */}
                <div className="md:w-1/4 p-6 flex flex-col items-center md:border-r md:border-gray-100">
                  <Avatar className="h-24 w-24 mb-3">
                    {tutor.avatarUrl ? (
                      <AvatarImage src={tutor.avatarUrl} alt={`${tutor.firstName} ${tutor.lastName}`} />
                    ) : (
                      <AvatarFallback className="text-lg">
                        {getInitials(tutor.firstName, tutor.lastName)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <h3 className="font-medium text-center text-lg mb-1">
                    {tutor.firstName} {tutor.lastName}
                  </h3>
                  
                  {tutor.city && (
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{tutor.city}</span>
                    </div>
                  )}
                  
                  {tutor.isVerified && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      <span>Проверенный репетитор</span>
                    </Badge>
                  )}
                </div>
                
                {/* Details */}
                <div className="md:w-2/4 p-6">
                  <div className="mb-4">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium">Предметы:</h4>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {formatSubjectsList(tutor.subjects)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Рейтинг</div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-medium">{tutor.rating ? tutor.rating.toFixed(1) : 'Нет'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Опыт</div>
                      <div className="font-medium">
                        {tutor.experience} {tutor.experience === 1 ? 'год' : tutor.experience < 5 ? 'года' : 'лет'}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground">Цена от</div>
                      <div className="font-medium">
                        {getMinHourlyRate(tutor.subjects)} ₽/час
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="md:w-1/4 p-6 bg-gray-50 flex flex-col justify-between">
                  {tutor.relationshipStatus && (
                    <Badge className={cn("mb-4 self-start", relationship.color)}>
                      {relationship.text}
                    </Badge>
                  )}
                  
                  <div className="space-y-2 mt-auto">
                    <Button 
                      variant={tutor.isFavorite ? "secondary" : "outline"}
                      className="w-full flex items-center justify-center"
                      onClick={() => onAddToFavorites(tutor.id)}
                    >
                      <Heart className={cn(
                        "mr-2 h-4 w-4", 
                        tutor.isFavorite ? "fill-current text-rose-500" : ""
                      )} />
                      {tutor.isFavorite ? 'В избранном' : 'В избранное'}
                    </Button>
                    
                    <Button 
                      className="w-full flex items-center justify-center"
                      onClick={() => onRequestTutor(tutor.id)}
                      disabled={!!tutor.relationshipStatus}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {!tutor.relationshipStatus ? 'Написать' : 'Уже связаны'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
