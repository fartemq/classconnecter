
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, GraduationCap, Target, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface StudentPreviewStepProps {
  data: any;
}

export const StudentPreviewStep: React.FC<StudentPreviewStepProps> = ({ data }) => {
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });

  const getEducationalLevelLabel = (level: string) => {
    const levels = {
      'elementary': 'Начальная школа',
      'middle': 'Средняя школа',
      'high': 'Старшая школа',
      'university': 'Университет',
      'adult': 'Взрослый'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getFormatLabel = (format: string) => {
    const formats = {
      'online': 'Онлайн',
      'offline': 'Очно',
      'group': 'Группа',
      'individual': 'Индивидуально'
    };
    return formats[format as keyof typeof formats] || format;
  };

  const selectedSubjects = subjects.filter(subject => 
    data.subjects?.includes(subject.id)
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Предварительный просмотр профиля</h3>
        <p className="text-muted-foreground">
          Так ваш профиль будет выглядеть для репетиторов
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={data.avatarUrl} />
              <AvatarFallback className="text-lg">
                {data.firstName?.[0]}{data.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">
                {data.firstName} {data.lastName}
              </CardTitle>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {data.city}
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Ученик
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* About */}
          <div>
            <h4 className="font-medium mb-2">О себе</h4>
            <p className="text-muted-foreground">{data.bio}</p>
          </div>

          {/* Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Уровень образования</p>
                <p className="text-sm text-muted-foreground">
                  {getEducationalLevelLabel(data.educational_level)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Учебное заведение</p>
                <p className="text-sm text-muted-foreground">{data.school}</p>
              </div>
            </div>
          </div>

          {data.grade && (
            <div>
              <h4 className="font-medium mb-2">Класс/Курс</h4>
              <Badge variant="outline">{data.grade}</Badge>
            </div>
          )}

          {/* Subjects */}
          <div>
            <h4 className="font-medium mb-2">Предметы для изучения</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subject) => (
                <Badge key={subject.id} variant="secondary">
                  {subject.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Format */}
          <div>
            <h4 className="font-medium mb-2">Предпочтительный формат</h4>
            <div className="flex flex-wrap gap-2">
              {data.preferred_format?.map((format: string) => (
                <Badge key={format} variant="outline">
                  {getFormatLabel(format)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <h4 className="font-medium mb-2">Цели обучения</h4>
            <p className="text-muted-foreground">{data.learning_goals}</p>
          </div>

          {/* Budget */}
          <div className="flex items-center space-x-3">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Бюджет на занятие</p>
              <p className="text-lg font-semibold text-primary">{data.budget} ₽</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2">🎉 Профиль готов!</h4>
        <p className="text-sm text-green-800">
          Ваш профиль заполнен и готов к использованию. Теперь вы можете искать репетиторов, 
          записываться на занятия и начинать обучение!
        </p>
      </div>
    </div>
  );
};
