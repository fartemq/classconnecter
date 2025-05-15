
import React from "react";
import { BookOpen, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();
  
  // Extract first and last name from full name
  const nameParts = name.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  
  // Format the lowest price from subjects
  const lowestPrice = subjects.length > 0
    ? Math.min(...subjects.map(s => s.hourlyRate))
    : 0;
  
  const formattedPrice = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(lowestPrice);
  
  // Handle view profile click - navigate to tutor's public profile
  const handleViewProfile = () => {
    navigate(`/tutors/${id}`);
  };
  
  // Handle contact click - navigate to chat with tutor
  const handleContact = () => {
    navigate(`/profile/student/chats/${id}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-12 gap-4">
          {/* Avatar section */}
          <div className="col-span-3 sm:col-span-2 p-4 flex items-center justify-center">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              {avatar ? (
                <AvatarImage src={avatar} alt={name} />
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
              
              {experience !== null && experience > 0 && (
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm">
                    Опыт: {experience} {experience === 1 ? "год" : experience < 5 ? "года" : "лет"}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-2">
              <div className="text-sm font-medium">Предметы и стоимость:</div>
              <div className="flex flex-wrap gap-2 mt-1">
                {subjects.slice(0, 3).map((subject) => (
                  <Badge key={subject.id} variant="secondary" className="font-normal">
                    {subject.name}: от {new Intl.NumberFormat("ru-RU", {
                      style: "currency",
                      currency: "RUB",
                      maximumFractionDigits: 0,
                    }).format(subject.hourlyRate)}/ч
                  </Badge>
                ))}
                {subjects.length > 3 && (
                  <Badge variant="outline">+{subjects.length - 3}</Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Price and buttons section */}
          <div className="col-span-12 sm:col-span-3 bg-gray-50 p-4 flex flex-col justify-center items-center">
            <div className="text-right w-full mb-3">
              <div className="text-sm text-gray-500">от</div>
              <div className="text-xl font-bold">{formattedPrice}</div>
              <div className="text-sm text-gray-500">за занятие</div>
            </div>
            
            <div className="flex flex-col w-full gap-2">
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={handleViewProfile}
              >
                Посмотреть профиль
              </Button>
              
              <Button 
                variant="default" 
                className="w-full"
                onClick={handleContact}
              >
                Связаться
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
