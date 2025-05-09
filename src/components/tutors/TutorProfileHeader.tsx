
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MessageSquare, CalendarPlus } from "lucide-react";
import { PublicTutorProfile } from "@/services/publicTutorService";

interface TutorProfileHeaderProps {
  tutor: PublicTutorProfile;
  onContact: () => void;
  onBookLesson: () => void;
}

export const TutorProfileHeader = ({ tutor, onContact, onBookLesson }: TutorProfileHeaderProps) => {
  // Get lowest hourly rate
  const lowestRate = tutor.subjects.length > 0
    ? Math.min(...tutor.subjects.map(s => s.hourlyRate))
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left column - Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="h-28 w-28 md:h-32 md:w-32 border-2 border-white shadow-md">
          <AvatarImage src={tutor.avatar_url || ''} alt={`${tutor.first_name} ${tutor.last_name || ''}`} />
          <AvatarFallback className="text-2xl">
            {tutor.first_name.charAt(0)}{tutor.last_name?.charAt(0) || ''}
          </AvatarFallback>
        </Avatar>
      </div>
      
      {/* Middle column - Info */}
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">
            {tutor.first_name} {tutor.last_name || ''}
          </h1>
          {tutor.isVerified && (
            <BadgeCheck className="text-blue-500 h-5 w-5" />
          )}
        </div>
        
        <div className="text-gray-600 mt-1">
          {tutor.city && <p>{tutor.city}</p>}
          
          <div className="mt-2">
            {tutor.subjects.map((subject, index) => (
              <span key={subject.id} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
                {subject.name}
              </span>
            ))}
          </div>
          
          <div className="flex items-center mt-2">
            {tutor.experience && (
              <span className="text-sm mr-4">Опыт: {tutor.experience} {getPluralYears(tutor.experience)}</span>
            )}
            
            {tutor.rating && (
              <div className="flex items-center">
                <span className="text-sm mr-1">Рейтинг:</span>
                <span className="text-sm font-medium">{tutor.rating.toFixed(1)}</span>
                <div className="text-yellow-400 ml-1">★</div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right column - Actions */}
      <div className="flex flex-col gap-3 md:items-end">
        {lowestRate !== null && (
          <div className="bg-gray-50 rounded-lg px-4 py-2 text-center">
            <p className="text-sm text-gray-600">Стоимость от</p>
            <p className="text-xl font-bold text-primary">{lowestRate} ₽/час</p>
          </div>
        )}
        
        <div className="flex gap-3 mt-auto">
          <Button 
            variant="outline" 
            onClick={onContact}
            className="flex-1 md:flex-auto"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Написать
          </Button>
          
          <Button 
            onClick={onBookLesson}
            className="flex-1 md:flex-auto"
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            Забронировать
          </Button>
        </div>
      </div>
    </div>
  );
};

function getPluralYears(years: number): string {
  if (years % 10 === 1 && years % 100 !== 11) {
    return 'год';
  } else if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) {
    return 'года';
  } else {
    return 'лет';
  }
}
