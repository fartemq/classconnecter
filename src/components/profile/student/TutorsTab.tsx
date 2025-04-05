
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Users, Star, MapPin, Filter, Clock, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Tutor {
  id: string;
  name: string;
  avatar?: string;
  subjects: string[];
  rating: number;
  reviewsCount: number;
  price: number;
  location: string;
  availability?: string;
  lastActive?: string;
}

export const TutorsTab = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Mock data - would come from database in real app
  const myTutors: Tutor[] = [
    {
      id: "1",
      name: "Анна Петрова",
      avatar: "",
      subjects: ["Математика", "Физика"],
      rating: 4.8,
      reviewsCount: 24,
      price: 1200,
      location: "Москва",
      availability: "Пн, Ср, Пт",
      lastActive: "3 часа назад"
    },
    {
      id: "2",
      name: "Сергей Иванов",
      avatar: "",
      subjects: ["Английский язык"],
      rating: 4.5,
      reviewsCount: 19,
      price: 950,
      location: "Санкт-Петербург",
      availability: "Вт, Чт, Сб",
      lastActive: "1 день назад"
    }
  ];
  
  const filteredTutors = myTutors.filter(tutor => 
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Мои репетиторы</h2>
        <Users size={20} />
      </div>
      
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Поиск репетиторов или предметов..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Фильтры</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>По рейтингу</DropdownMenuItem>
              <DropdownMenuItem>По цене (возрастание)</DropdownMenuItem>
              <DropdownMenuItem>По цене (убывание)</DropdownMenuItem>
              <DropdownMenuItem>По доступности</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={() => navigate("/tutors")}>
            <Search size={16} className="mr-2" />
            Найти нового
          </Button>
        </div>
      </div>
      
      {filteredTutors && filteredTutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTutors.map((tutor) => (
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
                  <h3 className="font-medium mb-1">{tutor.name}</h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin size={14} className="mr-1" />
                    <span>{tutor.location}</span>
                    <span className="mx-2">•</span>
                    <Clock size={14} className="mr-1" />
                    <span>{tutor.lastActive}</span>
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
              <div className="bg-gray-50 p-3 grid grid-cols-2 gap-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className=""
                  onClick={() => navigate(`/profile/student/chats?tutor=${tutor.id}`)}
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
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users size={48} className="mx-auto mb-4 text-gray-300" />
          <div className="text-gray-500 mb-4">
            {searchTerm 
              ? "По вашему запросу ничего не найдено" 
              : "У вас пока нет репетиторов"}
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
