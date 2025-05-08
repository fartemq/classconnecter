
import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, Star, MapPin, Book, Clock, ChevronRight, Calendar, RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { Slider } from "@/components/ui/slider";
import { fetchPublicTutors, PublicTutorProfile } from "@/services/publicTutorService";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TutorScheduleView } from "./schedule/TutorScheduleView";

export const FindTutorsTab = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([1000, 5000]);
  const [tutors, setTutors] = useState<PublicTutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  
  // Fetch tutors function
  const loadTutors = useCallback(async () => {
    try {
      setLoading(true);
      const tutorsData = await fetchPublicTutors();
      console.log("Loaded tutors:", tutorsData);
      setTutors(tutorsData);
      
      if (tutorsData.length === 0) {
        toast({
          title: "Репетиторы не найдены",
          description: "В данный момент нет доступных репетиторов",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список репетиторов",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  
  // Fetch tutors on component mount
  useEffect(() => {
    loadTutors();
  }, [loadTutors]);
  
  // Handle manual refresh
  const handleRefresh = () => {
    loadTutors();
  };
  
  // Filter tutors based on search term and price range
  const filteredTutors = tutors.filter(tutor => {
    const fullName = `${tutor.first_name} ${tutor.last_name || ''}`.toLowerCase();
    const subjectNames = tutor.subjects.map(s => s.name.toLowerCase()).join(' ');
    const cityMatch = tutor.city ? tutor.city.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    
    // Search match
    const searchMatch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) || 
      subjectNames.includes(searchTerm.toLowerCase()) ||
      cityMatch;
      
    // Price match - check if any subject's hourly rate is within the range
    const priceMatch = tutor.subjects.some(
      subject => subject.hourly_rate >= priceRange[0] && subject.hourly_rate <= priceRange[1]
    );
    
    return searchMatch && priceMatch;
  });

  const handleOpenSchedule = (tutorId: string) => {
    setSelectedTutorId(tutorId);
    setScheduleOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering happens automatically via filteredTutors
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Поиск репетиторов</h2>
        <Button 
          onClick={handleRefresh} 
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>
      
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по предмету, имени или местоположению..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit" className="md:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Найти
        </Button>
      </form>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Фильтры</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-auto py-1"
                onClick={() => {
                  setSearchTerm('');
                  setPriceRange([1000, 5000]);
                }}
              >
                Сбросить
              </Button>
            </div>
            
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="subject" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Предмет
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите предмет" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="math">Математика</SelectItem>
                        <SelectItem value="physics">Физика</SelectItem>
                        <SelectItem value="english">Английский язык</SelectItem>
                        <SelectItem value="russian">Русский язык</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="price" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Стоимость
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between text-sm">
                      <span>{priceRange[0]} ₽</span>
                      <span>{priceRange[1]} ₽</span>
                    </div>
                    <Slider
                      value={priceRange}
                      min={500}
                      max={10000}
                      step={100}
                      onValueChange={setPriceRange}
                      className="my-4"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="location" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Местоположение
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    <Input placeholder="Город, район..." />
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="format" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Формат занятий
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center">
                      <input id="online" type="checkbox" className="mr-2" />
                      <label htmlFor="online" className="text-sm">Онлайн</label>
                    </div>
                    <div className="flex items-center">
                      <input id="offline" type="checkbox" className="mr-2" />
                      <label htmlFor="offline" className="text-sm">Очно</label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="experience" className="border-b">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Опыт
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center">
                      <input id="exp1" type="radio" name="exp" className="mr-2" />
                      <label htmlFor="exp1" className="text-sm">Любой опыт</label>
                    </div>
                    <div className="flex items-center">
                      <input id="exp2" type="radio" name="exp" className="mr-2" />
                      <label htmlFor="exp2" className="text-sm">От 1 года</label>
                    </div>
                    <div className="flex items-center">
                      <input id="exp3" type="radio" name="exp" className="mr-2" />
                      <label htmlFor="exp3" className="text-sm">От 3 лет</label>
                    </div>
                    <div className="flex items-center">
                      <input id="exp4" type="radio" name="exp" className="mr-2" />
                      <label htmlFor="exp4" className="text-sm">От 5 лет</label>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <Button className="w-full mt-4">Применить фильтры</Button>
          </CardContent>
        </Card>
        
        {/* Tutors list */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader size="lg" />
              <span className="ml-4 text-gray-600">Загрузка репетиторов...</span>
            </div>
          ) : filteredTutors.length > 0 ? (
            filteredTutors.map(tutor => {
              const fullName = `${tutor.first_name} ${tutor.last_name || ''}`.trim();
              const lowestPrice = tutor.subjects.length > 0 
                ? Math.min(...tutor.subjects.map(s => s.hourly_rate)) 
                : 0;
              
              return (
                <Card key={tutor.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Tutor avatar and rating */}
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full border flex items-center justify-center overflow-hidden bg-gray-100">
                          {tutor.avatar_url ? (
                            <img 
                              src={tutor.avatar_url} 
                              alt={fullName} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl text-gray-400">{tutor.first_name[0]}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center mt-2 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 font-medium">{tutor.rating ? tutor.rating.toFixed(1) : 'N/A'}</span>
                        </div>
                      </div>
                      
                      {/* Tutor info */}
                      <div className="flex-grow space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {fullName}
                            </h3>
                            {tutor.city && (
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="h-3 w-3 mr-1" />
                                {tutor.city}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-right">
                              <span className="font-medium text-lg">{lowestPrice} ₽</span>
                              <span className="text-gray-500 text-sm"> / час</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Book className="h-4 w-4 text-gray-500" />
                          {tutor.subjects.map((subject, idx) => (
                            <Badge key={`${subject.id}-${idx}`} variant="outline" className="bg-gray-50">
                              {subject.name}
                            </Badge>
                          ))}
                        </div>
                        
                        {tutor.experience !== null && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            Опыт: {tutor.experience} лет
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/profile/student/chats/${tutor.id}`)}
                            className="sm:text-sm"
                          >
                            Связаться
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenSchedule(tutor.id)}
                            className="sm:text-sm"
                          >
                            <Calendar className="mr-1 h-4 w-4" />
                            Расписание
                          </Button>
                          
                          <Button 
                            size="sm"
                            onClick={() => navigate(`/tutors/${tutor.id}`)}
                            className="sm:text-sm"
                          >
                            Подробнее
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-medium mb-2">Репетиторы не найдены</h3>
                <p className="text-gray-600 mb-4">
                  По заданным критериям не найдено ни одного репетитора. Попробуйте изменить параметры поиска или обновить страницу.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setPriceRange([1000, 5000]);
                    }}
                  >
                    Сбросить фильтры
                  </Button>
                  <Button onClick={handleRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Обновить
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tutor Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Расписание репетитора</DialogTitle>
          </DialogHeader>
          {selectedTutorId && (
            <TutorScheduleView tutorId={selectedTutorId} onClose={() => setScheduleOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
