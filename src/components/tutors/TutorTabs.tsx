
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarPlus, GraduationCap, MessageSquare, Star, Clock } from "lucide-react";
import { PublicTutorProfile } from "@/services/publicTutorService";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TutorTabsProps {
  tutor: PublicTutorProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBookLesson: () => void;
}

export const TutorTabs = ({ tutor, activeTab, setActiveTab, onBookLesson }: TutorTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="about">О репетиторе</TabsTrigger>
        <TabsTrigger value="schedule">Расписание</TabsTrigger>
        <TabsTrigger value="reviews">Отзывы</TabsTrigger>
      </TabsList>
      
      <TabsContent value="about" className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <GraduationCap className="mr-2 h-5 w-5 text-primary" />
              Образование
            </h3>
            <div className="mb-6">
              {tutor.education_institution && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Учебное заведение</p>
                  <p>{tutor.education_institution}</p>
                </div>
              )}
              {tutor.degree && (
                <div>
                  <p className="text-sm text-gray-600">Специальность</p>
                  <p>{tutor.degree}</p>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-3">О себе</h3>
            <div className="prose max-w-none">
              <p>{tutor.bio || "Информация не указана"}</p>
            </div>
            
            {tutor.methodology && (
              <>
                <h3 className="text-lg font-semibold mb-3 mt-6">Методика преподавания</h3>
                <div className="prose max-w-none">
                  <p>{tutor.methodology}</p>
                </div>
              </>
            )}
            
            <h3 className="text-lg font-semibold mb-3 mt-6">Предметы и стоимость</h3>
            <div className="grid gap-2">
              {tutor.subjects.map(subject => (
                <div key={subject.id} className="flex justify-between items-center py-2 border-b">
                  <div className="font-medium">{subject.name}</div>
                  <div className="font-semibold">{subject.hourlyRate} ₽/час</div>
                </div>
              ))}
            </div>
            
            {/* Book Lesson CTA */}
            <div className="bg-gray-50 p-4 rounded-lg mt-8 flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h4 className="font-medium">Готовы начать заниматься?</h4>
                <p className="text-gray-600">Выберите удобное время в расписании репетитора</p>
              </div>
              <Button onClick={onBookLesson}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Забронировать занятие
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="schedule">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-6">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Расписание занятий</h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 flex items-center">
              <Clock className="h-5 w-5 text-primary mr-3" />
              <div>
                <p>Чтобы увидеть доступные слоты и забронировать занятие, нажмите на кнопку ниже.</p>
                <p className="text-sm text-gray-600 mt-1">
                  Вы можете выбрать удобное время из расписания репетитора.
                </p>
              </div>
            </div>
            
            <Button onClick={onBookLesson} className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Посмотреть доступное время
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="reviews">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center mb-6">
              <Star className="h-5 w-5 mr-2 text-primary" />
              <h3 className="text-lg font-semibold">Отзывы учеников</h3>
            </div>
            
            {/* Empty state for now, reviews would be fetched and displayed here */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 mb-2">
                Пока нет отзывов об этом репетиторе
              </p>
              <p className="text-sm">
                Станьте первым, кто оставит отзыв после занятия.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
