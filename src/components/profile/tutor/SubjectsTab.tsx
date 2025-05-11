
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { AlertCircle, Plus, Trash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { saveTutorSubjects, fetchSubjectsAndCategories } from "@/services/tutorSubjectsService";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SubjectsTabProps {
  tutorId: string;
}

export const SubjectsTab: React.FC<SubjectsTabProps> = ({ tutorId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState<number>(1000);
  
  // Load available subjects and already selected subjects
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch available subjects
        const { subjects: availableSubjects } = await fetchSubjectsAndCategories();
        setSubjects(availableSubjects);
        
        // Fetch user's selected subjects
        const { data: userSubjects, error } = await supabase
          .from("tutor_subjects")
          .select("subject_id, hourly_rate")
          .eq("tutor_id", tutorId)
          .eq("is_active", true);
          
        if (error) throw error;
        
        if (userSubjects && userSubjects.length > 0) {
          setSelectedSubjects(userSubjects.map(s => s.subject_id));
          // Set hourly rate from the first subject (assuming same rate for all)
          if (userSubjects[0]?.hourly_rate) {
            setHourlyRate(userSubjects[0].hourly_rate);
          }
        }
      } catch (err) {
        console.error("Error loading subjects data:", err);
        setError("Не удалось загрузить данные о предметах");
      } finally {
        setLoading(false);
      }
    }
    
    if (tutorId) {
      loadData();
    }
  }, [tutorId]);
  
  // Handle selection of a subject
  const handleSelectSubject = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };
  
  // Handle save
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (selectedSubjects.length === 0) {
        toast({
          title: "Выберите хотя бы один предмет",
          description: "Для сохранения необходимо выбрать минимум один предмет",
          variant: "destructive",
        });
        return;
      }
      
      await saveTutorSubjects(tutorId, selectedSubjects, hourlyRate);
      
      toast({
        title: "Данные сохранены",
        description: "Предметы и стоимость занятий успешно обновлены",
      });
    } catch (err) {
      console.error("Error saving subjects:", err);
      setError("Не удалось сохранить данные о предметах");
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить данные о предметах",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Get subject name by ID
  const getSubjectName = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    return subject ? subject.name : "Неизвестный предмет";
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader size="lg" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Предметы и стоимость</h2>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        {/* Hourly rate section */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Стоимость занятия</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly-rate">Стоимость часа (₽)</Label>
                  <Input
                    id="hourly-rate"
                    type="number"
                    min={0}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Укажите стоимость одного часа занятий
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Subject selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Выбор предметов</h3>
                <Badge>{selectedSubjects.length} выбрано</Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subject-select">Добавить предмет</Label>
                  <Select 
                    onValueChange={(value) => handleSelectSubject(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите предмет" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.filter(subject => !selectedSubjects.includes(subject.id)).map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Выбранные предметы:</h4>
                  {selectedSubjects.length === 0 ? (
                    <p className="text-sm text-gray-500">Пока не выбрано ни одного предмета</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSubjects.map((subjectId) => (
                        <Badge 
                          key={subjectId} 
                          className="flex items-center gap-1 px-2 py-1 cursor-pointer"
                          variant="secondary"
                          onClick={() => handleSelectSubject(subjectId)}
                        >
                          {getSubjectName(subjectId)}
                          <Trash className="h-3 w-3 text-gray-500" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving || selectedSubjects.length === 0}
          >
            {saving ? <Loader size="sm" className="mr-2" /> : null}
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </div>
    </div>
  );
};
