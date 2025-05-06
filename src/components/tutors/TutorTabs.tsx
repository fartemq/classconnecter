
import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { PublicTutorProfile } from "@/services/publicTutorService";

interface TutorTabsProps {
  tutor: PublicTutorProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onBookLesson: () => void;
}

export const TutorTabs = ({ tutor, activeTab, setActiveTab, onBookLesson }: TutorTabsProps) => {
  return (
    <Card className="border-none shadow">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full border-b rounded-none px-6">
          <TabsTrigger value="about">Подробная информация</TabsTrigger>
          <TabsTrigger value="subjects">Предметы и цены</TabsTrigger>
          <TabsTrigger value="schedule">Расписание</TabsTrigger>
        </TabsList>
        
        <div className="p-6">
          <TabsContent value="about">
            <AboutTabContent tutor={tutor} />
          </TabsContent>
          
          <TabsContent value="subjects">
            <SubjectsTabContent tutor={tutor} />
          </TabsContent>
          
          <TabsContent value="schedule">
            <ScheduleTabContent onBookLesson={onBookLesson} />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

interface AboutTabContentProps {
  tutor: PublicTutorProfile;
}

const AboutTabContent = ({ tutor }: AboutTabContentProps) => {
  const hasInfo = tutor.methodology || tutor.education_institution || tutor.achievements;
  
  if (!hasInfo) {
    return (
      <div className="text-center py-8 text-gray-500">
        Нет дополнительной информации
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {tutor.methodology && (
        <div>
          <h3 className="text-lg font-medium mb-2">Методология преподавания</h3>
          <p className="text-gray-700">{tutor.methodology}</p>
        </div>
      )}
      
      {tutor.education_institution && (
        <div>
          <h3 className="text-lg font-medium mb-2">Образование</h3>
          <p className="text-gray-700">
            {tutor.education_institution}
            {tutor.degree ? `, ${tutor.degree}` : ''}
            {tutor.graduation_year ? ` (${tutor.graduation_year})` : ''}
          </p>
        </div>
      )}
      
      {tutor.achievements && (
        <div>
          <h3 className="text-lg font-medium mb-2">Достижения</h3>
          <p className="text-gray-700">{tutor.achievements}</p>
        </div>
      )}
    </div>
  );
};

interface SubjectsTabContentProps {
  tutor: PublicTutorProfile;
}

const SubjectsTabContent = ({ tutor }: SubjectsTabContentProps) => {
  if (tutor.subjects.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Нет информации о предметах
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {tutor.subjects.map((subject) => (
        <Card key={subject.id} className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle>{subject.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-2">
              <span>Стоимость:</span>
              <span className="font-medium">{subject.hourly_rate} ₽/час</span>
            </div>
            {subject.experience_years && (
              <div className="flex justify-between mb-2">
                <span>Опыт преподавания:</span>
                <span>{subject.experience_years} лет</span>
              </div>
            )}
            {subject.description && (
              <div className="mt-2">
                <h4 className="font-medium mb-1">Описание:</h4>
                <p className="text-gray-700 text-sm">{subject.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

interface ScheduleTabContentProps {
  onBookLesson: () => void;
}

const ScheduleTabContent = ({ onBookLesson }: ScheduleTabContentProps) => {
  return (
    <div className="text-center py-8">
      <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">Забронировать занятие</h3>
      <p className="text-gray-500 mb-4">
        Чтобы забронировать занятие с репетитором в удобное для вас время, нажмите кнопку ниже
      </p>
      <Button 
        onClick={onBookLesson}
        className="mt-4"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Забронировать занятие
      </Button>
    </div>
  );
};

// Add missing imports
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
