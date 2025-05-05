
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, Star, MapPin, Filter, Clock, MessageSquare, Calendar, Phone, Mail } from "lucide-react";
import { TutorRequestsSection } from "./TutorRequestsSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Tutor {
  id: string;
  name: string;
  avatar?: string;
  subjects: {
    name: string;
    hourly_rate: number;
  }[];
  rating: number;
  reviewsCount: number;
  location: string;
  lastActive?: string;
  isOnline?: boolean;
  phone?: string;
  email?: string;
}

export const TutorsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [myTutors, setMyTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tutors");
  
  // Mock data for demonstration
  const mockTutors: Tutor[] = [
    {
      id: "1",
      name: "Иванов Иван",
      avatar: "https://i.pravatar.cc/150?img=1",
      subjects: [
        { name: "Математика", hourly_rate: 1200 },
        { name: "Физика", hourly_rate: 1300 }
      ],
      rating: 4.8,
      reviewsCount: 24,
      location: "Москва",
      lastActive: "только что",
      isOnline: true,
      phone: "+7 (999) 123-45-67",
      email: "ivanov@example.com"
    },
    {
      id: "2",
      name: "Петрова Анна",
      avatar: "https://i.pravatar.cc/150?img=2",
      subjects: [
        { name: "Английский язык", hourly_rate: 1500 }
      ],
      rating: 4.9,
      reviewsCount: 32,
      location: "Санкт-Петербург",
      lastActive: "2 часа назад",
      isOnline: false,
      phone: "+7 (999) 987-65-43",
      email: "petrova@example.com"
    },
    {
      id: "3",
      name: "Сидоров Алексей",
      subjects: [
        { name: "Химия", hourly_rate: 1100 },
        { name: "Биология", hourly_rate: 1000 }
      ],
      rating: 4.7,
      reviewsCount: 18,
      location: "Новосибирск",
      lastActive: "вчера",
      isOnline: false,
      email: "sidorov@example.com"
    }
  ];
  
  useEffect(() => {
    if (user) {
      // In a real app, this would fetch real data
      // For now, we'll use mock data
      setMyTutors(mockTutors);
      setLoading(false);
    }
  }, [user]);
  
  const filteredTutors = myTutors.filter(tutor => 
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.subjects.some(subject => subject.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    tutor.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const renderTutorContactInfo = (tutor: Tutor) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t">
      {tutor.phone && (
        <Button variant="outline" size="sm" className="flex items-center justify-start">
          <Phone size={14} className="mr-2" />
          <span className="text-xs">{tutor.phone}</span>
        </Button>
      )}
      
      {tutor.email && (
        <Button variant="outline" size="sm" className="flex items-center justify-start">
          <Mail size={14} className="mr-2" />
          <span className="text-xs truncate">{tutor.email}</span>
        </Button>
      )}
    </div>
  );
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-purple-600">Мои репетиторы</h2>
          <Users size={24} className="text-purple-600" />
        </div>
        
        <TabsList className="mb-6">
          <TabsTrigger value="tutors" className="relative">
            Мои репетиторы
            {myTutors.length > 0 && (
              <Badge className="ml-1.5 bg-primary">{myTutors.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Запросы от репетиторов
            <Badge className="ml-1.5 bg-amber-500">2</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tutors" className="mt-0">
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
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : filteredTutors.length > 0 ? (
            <div className="space-y-4">
              {filteredTutors.map((tutor) => (
                <Card key={tutor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="md:w-1/4 flex flex-col items-center text-center">
                        <Avatar className="w-24 h-24 mb-2">
                          {tutor.avatar ? (
                            <AvatarImage src={tutor.avatar} alt={tutor.name} />
                          ) : (
                            <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                          )}
                        </Avatar>
                        
                        <h3 className="font-medium text-lg mb-1">{tutor.name}</h3>
                        
                        <div className="flex items-center text-sm mb-2">
                          <Star size={16} className="text-yellow-500 mr-1" />
                          <span className="font-medium">{tutor.rating}</span>
                          <span className="text-gray-500 ml-1">({tutor.reviewsCount})</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-1">
                          <div className={`w-2 h-2 rounded-full mr-1.5 ${tutor.isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span>{tutor.isOnline ? 'Онлайн' : tutor.lastActive}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={14} className="mr-1" />
                          <span>{tutor.location}</span>
                        </div>
                      </div>
                      
                      <div className="md:w-3/4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {tutor.subjects.map((subject, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm px-3 py-1">
                              {subject.name} - {subject.hourly_rate} ₽/час
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                          <Button 
                            variant="outline" 
                            className="flex items-center justify-center"
                            onClick={() => navigate(`/profile/student/chats/${tutor.id}`)}
                          >
                            <MessageSquare size={16} className="mr-2" />
                            Написать
                          </Button>
                          <Button 
                            variant="outline"
                            className="flex items-center justify-center"
                            onClick={() => navigate(`/tutors/${tutor.id}`)}
                          >
                            <User size={16} className="mr-2" />
                            Профиль
                          </Button>
                          <Button 
                            variant="default"
                            className="flex items-center justify-center"
                          >
                            <Calendar size={16} className="mr-2" />
                            Запланировать занятие
                          </Button>
                        </div>
                        
                        {renderTutorContactInfo(tutor)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <div className="text-gray-500 mb-4 text-lg">
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
        </TabsContent>
        
        <TabsContent value="requests" className="mt-0">
          <TutorRequestsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
