
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, BookOpen, X } from "lucide-react";
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
    teachingLevels: data.teachingLevels || [],
    hourlyRate: data.hourlyRate || 1000,
  });

  useEffect(() => {
    onDataChange(localData);
  }, [localData]);

  const handleSubjectToggle = (subjectId: string, checked: boolean) => {
    const newSubjects = checked 
      ? [...localData.subjects, subjectId]
      : localData.subjects.filter(id => id !== subjectId);
    
    setLocalData(prev => ({ ...prev, subjects: newSubjects }));
  };

  const handleLevelToggle = (level: string, checked: boolean) => {
    const newLevels = checked
      ? [...localData.teachingLevels, level]
      : localData.teachingLevels.filter(l => l !== level);
    
    setLocalData(prev => ({ ...prev, teachingLevels: newLevels }));
  };

  const handleRateChange = (value: string) => {
    setLocalData(prev => ({ ...prev, hourlyRate: parseInt(value) || 1000 }));
  };

  const selectedSubjects = subjects.filter(s => localData.subjects.includes(s.id));
  
  const teachingLevelOptions = [
    { value: "школьник", label: "Школьники", description: "1-11 классы" },
    { value: "студент", label: "Студенты", description: "ВУЗы и колледжи" },
    { value: "взрослый", label: "Взрослые", description: "Курсы и самообразование" }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Предметы и условия</h3>
        <p className="text-muted-foreground">
          Выберите предметы, которые вы преподаете, и укажите условия работы
        </p>
      </div>

      {/* Subjects Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Предметы преподавания *</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Выберите предметы, которые вы готовы преподавать
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/30">
                <Checkbox
                  id={subject.id}
                  checked={localData.subjects.includes(subject.id)}
                  onCheckedChange={(checked) => handleSubjectToggle(subject.id, !!checked)}
                />
                <Label htmlFor={subject.id} className="flex-1 cursor-pointer">
                  {subject.name}
                </Label>
              </div>
            ))}
          </div>

          {selectedSubjects.length > 0 && (
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">Выбранные предметы:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSubjects.map((subject) => (
                  <Badge key={subject.id} variant="secondary" className="flex items-center space-x-1">
                    <span>{subject.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleSubjectToggle(subject.id, false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Teaching Levels */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">Уровни обучения *</Label>
            <p className="text-sm text-muted-foreground mb-4">
              С какими возрастными группами вы работаете?
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {teachingLevelOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/30">
                <Checkbox
                  id={option.value}
                  checked={localData.teachingLevels.includes(option.value)}
                  onCheckedChange={(checked) => handleLevelToggle(option.value, !!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="font-medium cursor-pointer">
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Hourly Rate */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <Label className="text-base font-medium">Стоимость занятия *</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Укажите стоимость одного академического часа (45 минут)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Цена за час, ₽</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="100"
                max="10000"
                step="50"
                value={localData.hourlyRate}
                onChange={(e) => handleRateChange(e.target.value)}
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Рекомендации по ценам</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• Начинающий: 800-1500 ₽</div>
                <div>• Опытный: 1500-3000 ₽</div>
                <div>• Эксперт: 3000+ ₽</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h4 className="font-medium text-blue-900">Краткое резюме</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <div>
                <strong>Предметы:</strong> {selectedSubjects.length > 0 ? selectedSubjects.map(s => s.name).join(", ") : "Не выбраны"}
              </div>
              <div>
                <strong>Уровни:</strong> {localData.teachingLevels.length > 0 ? localData.teachingLevels.join(", ") : "Не выбраны"}
              </div>
              <div>
                <strong>Стоимость:</strong> {localData.hourlyRate} ₽/час
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Заполнено разделов:</span>
            <span className="font-medium">
              {[
                localData.subjects.length > 0,
                localData.teachingLevels.length > 0,
                localData.hourlyRate > 0
              ].filter(Boolean).length} из 3
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
