
import React from "react";
import { Profile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Award, 
  VideoIcon, 
  Clock, 
  MapPin,
  GraduationCap,
  Briefcase,
  Info
} from "lucide-react";

interface TutorAboutTabProps {
  profile: Profile;
}

export const TutorAboutTab = ({ profile }: TutorAboutTabProps) => {
  // These would come from the database in a real implementation
  const mockData = {
    // Basic info
    subjects: [
      { id: 1, name: "Математика", specializations: ["Алгебра", "Геометрия"] },
      { id: 2, name: "Физика", specializations: [] },
    ],
    education: [
      { 
        id: 1, 
        institution: "МГУ им. Ломоносова", 
        degree: "Магистр математики", 
        year: "2015",
        verified: true
      },
      { 
        id: 2, 
        institution: "МФТИ", 
        degree: "Кандидат физико-математических наук", 
        year: "2018",
        verified: true
      }
    ],
    experience: [
      {
        id: 1,
        place: "Школа №1234",
        position: "Учитель математики",
        period: "2015-2018",
        description: "Преподавание алгебры и геометрии в 9-11 классах."
      },
      {
        id: 2,
        place: "Образовательный центр \"Эрудит\"",
        position: "Репетитор",
        period: "2018-настоящее время",
        description: "Подготовка к ЕГЭ и ОГЭ по математике."
      }
    ],
    achievements: [
      {
        id: 1,
        title: "Лучший репетитор года",
        year: "2020",
        issuer: "Образовательный центр \"Эрудит\"",
      },
      {
        id: 2,
        title: "100 баллов на ЕГЭ у 3 учеников",
        year: "2021",
        issuer: "",
      }
    ],
    teachingApproach: "Мой подход основан на индивидуальной работе с учениками, учитывая их особенности и цели. Использую как классические, так и современные методики преподавания, сочетая теорию с практическими заданиями.",
    teachingFormats: [
      { id: 1, type: "Онлайн", details: "Zoom, Skype", price: 1000 },
      { id: 2, type: "У репетитора", details: "Центральный район", price: 1200 },
      { id: 3, type: "У ученика", details: "Центральный и Приморский районы", price: 1500 },
    ],
    // More could be added as needed
  };

  return (
    <div className="space-y-6">
      {/* Profile completion reminder if profile is incomplete */}
      {(!profile?.bio || !profile?.city) && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="flex items-start space-x-4 p-4">
            <Info className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Завершите свой профиль</h3>
              <p className="text-amber-700 text-sm mt-1">
                Заполните все разделы профиля, чтобы повысить шансы привлечь больше учеников.
              </p>
              <Button 
                variant="outline" 
                className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                size="sm"
                onClick={() => window.location.href = "/profile/tutor/complete"}
              >
                Заполнить профиль
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bio section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Info className="h-5 w-5 mr-2" />
            О себе
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile?.bio ? (
            <p className="text-gray-700">{profile.bio}</p>
          ) : (
            <p className="text-gray-500 italic">Добавьте информацию о себе.</p>
          )}
        </CardContent>
      </Card>

      {/* Subjects section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BookOpen className="h-5 w-5 mr-2" />
            Предметы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockData.subjects.map(subject => (
              <div key={subject.id} className="border rounded-lg p-3">
                <h3 className="font-medium">{subject.name}</h3>
                {subject.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {subject.specializations.map((spec, idx) => (
                      <Badge key={idx} variant="outline" className="bg-gray-50">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <GraduationCap className="h-5 w-5 mr-2" />
            Образование
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.education.map(edu => (
              <div key={edu.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{edu.institution}</h3>
                    <p className="text-gray-600">{edu.degree}, {edu.year}</p>
                  </div>
                  {edu.verified && (
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Проверено
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Briefcase className="h-5 w-5 mr-2" />
            Опыт работы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockData.experience.map(exp => (
              <div key={exp.id} className="border rounded-lg p-3">
                <h3 className="font-medium">{exp.place}</h3>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>{exp.position}</span>
                  <span>{exp.period}</span>
                </div>
                <p className="text-gray-700 mt-2">{exp.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teaching approach */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Award className="h-5 w-5 mr-2" />
            Методика преподавания
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{mockData.teachingApproach}</p>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Award className="h-5 w-5 mr-2" />
            Достижения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockData.achievements.map(achievement => (
              <div key={achievement.id} className="border rounded-lg p-3">
                <h3 className="font-medium">{achievement.title}</h3>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>{achievement.issuer}</span>
                  <span>{achievement.year}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teaching formats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <VideoIcon className="h-5 w-5 mr-2" />
            Форматы занятий
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockData.teachingFormats.map(format => (
              <div key={format.id} className="border rounded-lg p-3">
                <div className="flex justify-between">
                  <h3 className="font-medium">{format.type}</h3>
                  <span className="font-medium text-green-600">{format.price} ₽/час</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{format.details}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
