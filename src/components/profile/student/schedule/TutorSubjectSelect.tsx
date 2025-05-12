
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TutorSubjectSelectProps {
  subjects: Array<{id: string, name: string}>;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  // Добавляем альтернативные названия для совместимости
  subjectOptions?: Array<{id: string, name: string}>;
  selectedSubjectId?: string;
  onChange?: (subject: string) => void;
}

export const TutorSubjectSelect = ({ 
  subjects, 
  selectedSubject, 
  onSubjectChange,
  // Поддержка альтернативных имен свойств
  subjectOptions,
  selectedSubjectId,
  onChange
}: TutorSubjectSelectProps) => {
  // Используем предоставленные свойства или их альтернативы
  const actualSubjects = subjectOptions || subjects;
  const actualSelected = selectedSubjectId || selectedSubject;
  const handleChange = onChange || onSubjectChange;

  return (
    <div className="mb-4">
      <h4 className="text-sm text-gray-500 mb-1">Выберите предмет:</h4>
      <Select value={actualSelected} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите предмет" />
        </SelectTrigger>
        <SelectContent>
          {actualSubjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id || "no-id"}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
