
import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

interface StudentSubjectsStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

export const StudentSubjectsStep: React.FC<StudentSubjectsStepProps> = ({
  data,
  onDataChange
}) => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(data.subjects || []);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(data.preferred_format || []);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const formats = [
    { value: 'online', label: 'Онлайн занятия' },
    { value: 'offline', label: 'Очные занятия' },
    { value: 'group', label: 'Групповые занятия' },
    { value: 'individual', label: 'Индивидуальные занятия' }
  ];

  const handleSubjectToggle = (subjectId: string) => {
    const newSubjects = selectedSubjects.includes(subjectId)
      ? selectedSubjects.filter(id => id !== subjectId)
      : [...selectedSubjects, subjectId];
    
    setSelectedSubjects(newSubjects);
    onDataChange({ subjects: newSubjects });
  };

  const handleFormatToggle = (formatValue: string) => {
    const newFormats = selectedFormats.includes(formatValue)
      ? selectedFormats.filter(format => format !== formatValue)
      : [...selectedFormats, formatValue];
    
    setSelectedFormats(newFormats);
    onDataChange({ preferred_format: newFormats });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-medium">Предметы для изучения *</Label>
        <p className="text-sm text-muted-foreground">
          Выберите предметы, по которым вам нужна помощь репетитора
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex items-center space-x-2">
              <Checkbox
                id={subject.id}
                checked={selectedSubjects.includes(subject.id)}
                onCheckedChange={() => handleSubjectToggle(subject.id)}
              />
              <Label htmlFor={subject.id} className="text-sm font-normal cursor-pointer">
                {subject.name}
              </Label>
            </div>
          ))}
        </div>

        {selectedSubjects.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Выбранные предметы:</Label>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map((subjectId) => {
                const subject = subjects.find(s => s.id === subjectId);
                return subject ? (
                  <Badge key={subjectId} variant="secondary" className="text-sm">
                    {subject.name}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleSubjectToggle(subjectId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-base font-medium">Предпочтительный формат обучения *</Label>
        <p className="text-sm text-muted-foreground">
          Выберите удобные для вас форматы проведения занятий
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {formats.map((format) => (
            <div key={format.value} className="flex items-center space-x-2">
              <Checkbox
                id={format.value}
                checked={selectedFormats.includes(format.value)}
                onCheckedChange={() => handleFormatToggle(format.value)}
              />
              <Label htmlFor={format.value} className="text-sm font-normal cursor-pointer">
                {format.label}
              </Label>
            </div>
          ))}
        </div>

        {selectedFormats.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Выбранные форматы:</Label>
            <div className="flex flex-wrap gap-2">
              {selectedFormats.map((formatValue) => {
                const format = formats.find(f => f.value === formatValue);
                return format ? (
                  <Badge key={formatValue} variant="secondary" className="text-sm">
                    {format.label}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleFormatToggle(formatValue)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
