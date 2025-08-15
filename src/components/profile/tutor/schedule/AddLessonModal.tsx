import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLessonAdded: () => void;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({
  isOpen,
  onClose,
  onLessonAdded
}) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
    date: "",
    start_time: "",
    end_time: "",
    notes: ""
  });

  // Fetch students
  const { data: students = [] } = useQuery({
    queryKey: ['tutorStudents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('lesson_requests')
        .select(`
          student_id,
          student_profile:profiles!lesson_requests_student_id_fkey (
            id,
            first_name,
            last_name
          )
        `)
        .eq('tutor_id', user.id)
        .eq('status', 'approved');

      if (error) throw error;

      // Get unique students
      const uniqueStudents = data?.reduce((acc: any[], request: any) => {
        const student = request.student_profile;
        if (student && !acc.find(s => s.id === student.id)) {
          acc.push(student);
        }
        return acc;
      }, []) || [];

      return uniqueStudents;
    },
    enabled: !!user?.id && isOpen
  });

  // Fetch subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.student_id || !formData.subject_id || !formData.date || !formData.start_time || !formData.end_time) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.date}T${formData.end_time}`);

      const { error } = await supabase
        .from('lessons')
        .insert({
          tutor_id: user.id,
          student_id: formData.student_id,
          subject_id: formData.subject_id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          status: 'confirmed',
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Урок добавлен",
        description: "Урок успешно добавлен в расписание"
      });

      onLessonAdded();
      onClose();
      setFormData({
        student_id: "",
        subject_id: "",
        date: "",
        start_time: "",
        end_time: "",
        notes: ""
      });
    } catch (error) {
      console.error('Error adding lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить урок",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setFormData({
      student_id: "",
      subject_id: "",
      date: "",
      start_time: "",
      end_time: "",
      notes: ""
    });
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить урок</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Ученик *</Label>
            <Select 
              value={formData.student_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите ученика" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student: any) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.first_name} {student.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Предмет *</Label>
            <Select 
              value={formData.subject_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Дата *</Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Время начала *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Время окончания *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              placeholder="Дополнительная информация о занятии..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2" />
                  Добавление...
                </>
              ) : (
                "Добавить урок"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};