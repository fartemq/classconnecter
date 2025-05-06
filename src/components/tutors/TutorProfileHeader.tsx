
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, Calendar, MapPin, Star } from "lucide-react";
import { PublicTutorProfile } from "@/services/publicTutorService";

interface TutorProfileHeaderProps {
  tutor: PublicTutorProfile;
  onContact: () => void;
  onBookLesson: () => void;
}

export const TutorProfileHeader = ({ tutor, onContact, onBookLesson }: TutorProfileHeaderProps) => {
  const fullName = `${tutor.first_name} ${tutor.last_name || ''}`.trim();
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Avatar */}
      <div className="md:w-1/4 flex flex-col items-center">
        <div className="w-40 h-40 rounded-full border-2 border-primary overflow-hidden bg-gray-100">
          {tutor.avatar_url ? (
            <img 
              src={tutor.avatar_url} 
              alt={fullName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-full h-full p-8 text-gray-400" />
          )}
        </div>
        
        {/* Rating */}
        <div className="mt-4 flex items-center">
          <Star className="h-5 w-5 text-yellow-500 mr-1" />
          <span className="font-medium text-lg">
            {tutor.rating ? tutor.rating.toFixed(1) : 'Нет отзывов'}
          </span>
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 w-full flex flex-col gap-2">
          <Button 
            onClick={onContact}
            className="w-full"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Связаться
          </Button>
          
          <Button 
            variant="outline"
            onClick={onBookLesson}
            className="w-full"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Забронировать занятие
          </Button>
        </div>
      </div>
      
      {/* Profile info */}
      <div className="md:w-3/4">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">{fullName}</h1>
          {tutor.city && (
            <div className="flex items-center text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {tutor.city}
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Преподает предметы:</h2>
          <div className="flex flex-wrap gap-2">
            {tutor.subjects.map((subject) => (
              <Badge key={subject.id} variant="outline" className="bg-gray-100">
                {subject.name}
              </Badge>
            ))}
          </div>
        </div>
        
        <TutorKeyInfo tutor={tutor} />
        
        {tutor.bio && (
          <div>
            <h2 className="text-lg font-semibold mb-2">О себе:</h2>
            <p className="text-gray-700">{tutor.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface TutorKeyInfoProps {
  tutor: PublicTutorProfile;
}

const TutorKeyInfo = ({ tutor }: TutorKeyInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {tutor.experience !== null && (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Опыт</div>
            <div className="font-medium">{tutor.experience} лет</div>
          </div>
        </div>
      )}
      
      {tutor.subjects.length > 0 && (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Стоимость</div>
            <div className="font-medium">от {Math.min(...tutor.subjects.map(s => s.hourly_rate))} ₽/час</div>
          </div>
        </div>
      )}
      
      {tutor.education_institution && (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Образование</div>
            <div className="font-medium line-clamp-1">{tutor.education_institution}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Need to add missing Clock and BookOpen
import { Clock, BookOpen } from "lucide-react";
