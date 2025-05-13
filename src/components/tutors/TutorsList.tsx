
import React from "react";
import { PublicTutorProfile } from "@/services/publicTutorService";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Calendar, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

interface TutorsListProps {
  tutors: PublicTutorProfile[];
}

export const TutorsList = ({ tutors }: TutorsListProps) => {
  return (
    <div className="space-y-4">
      {tutors.map((tutor) => (
        <TutorCard key={tutor.id} tutor={tutor} />
      ))}
    </div>
  );
};

interface TutorCardProps {
  tutor: PublicTutorProfile;
}

const TutorCard = ({ tutor }: TutorCardProps) => {
  // Get minimum hourly rate
  const minRate = tutor.subjects.length > 0
    ? Math.min(...tutor.subjects.map(s => s.hourlyRate || 0))
    : null;
  
  // Create a display name
  const displayName = `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() || 'Репетитор';
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Avatar section */}
          <div className="flex-shrink-0 flex md:block justify-center">
            <Avatar className="h-20 w-20 border-2 border-white shadow">
              <AvatarImage src={tutor.avatar_url || ''} alt={displayName} />
              <AvatarFallback className="text-xl">
                {(tutor.first_name?.charAt(0) || '') + (tutor.last_name?.charAt(0) || '')}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Main content */}
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">
                {displayName}
              </h3>
              {tutor.isVerified && (
                <BadgeCheck className="text-blue-500 h-5 w-5" />
              )}
            </div>
            
            {tutor.city && (
              <p className="text-gray-600 text-sm">{tutor.city}</p>
            )}
            
            {/* Subjects */}
            <div className="mt-2 mb-3">
              {tutor.subjects.slice(0, 3).map((subject) => (
                <span
                  key={subject.id}
                  className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-medium text-gray-700 mr-1 mb-1"
                >
                  {subject.name}
                </span>
              ))}
              {tutor.subjects.length > 3 && (
                <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-medium text-gray-700">
                  +{tutor.subjects.length - 3}
                </span>
              )}
            </div>
            
            {/* Experience and rating */}
            <div className="flex flex-wrap gap-3 mb-3">
              {tutor.experience && (
                <span className="text-sm text-gray-600">
                  Опыт: {tutor.experience} {getPluralYears(tutor.experience)}
                </span>
              )}
              
              {tutor.rating && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 mr-1">Рейтинг:</span>
                  <span className="text-sm font-medium">{tutor.rating.toFixed(1)}</span>
                  <div className="text-yellow-400 ml-1">★</div>
                </div>
              )}
            </div>
            
            {/* Bio excerpt */}
            {tutor.bio && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {tutor.bio}
              </p>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-auto">
              <Button asChild variant="outline" size="sm">
                <Link to={`/tutors/${tutor.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Подробнее
                </Link>
              </Button>
              
              <Button asChild size="sm">
                <Link to={`/tutors/${tutor.id}?action=book`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Забронировать
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Price section */}
          {minRate !== null && (
            <div className="flex-shrink-0 flex flex-col items-center md:items-end">
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-gray-600">от</p>
                <p className="text-lg font-bold text-primary">{minRate} ₽/час</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
