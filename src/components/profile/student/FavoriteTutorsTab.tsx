
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Search, Star, MapPin, MessageSquare, Calendar, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface FavoriteTutor {
  id: string;
  name: string;
  avatar?: string;
  subjects: string[];
  rating: number;
  reviewsCount: number;
  price: number;
  location: string;
  isOnline: boolean;
  lastActive: string;
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
      location: "Москва",
      isOnline: true,
      lastActive: "сейчас"
    },
    {
      id: "2",
      name: "Игорь Васильев",
      avatar: "https://i.pravatar.cc/150?img=3",
      subjects: ["Английский язык"],
      rating: 4.9,
      reviewsCount: 32,
      price: 1500,
      location: "Санкт-Петербург",
      isOnline: false,
      lastActive: "2 часа назад"
    },
    {
      id: "3",
      name: "Ольга Смирнова",
      avatar: "https://i.pravatar.cc/150?img=5",
      subjects: ["Химия", "Биология"],
      rating: 4.7,
      reviewsCount: 18,
      price: 1300,
      location: "Новосибирск",
      isOnline: false,
      lastActive: "вчера"
    }
  ];
  
  const handleRemoveFromFavorites = (tutorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would remove the tutor from favorites via API call
    console.log(`Removing tutor ${tutorId} from favorites`);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-red-500">Избранные репетиторы</h2>
        <Heart className="text-red-500" size={24} />
      </div>
      
      <Tabs defaultValue="grid" className="w-full mb-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="grid">Сетка</TabsTrigger>
            <TabsTrigger value="list">Список</TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/tutors")}
            className="text-sm"
          >
            <Search size={16} className="mr-2" />
            Найти репетиторов
          </Button>
        </div>
        
        <TabsContent value="grid" className="mt-0">
          {favoriteTutors && favoriteTutors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteTutors.map((tutor) => (
                <Card key={tutor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Avatar className="h-16 w-16">
                          {tutor.avatar ? (
                            <AvatarImage src={tutor.avatar} alt={tutor.name} />
                          ) : (
                            <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 h-8 w-8"
                          onClick={(e) => handleRemoveFromFavorites(tutor.id, e)}
                        >
                          <X size={18} />
                        </Button>
                      </div>
                      
                      <h3 className="font-medium text-base mb-1">{tutor.name}</h3>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <div className={`w-2 h-2 rounded-full mr-1.5 ${tutor.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>{tutor.isOnline ? 'Онлайн' : tutor.lastActive}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin size={14} className="mr-1" />
                        <span>{tutor.location}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tutor.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs px-2 py-0.5">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mb-4">
                        <div className="flex items-center">
                          <Star size={14} className="text-yellow-500 mr-1" />
                          <span className="font-medium">{tutor.rating}</span>
                          <span className="text-gray-500 ml-1">({tutor.reviewsCount})</span>
                        </div>
                        <div className="font-medium">
                          {tutor.price} ₽/час
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-sm"
                          onClick={() => navigate(`/profile/student/chats/${tutor.id}`)}
                        >
                          <MessageSquare size={14} className="mr-1.5" />
                          Написать
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full text-sm"
                          onClick={() => navigate(`/tutors/${tutor.id}`)}
                        >
                          <Calendar size={14} className="mr-1.5" />
                          Занятие
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-gray-500 mb-4 text-lg">
                У вас пока нет избранных репетиторов
              </div>
              <Button onClick={() => navigate("/tutors")} className="flex items-center">
                <Search size={16} className="mr-2" />
                Найти репетитора
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          {favoriteTutors && favoriteTutors.length > 0 ? (
            <div className="space-y-4">
              {favoriteTutors.map((tutor) => (
                <Card key={tutor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        {tutor.avatar ? (
                          <AvatarImage src={tutor.avatar} alt={tutor.name} />
                        ) : (
                          <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{tutor.name}</h3>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 h-6 w-6"
                            onClick={(e) => handleRemoveFromFavorites(tutor.id, e)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <MapPin size={14} className="mr-1" />
                          <span>{tutor.location}</span>
                          <span className="mx-2">•</span>
                          <div className={`w-2 h-2 rounded-full mr-1 ${tutor.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>{tutor.isOnline ? 'Онлайн' : tutor.lastActive}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {tutor.subjects.map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs px-1.5 py-0.5">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <Star size={14} className="text-yellow-500 mr-1" />
                            <span className="font-medium">{tutor.rating}</span>
                            <span className="text-gray-500 ml-1">({tutor.reviewsCount})</span>
                          </div>
                          <div className="font-medium">
                            {tutor.price} ₽/час
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => navigate(`/profile/student/chats/${tutor.id}`)}
                        >
                          Написать
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => navigate(`/tutors/${tutor.id}`)}
                        >
                          Профиль
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <div className="text-gray-500 mb-4 text-lg">
                У вас пока нет избранных репетиторов
              </div>
              <Button onClick={() => navigate("/tutors")} className="flex items-center">
                <Search size={16} className="mr-2" />
                Найти репетитора
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
