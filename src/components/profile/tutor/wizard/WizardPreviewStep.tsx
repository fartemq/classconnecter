
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, GraduationCap, BookOpen, DollarSign, Calendar, Award, Video } from "lucide-react";
import { TutorFormValues } from "@/types/tutor";

interface WizardPreviewStepProps {
  data: TutorFormValues;
  subjects: any[];
}

export const WizardPreviewStep: React.FC<WizardPreviewStepProps> = ({
  data,
  subjects
}) => {
  const selectedSubjects = subjects.filter(s => data.subjects.includes(s.id));
  const initials = `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`;

  const teachingLevelLabels = {
    "школьник": "Школьники",
    "студент": "Студенты", 
    "взрослый": "Взрослые"
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Предварительный просмотр профиля</h3>
        <p className="text-muted-foreground">
          Так ваш профиль будет выглядеть для учеников. Вы сможете отредактировать его позже.
        </p>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
              <AvatarImage src={data.avatarUrl || undefined} />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{data.firstName} {data.lastName}</CardTitle>
              <p className="text-muted-foreground text-lg">{data.city}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">{data.hourlyRate} ₽/час</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{data.experience} лет опыта</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Bio */}
            <div>
              <h4 className="font-medium mb-2">О репетиторе</h4>
              <p className="text-muted-foreground">{data.bio}</p>
            </div>

            {/* Subjects */}
            <div>
              <h4 className="font-medium mb-3">Предметы преподавания</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((subject) => (
                  <Badge key={subject.id} variant="secondary" className="text-sm">
                    {subject.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Teaching Levels */}
            <div>
              <h4 className="font-medium mb-3">Работает с</h4>
              <div className="flex flex-wrap gap-2">
                {data.teachingLevels.map((level) => (
                  <Badge key={level} variant="outline" className="text-sm">
                    {teachingLevelLabels[level] || level}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span>Образование</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">{data.educationInstitution}</p>
            <p className="text-muted-foreground">{data.degree}, {data.graduationYear}</p>
          </div>
        </CardContent>
      </Card>

      {/* Teaching Methodology */}
      {data.methodology && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Методика преподавания</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{data.methodology}</p>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {data.achievements && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-primary" />
              <span>Достижения</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{data.achievements}</p>
          </CardContent>
        </Card>
      )}

      {/* Video */}
      {data.videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-primary" />
              <span>Видео-презентация</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a 
              href={data.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Посмотреть видео
            </a>
          </CardContent>
        </Card>
      )}

      {/* Completion Status */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium text-green-900 mb-2">Профиль готов к публикации!</h4>
            <p className="text-sm text-green-700">
              Все обязательные поля заполнены. После сохранения вы сможете опубликовать профиль и начать принимать заявки от учеников.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
