
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DollarSign, BookOpen, Check, X } from "lucide-react";
import { TutorFormValues } from "@/types/tutor";

interface WizardSubjectsStepProps {
  data: Partial<TutorFormValues>;
  onDataChange: (data: Partial<TutorFormValues>) => void;
  subjects: any[];
}

export const WizardSubjectsStep: React.FC<WizardSubjectsStepProps> = ({
  data,
  onDataChange,
  subjects
}) => {
  const [localData, setLocalData] = useState({
    subjects: data.subjects || [],
    hourlyRate: data.hourlyRate || 1000,
    teachingLevels: data.teachingLevels || ["школьник", "студент", "взрослый"],
  });

  useEffect(() => {
    onDataChange(localData);
  }, [localData]);

  const handleSubjectToggle = (subjectId: string) => {
    const newSubjects = localData.subjects.includes(subjectId)
      ? localData.subjects.filter(id => id !== subjectId)
      : [...localData.subjects, subjectId];
    
    setLocalData(prev => ({ ...prev, subjects: newSubjects }));
  };

  const handleLevelToggle = (level: string) => {
    const newLevels = localData.teachingLevels.includes(level)
      ? localData.teachingLevels.filter(l => l !== level)
      : [...localData.teachingLevels, level];
    
    setLocalData(prev => ({ ...prev, teachingLevels: newLevels }));
  };

  const teachingLevelOptions = [
    { value: "школьник", label: "Школьники (1-11 класс)", description: "Подготовка к ОГЭ, ЕГЭ, помощь с домашними заданиями" },
    { value: "студент", label: "Студенты", description: "Помощь с университетскими предметами" },
    { value: "взрослый", label: "Взрослые", description: "Изучение с нуля, повышение квалификации" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Предметы и стоимость</h3>
        <p className="text-muted-foreground">
          Выберите предметы, которые вы преподаете, и укажите стоимость занятий
        </p>
      </div>

      {/* Subjects Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <Label className="text-lg font-medium">Выберите предметы *</Label>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className={`
                  p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${localData.subjects.includes(subject.id)
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
                onClick={() => handleSubjectToggle(subject.id)}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={localData.subjects.includes(subject.id)}
                    onChange={() => handleSubjectToggle(subject.id)}
                    className="pointer-events-none"
                  />
                  <span className="text-sm font-medium">{subject.name}</span>
                </div>
              </div>
            ))}
          </div>

          {localData.subjects.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Выбранные предметы:</p>
              <div className="flex flex-wrap gap-2">
                {localData.subjects.map((subjectId) => {
                  const subject = subjects.find(s => s.id === subjectId);
                  return subject ? (
                    <Badge key={subjectId} variant="secondary" className="flex items-center space-x-1">
                      <span>{subject.name}</span>
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-destructive" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubjectToggle(subjectId);
                        }}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Teaching Levels */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Check className="w-5 h-5 text-primary" />
            <Label className="text-lg font-medium">С кем вы работаете *</Label>
          </div>
          
          <div className="space-y-3">
            {teachingLevelOptions.map((option) => (
              <div
                key={option.value}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                  ${localData.teachingLevels.includes(option.value)
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
                onClick={() => handleLevelToggle(option.value)}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={localData.teachingLevels.includes(option.value)}
                    onChange={() => handleLevelToggle(option.value)}
                    className="mt-1 pointer-events-none"
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Hourly Rate */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-primary" />
            <Label className="text-lg font-medium">Стоимость занятия *</Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Цена за час (₽)</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="100"
              placeholder="1000"
              value={localData.hourlyRate}
              onChange={(e) => setLocalData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) || 0 }))}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Средняя стоимость занятий на платформе: 800-2000 ₽ за час
            </p>
          </div>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <div className="text-sm text-amber-800">
                <strong>Совет:</strong> Вы всегда сможете изменить цену для разных предметов и уровней в настройках профиля
              </div>
            </CardContent>
          </Card>
        </div>
      </Card>

      {/* Progress Indicator */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Предметы выбраны:</span>
              <span className="font-medium">
                {localData.subjects.length > 0 ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Уровни выбраны:</span>
              <span className="font-medium">
                {localData.teachingLevels.length > 0 ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Цена указана:</span>
              <span className="font-medium">
                {localData.hourlyRate > 0 ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-500" />}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
