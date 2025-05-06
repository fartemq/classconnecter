
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, Star, MapPin, Book, Clock, ChevronRight
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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

export const FindTutorsTab = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([1000, 5000]);
  
  // Mock data for tutors
  const tutors = [
    {
      id: "1",
      name: "Иванова Анна",
      avatar: "/placeholder.svg",
      subjects: ["Математика", "Физика"],
      rating: 4.8,
      reviews: 24,
      price: 1200,
      location: "Москва",
      experience: 5,
      online: true,
      verified: true
    },
    {
      id: "2",
      name: "Петров Сергей",
      avatar: "/placeholder.svg",
      subjects: ["Английский язык", "Немецкий язык"],
      rating: 4.6,
      reviews: 18,
      price: 1500,
      location: "Санкт-Петербург",
      experience: 7,
      online: true,
      verified: true
    },
    {
      id: "3",
      name: "Смирнова Ольга",
      avatar: "/placeholder.svg",
      subjects: ["Литература", "Русский язык"],
      rating: 4.9,
      reviews: 32,
      price: 1300,
      location: "Казань",
      experience: 10,
      online: false,
      verified: true
    }
  ];
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Поиск репетиторов</h2>
      
      {/* Search bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по предмету, имени или местоположению..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="md:w-auto">
          <Search className="mr-2 h-4 w-4" />
          Найти
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Фильтры</h3>
              <Button variant="ghost" size="sm" className="text-xs h-auto py-1">
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
          {tutors.map(tutor => (
            <Card key={tutor.id} className="hover:shadow-md transition-shadow">
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
                  <div className="flex-grow space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {tutor.name}
                          {tutor.verified && (
                            <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                              ✓ Проверен
                            </Badge>
                          )}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {tutor.location}
                        </div>
                      </div>
                      <div>
                        <div className="text-right">
                          <span className="font-medium text-lg">{tutor.price} ₽</span>
                          <span className="text-gray-500 text-sm"> / час</span>
                        </div>
                        {tutor.online && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Онлайн
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Book className="h-4 w-4 text-gray-500" />
                      {tutor.subjects.map(subject => (
                        <Badge key={subject} variant="outline" className="bg-gray-50">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Опыт: {tutor.experience} лет
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <Button 
                        onClick={() => navigate(`/tutors/${tutor.id}`)}
                        className="sm:text-sm"
                        size="sm"
                      >
                        Подробнее
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
