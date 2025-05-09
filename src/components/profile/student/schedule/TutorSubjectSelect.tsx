
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
}

export const TutorSubjectSelect = ({ 
  subjects, 
  selectedSubject, 
  onSubjectChange 
}: TutorSubjectSelectProps) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm text-gray-500 mb-1">Выберите предмет:</h4>
      <Select value={selectedSubject} onValueChange={onSubjectChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите предмет" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
