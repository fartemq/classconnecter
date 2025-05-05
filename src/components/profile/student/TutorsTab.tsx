
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Users, Star, MapPin, Filter, Clock, Loader2 } from "lucide-react";
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
}

export const TutorsTab = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [myTutors, setMyTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tutors");
  
  useEffect(() => {
    if (user) {
      fetchMyTutors();
    }
  }, [user]);
  
  const fetchMyTutors = async () => {
    try {
      setLoading(true);
      
      // Get all accepted requests for the current student
      const { data: requestsData, error: requestsError } = await supabase
        .from('student_requests')
        .select(`
          tutor_id,
          status,
          tutor:profiles!tutor_id(
            id,
            first_name,
            last_name,
            avatar_url,
            city
          )
        `)
        .eq('student_id', user!.id)
        .eq('status', 'accepted');
      
      if (requestsError) {
        console.error("Error fetching requests:", requestsError);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить данные о репетиторах",
          variant: "destructive"
        });
        return;
      }
      
      if (!requestsData || requestsData.length === 0) {
        setMyTutors([]);
        setLoading(false);
        return;
      }
      
      // Get tutor subjects for each tutor
      const tutorsWithSubjects = await Promise.all(
        requestsData.map(async (request) => {
          // Get tutor subjects
          const { data: subjectsData, error: subjectsError } = await supabase
            .from('tutor_subjects')
            .select(`
              hourly_rate,
              subject:subject_id(name)
            `)
            .eq('tutor_id', request.tutor_id);
          
          if (subjectsError) {
            console.error("Error fetching tutor subjects:", subjectsError);
            return null;
          }
          
          // Format subjects
          const subjects = subjectsData?.map(subject => ({
            name: subject.subject?.name || "Unknown",
            hourly_rate: subject.hourly_rate
          })) || [];
          
          // Create tutor object
          return {
            id: request.tutor.id,
            name: `${request.tutor.first_name} ${request.tutor.last_name || ''}`.trim(),
            avatar: request.tutor.avatar_url,
            subjects,
            rating: 4 + Math.random(), // Mock rating
            reviewsCount: Math.floor(Math.random() * 30), // Mock review count
            location: request.tutor.city || "Не указан",
            lastActive: "недавно" // Mock last active
          };
        })
      );
      
      // Filter out null values (failed fetches)
      setMyTutors(tutorsWithSubjects.filter(Boolean) as Tutor[]);
    } catch (error) {
      console.error("Error fetching my tutors:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные о репетиторах",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredTutors = myTutors.filter(tutor => 
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tutor.subjects.some(subject => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tutors" className="relative">
            Мои репетиторы
          </TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Запросы от репетиторов
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tutors" className="mt-0">
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
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTutors.length > 0 ? (
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
                        {tutor.subjects.map((subject, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {subject.name}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Star size={14} className="text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">{tutor.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500 ml-1">({tutor.reviewsCount})</span>
                        </div>
                        <div className="text-sm font-medium">
                          {tutor.subjects.length > 0 
                            ? `от ${Math.min(...tutor.subjects.map(s => s.hourly_rate))} ₽/час` 
                            : "Цена не указана"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 grid grid-cols-2 gap-2 border-t">
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
        </TabsContent>
        
        <TabsContent value="requests" className="mt-0">
          <TutorRequestsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
