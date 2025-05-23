
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Users, Trophy } from "lucide-react";
import { TutorFormValues } from "@/types/tutor";

interface WizardTeachingStepProps {
  data: Partial<TutorFormValues>;
  onDataChange: (data: Partial<TutorFormValues>) => void;
}

export const WizardTeachingStep: React.FC<WizardTeachingStepProps> = ({
  data,
  onDataChange
}) => {
  const [localData, setLocalData] = useState({
    methodology: data.methodology || "",
    experience: data.experience || 0,
    achievements: data.achievements || "",
    videoUrl: data.videoUrl || "",
  });

  useEffect(() => {
    onDataChange(localData);
  }, [localData]);

  const handleInputChange = (field: string, value: string | number) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
  };

  const experienceOptions = [
    { value: 0, label: "Начинающий (менее 1 года)" },
    { value: 1, label: "1 год" },
    { value: 2, label: "2 года" },
    { value: 3, label: "3 года" },
    { value: 5, label: "5 лет" },
    { value: 10, label: "10+ лет" },
    { value: 15, label: "15+ лет" },
    { value: 20, label: "20+ лет" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Ваша методика преподавания</h3>
        <p className="text-muted-foreground">
          Расскажите о своем подходе к обучению и педагогическом опыте
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="methodology">Методика преподавания *</Label>
            <Textarea
              id="methodology"
              placeholder="Опишите ваш подход к преподаванию, используемые методики, особенности проведения занятий..."
              value={localData.methodology}
              onChange={(e) => handleInputChange('methodology', e.target.value)}
              className="min-h-[120px] text-base"
            />
            <p className="text-sm text-muted-foreground">
              Расскажите, как вы объясняете сложные темы, какие приемы используете для запоминания
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Опыт преподавания *</Label>
            <Select 
              value={localData.experience?.toString()} 
              onValueChange={(value) => handleInputChange('experience', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите ваш опыт" />
              </SelectTrigger>
              <SelectContent>
                {experienceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Достижения и сертификаты</Label>
            <Textarea
              id="achievements"
              placeholder="Расскажите о ваших профессиональных достижениях, сертификатах, курсах повышения квалификации..."
              value={localData.achievements}
              onChange={(e) => handleInputChange('achievements', e.target.value)}
              className="min-h-[100px] text-base"
            />
            <p className="text-sm text-muted-foreground">
              Не обязательно, но поможет выделиться среди других репетиторов
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Видео-презентация</Label>
            <Input
              id="videoUrl"
              placeholder="https://youtube.com/watch?v=..."
              value={localData.videoUrl}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Короткое видео о себе поможет ученикам лучше вас узнать (необязательно)
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900">Совет</h4>
                <p className="text-sm text-green-700 mt-1">
                  Опишите конкретные примеры успехов ваших учеников
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Trophy className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-purple-900">Помните</h4>
                <p className="text-sm text-purple-700 mt-1">
                  Уникальная методика - ваше конкурентное преимущество
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Заполнено обязательных полей:</span>
            <span className="font-medium">
              {[localData.methodology, localData.experience].filter(field => 
                field !== "" && field !== undefined && field !== 0
              ).length} из 2
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
