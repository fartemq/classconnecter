
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  MessageSquare,
  Calendar,
  ExternalLink,
  Clock,
  UserX,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const MyTutorsTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for tutors
  const currentTutors = [
    {
      id: "1",
      name: "Иванова Анна",
      avatar: "/placeholder.svg",
      subjects: ["Математика"],
      rating: 4.8,
      reviews: 24,
      nextLesson: "Завтра, 15:00",
      totalLessons: 8
    },
    {
      id: "2",
      name: "Петров Сергей",
      avatar: "/placeholder.svg",
      subjects: ["Английский язык"],
      rating: 4.6,
      reviews: 18,
      nextLesson: "Послезавтра, 17:30",
      totalLessons: 5
    }
  ];
  
  const pastTutors = [
    {
      id: "3",
      name: "Смирнова Ольга",
      avatar: "/placeholder.svg",
      subjects: ["Литература"],
      rating: 4.9,
      reviews: 32,
      lastLesson: "15 мая 2025",
      totalLessons: 12
    }
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Мои репетиторы</h2>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по имени репетитора или предмету..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="h-4 w-4" />
          <span>Фильтры</span>
        </Button>
      </div>
      
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Текущие репетиторы</TabsTrigger>
          <TabsTrigger value="past">Прошлые репетиторы</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-4">
          {currentTutors.length > 0 ? (
            <div className="space-y-4">
              {currentTutors.map(tutor => (
                <Card key={tutor.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Tutor avatar and rating */}
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden bg-gray-100">
                          <img 
                            src={tutor.avatar} 
                            alt={tutor.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex items-center mt-2 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 font-medium">{tutor.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({tutor.reviews})</span>
                        </div>
                      </div>
                      
                      {/* Tutor info */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{tutor.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {tutor.subjects.map(subject => (
                                <Badge key={subject} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Написать
                            </Button>
                            <Button size="sm">
                              <Calendar className="mr-1 h-4 w-4" />
                              Записаться
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-green-600" />
                            <span>Следующее занятие: <strong>{tutor.nextLesson}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            <span>Всего занятий: <strong>{tutor.totalLessons}</strong></span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <UserX className="h-4 w-4 mr-1" />
                            Прекратить занятия
                          </Button>
                          
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Профиль репетитора
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <UserX className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">У вас пока нет репетиторов</h3>
              <p className="mt-1 text-gray-500">
                Найдите репетитора и запишитесь на занятие
              </p>
              <Button className="mt-4">
                <Search className="mr-2 h-4 w-4" />
                Найти репетитора
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-4">
          {pastTutors.length > 0 ? (
            <div className="space-y-4">
              {pastTutors.map(tutor => (
                <Card key={tutor.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Tutor avatar and rating */}
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden bg-gray-100">
                          <img 
                            src={tutor.avatar} 
                            alt={tutor.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex items-center mt-2 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 font-medium">{tutor.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({tutor.reviews})</span>
                        </div>
                      </div>
                      
                      {/* Tutor info */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{tutor.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {tutor.subjects.map(subject => (
                                <Badge key={subject} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3 md:mt-0">
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-1 h-4 w-4" />
                              Написать
                            </Button>
                            <Button size="sm">
                              <Calendar className="mr-1 h-4 w-4" />
                              Записаться снова
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-4 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-600" />
                            <span>Последнее занятие: <strong>{tutor.lastLesson}</strong></span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            <span>Всего занятий: <strong>{tutor.totalLessons}</strong></span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-end">
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Профиль репетитора
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <UserX className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">У вас нет прошлых репетиторов</h3>
              <p className="mt-1 text-gray-500">
                Здесь будут отображаться репетиторы, с которыми вы прекратили занятия
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
