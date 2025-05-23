
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, Award } from "lucide-react";
import { TutorFormValues } from "@/types/tutor";

interface WizardEducationStepProps {
  data: Partial<TutorFormValues>;
  onDataChange: (data: Partial<TutorFormValues>) => void;
}

export const WizardEducationStep: React.FC<WizardEducationStepProps> = ({
  data,
  onDataChange
}) => {
  const [localData, setLocalData] = useState({
    educationInstitution: data.educationInstitution || "",
    degree: data.degree || "",
    graduationYear: data.graduationYear || new Date().getFullYear(),
  });

  useEffect(() => {
    onDataChange(localData);
  }, [localData]);

  const handleInputChange = (field: string, value: string | number) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const degrees = [
    "Бакалавр",
    "Специалист", 
    "Магистр",
    "Кандидат наук",
    "Доктор наук",
    "Среднее профессиональное образование",
    "Другое"
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">Ваше образование</h3>
        <p className="text-muted-foreground">
          Информация об образовании повышает доверие учеников к вашей квалификации
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="institution">Учебное заведение *</Label>
            <Input
              id="institution"
              placeholder="Например: МГУ им. М.В. Ломоносова"
              value={localData.educationInstitution}
              onChange={(e) => handleInputChange('educationInstitution', e.target.value)}
              className="text-lg"
            />
            <p className="text-sm text-muted-foreground">
              Укажите полное название университета, института или колледжа
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="degree">Степень/Квалификация *</Label>
              <Select 
                value={localData.degree} 
                onValueChange={(value) => handleInputChange('degree', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите степень" />
                </SelectTrigger>
                <SelectContent>
                  {degrees.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Год окончания *</Label>
              <Select 
                value={localData.graduationYear?.toString()} 
                onValueChange={(value) => handleInputChange('graduationYear', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите год" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Почему это важно?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Ученики чаще выбирают репетиторов с подтвержденным образованием. 
                Мы поможем вам верифицировать диплом для повышения доверия.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Заполнено полей:</span>
            <span className="font-medium">
              {Object.values(localData).filter(Boolean).length} из 3
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
