import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Star, GraduationCap, MapPin } from "lucide-react";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Избранные репетиторы</h2>
        <Heart className="text-red-500" size={20} />
      </div>
      
      {favoriteTutors && favoriteTutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteTutors.map((tutor) => (
            <Card key={tutor.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 flex flex-col sm:flex-row gap-4">
                <Avatar className="w-16 h-16">
                  {tutor.avatar ? (
                    <AvatarImage src={tutor.avatar} alt={tutor.name} />
                  ) : (
                    <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{tutor.name}</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Remove from favorites logic
                      }}
                    >
                      <Heart size={16} fill="currentColor" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span>{tutor.location}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tutor.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{tutor.rating}</span>
                      <span className="text-xs text-gray-500 ml-1">({tutor.reviewsCount})</span>
                    </div>
                    <div className="text-sm font-medium">
                      {tutor.price} ₽/час
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 border-t">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate(`/tutors/${tutor.id}`)}
                >
                  Просмотреть профиль
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            У вас пока нет избранных репетиторов
          </div>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/tutors")} className="flex items-center">
              <Search size={16} className="mr-2" />
              Найти репетитора
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
