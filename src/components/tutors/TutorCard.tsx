
import React, { useState } from "react";
import { BookOpen, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrialLessonBooking } from "@/components/profile/student/booking/TrialLessonBooking";
import { useNavigate } from "react-router-dom";
import { getInitials } from "@/lib/utils";

interface TutorCardProps {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  rating?: number;
  reviewsCount?: number;
  experience?: number | null;
  subjects?: Array<{
    id: string;
    name: string;
    hourlyRate: number;
  }>;
  isVerified?: boolean;
}

export const TutorCard: React.FC<TutorCardProps> = ({
  id,
  name,
  avatar,
  city,
  rating = 0,
  reviewsCount = 0,
  experience = 0,
  subjects = [],
  isVerified = false,
}) => {
  const [showTrialBooking, setShowTrialBooking] = useState(false);
  const navigate = useNavigate();
  
  const nameParts = name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  
  const validSubjects = subjects.filter(s => typeof s.hourlyRate === 'number' && s.hourlyRate > 0);
  const lowestPrice = validSubjects.length > 0
    ? Math.min(...validSubjects.map(s => s.hourlyRate))
    : 0;
  
  const formattedPrice = lowestPrice > 0
    ? new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
      }).format(lowestPrice)
    : "По запросу";
  
  const handleViewProfile = () => {
    navigate(`/tutors/${id}`);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-4">
            {/* Avatar section */}
            <div className="col-span-3 sm:col-span-2 p-4 flex items-center justify-center">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                {avatar ? (
                  <AvatarImage src={`${avatar}?t=${Date.now()}`} alt={name} />
                ) : (
                  <AvatarFallback>
                    {getInitials(firstName, lastName)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            
            {/* Info section */}
            <div className="col-span-9 sm:col-span-7 p-4 flex flex-col justify-center">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <h3 className="font-semibold text-lg">{name}</h3>
                {isVerified && (
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 w-fit">
                    Проверено
                  </Badge>
                )}
              </div>
              
              {city && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{city}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {rating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm font-medium">
                      {rating.toFixed(1)} <span className="text-muted-foreground font-normal">({reviewsCount})</span>
                    </span>
                  </div>
                )}
                
                {experience !== null && experience !== undefined && experience > 0 && (
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm">
                      Опыт: {experience} {experience === 1 ? "год" : experience < 5 ? "года" : "лет"}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-2">
                <div className="text-sm font-medium">Предметы:</div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {subjects.slice(0, 3).map((subject) => (
                    <Badge key={subject.id} variant="secondary" className="font-normal">
                      {subject.name}
                    </Badge>
                  ))}
                  {subjects.length > 3 && (
                    <Badge variant="outline">+{subjects.length - 3}</Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Price and button section */}
            <div className="col-span-12 sm:col-span-3 bg-gray-50 p-4 flex flex-col justify-center items-center">
              <div className="text-center w-full mb-3">
                <div className="text-sm text-gray-500">от</div>
                <div className="text-xl font-bold">{formattedPrice}</div>
                <div className="text-sm text-gray-500">за занятие</div>
              </div>
              
              <div className="flex flex-col gap-2 w-full">
                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={handleViewProfile}
                >
                  Смотреть профиль
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0" 
                  onClick={() => setShowTrialBooking(true)}
                >
                  Пробное занятие
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TrialLessonBooking
        isOpen={showTrialBooking}
        onClose={() => setShowTrialBooking(false)}
        tutor={{
          id: id,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatar
        }}
      />
    </>
  );
};
