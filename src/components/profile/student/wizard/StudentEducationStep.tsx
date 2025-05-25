
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface StudentEducationStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

export const StudentEducationStep: React.FC<StudentEducationStepProps> = ({
  data,
  onDataChange
}) => {
  const handleInputChange = (field: string, value: any) => {
    onDataChange({ [field]: value });
  };

  const educationalLevels = [
    { value: 'elementary', label: 'Начальная школа (1-4 класс)' },
    { value: 'middle', label: 'Средняя школа (5-9 класс)' },
    { value: 'high', label: 'Старшая школа (10-11 класс)' },
    { value: 'university', label: 'Университет/Институт' },
    { value: 'adult', label: 'Взрослый' }
  ];

  const grades = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
    '1 курс', '2 курс', '3 курс', '4 курс', '5 курс', '6 курс'
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="educational_level">Уровень образования *</Label>
        <Select
          value={data.educational_level || ''}
          onValueChange={(value) => handleInputChange('educational_level', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите ваш уровень образования" />
          </SelectTrigger>
          <SelectContent>
            {educationalLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">Учебное заведение *</Label>
        <Input
          id="school"
          value={data.school || ''}
          onChange={(e) => handleInputChange('school', e.target.value)}
          placeholder="Название школы, университета или другого учебного заведения"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade">Класс/Курс</Label>
        <Select
          value={data.grade || ''}
          onValueChange={(value) => handleInputChange('grade', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите класс или курс" />
          </SelectTrigger>
          <SelectContent>
            {grades.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
