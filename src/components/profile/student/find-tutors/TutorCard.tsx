
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, BookOpen, Clock, User, Calendar } from "lucide-react";
import { ScheduleBasedLessonRequestModal } from "../ScheduleBasedLessonRequestModal";
import { useNavigate } from "react-router-dom";

interface TutorCardProps {
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    city?: string;
    bio?: string;
    subjects?: Array<{
      subject: { name: string };
      hourly_rate?: number;
      experience_years?: number;
    }>;
    reviews?: {
      average_rating: number;
      total_reviews: number;
    };
    is_online?: boolean;
  };
}

export const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  const averageRate = tutor.subjects?.length ? 
    Math.round(tutor.subjects.reduce((sum, s) => sum + (s.hourly_rate || 0), 0) / tutor.subjects.length) : 0;

  const totalExperience = tutor.subjects?.length ?
    Math.max(...tutor.subjects.map(s => s.experience_years || 0)) : 0;

  const handleViewProfile = () => {
    navigate(`/tutors/${tutor.id}`);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={tutor.avatar_url} alt={tutor.first_name} />
                <AvatarFallback className="text-lg">
                  {tutor.first_name[0]}{tutor.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              {tutor.is_online && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {tutor.first_name} {tutor.last_name}
                  </h3>
                  
                  {tutor.city && (
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {tutor.city}
                    </div>
                  )}
                </div>
              </div>

              {/* Rating and Experience */}
              <div className="flex items-center gap-4 mt-2">
                {tutor.reviews && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {tutor.reviews.average_rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      ({tutor.reviews.total_reviews})
                    </span>
                  </div>
                )}
                
                {totalExperience > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {totalExperience} лет опыта
                  </div>
                )}
              </div>

              {/* Subjects */}
              {tutor.subjects && tutor.subjects.length > 0 && (
                <div className="flex items-center mt-3">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="flex flex-wrap gap-1">
                    {tutor.subjects.slice(0, 3).map((subject, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {subject.subject.name}
                      </Badge>
                    ))}
                    {tutor.subjects.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{tutor.subjects.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {tutor.bio && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                  {tutor.bio}
                </p>
              )}

              {/* Price and Actions */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-lg font-semibold">
                  {averageRate > 0 ? `от ${averageRate} ₽/час` : 'Цена договорная'}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewProfile}
                    className="flex items-center gap-1"
                  >
                    <User className="h-4 w-4" />
                    Профиль
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    Запрос на занятие
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScheduleBasedLessonRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        tutor={{
          id: tutor.id,
          first_name: tutor.first_name,
          last_name: tutor.last_name,
          avatar_url: tutor.avatar_url
        }}
      />
    </>
  );
};
