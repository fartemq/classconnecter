import React from "react";
import { TutorSearchResult } from "@/services/tutor/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MessageSquare, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface TutorSearchResultsProps {
  tutors: TutorSearchResult[];
}

export const TutorSearchResults = ({ tutors }: TutorSearchResultsProps) => {
  return (
    <div className="space-y-4">
      {tutors.map((tutor) => (
        <TutorResultCard key={tutor.id} tutor={tutor} />
      ))}
    </div>
  );
};

interface TutorResultCardProps {
  tutor: TutorSearchResult;
}

const TutorResultCard = ({ tutor }: TutorResultCardProps) => {
  const validSubjects = tutor.subjects.filter(s => s.hourlyRate > 0);
  const minRate = validSubjects.length > 0
    ? Math.min(...validSubjects.map(s => s.hourlyRate))
    : null;
  
  const displayName = `${tutor.firstName} ${tutor.lastName}`.trim() || 'Репетитор';
  
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar section */}
          <div className="flex-shrink-0 flex md:block justify-center">
            <Avatar className="h-20 w-20 border-2 border-white shadow-md">
              {tutor.avatarUrl ? (
                <AvatarImage src={tutor.avatarUrl} alt={displayName} />
              ) : (
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {tutor.firstName.charAt(0)}{tutor.lastName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          
          {/* Main content */}
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-foreground">
                {displayName}
              </h3>
              {tutor.isVerified && (
                <BadgeCheck className="text-primary h-5 w-5" />
              )}
            </div>
            
            {tutor.city && (
              <p className="text-muted-foreground text-sm mb-3">{tutor.city}</p>
            )}
            
            {/* Subjects */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {tutor.subjects.slice(0, 3).map((subject) => (
                  <span
                    key={subject.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                  >
                    {subject.name}
                    {subject.hourlyRate > 0 && (
                      <span className="ml-2 text-xs">от {subject.hourlyRate}₽</span>
                    )}
                  </span>
                ))}
                {tutor.subjects.length > 3 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                    +{tutor.subjects.length - 3} еще
                  </span>
                )}
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 mb-4">
              {tutor.experience > 0 && (
                <span className="text-sm text-muted-foreground">
                  Опыт: {tutor.experience} {getPluralYears(tutor.experience)}
                </span>
              )}
              
              {tutor.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{tutor.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link to={`/tutors/${tutor.id}`}>
                  Подробнее
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="sm">
                <Link to={`/chat/${tutor.id}`}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Написать
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Price section */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-end justify-center">
            {minRate && minRate > 0 ? (
              <div className="bg-primary/5 rounded-lg px-4 py-3 text-center border border-primary/20">
                <p className="text-xs text-muted-foreground">от</p>
                <p className="text-xl font-bold text-primary">{minRate}₽</p>
                <p className="text-xs text-muted-foreground">за урок</p>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg px-4 py-3 text-center">
                <p className="text-sm font-medium text-muted-foreground">По договоренности</p>
              </div>
            )}
          </div>
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