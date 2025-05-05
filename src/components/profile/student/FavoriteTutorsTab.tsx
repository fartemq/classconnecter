
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heart, Search, Star, MapPin } from "lucide-react";

interface FavoriteTutor {
  id: string;
  name: string;
  avatar?: string;
  subjects: string[];
  rating: number;
  reviewsCount: number;
  price: number;
  location: string;
}

export const FavoriteTutorsTab = () => {
  const navigate = useNavigate();
  
  // Example data - in a real app, this would come from an API call
  const favoriteTutors: FavoriteTutor[] = [
    {
      id: "1",
      name: "Анна Петрова",
      avatar: "https://i.pravatar.cc/150?img=1",
      subjects: ["Математика", "Физика"],
      rating: 4.8,
      reviewsCount: 24,
      price: 1200,
      location: "Москва"
    },
    {
      id: "2",
      name: "Игорь Васильев",
      avatar: "https://i.pravatar.cc/150?img=3",
      subjects: ["Английский язык"],
      rating: 4.9,
      reviewsCount: 32,
      price: 1500,
      location: "Санкт-Петербург"
    }
  ];
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Избранные репетиторы</h2>
        <Heart className="text-red-500" size={20} />
      </div>
      
      {favoriteTutors && favoriteTutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {favoriteTutors.map((tutor) => (
            <Card key={tutor.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-3 flex flex-col sm:flex-row gap-3">
                <Avatar className="w-12 h-12">
                  {tutor.avatar ? (
                    <AvatarImage src={tutor.avatar} alt={tutor.name} />
                  ) : (
                    <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-sm">{tutor.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 h-5 w-5"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Remove from favorites logic
                      }}
                    >
                      <Heart size={14} fill="currentColor" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <MapPin size={12} className="mr-1" />
                    <span>{tutor.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-1">
                    {tutor.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs px-2 py-0.5">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center">
                      <Star size={12} className="text-yellow-500 mr-1" />
                      <span className="font-medium">{tutor.rating}</span>
                      <span className="text-gray-500 ml-1">({tutor.reviewsCount})</span>
                    </div>
                    <div className="font-medium">
                      {tutor.price} ₽/час
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-2 border-t">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => navigate(`/tutors/${tutor.id}`)}
                >
                  Просмотреть профиль
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-gray-500 mb-3 text-sm">
            У вас пока нет избранных репетиторов
          </div>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/tutors")} size="sm" className="flex items-center text-xs">
              <Search size={14} className="mr-1" />
              Найти репетитора
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
