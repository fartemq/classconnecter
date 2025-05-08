
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Student } from '@/types/student';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { ensureObject } from '@/utils/supabaseUtils';

interface SubjectOption {
  id: string;
  name: string;
}

interface StudentContactDialogProps {
  student: Student;
  open: boolean;
  onClose: () => void;
  onSubmit: (subjectId: string | null, message: string | null) => void;
}

export const StudentContactDialog: React.FC<StudentContactDialogProps> = ({ 
  student, 
  open, 
  onClose, 
  onSubmit 
}) => {
  const [message, setMessage] = useState<string>('');
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        
        if (data) {
          setSubjects(data);
          if (data.length > 0) {
            setSelectedSubjectId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    
    if (open) {
      fetchSubjects();
      setMessage(`Здравствуйте! Я хотел бы стать вашим репетитором${student.student_profiles?.subjects && student.student_profiles.subjects.length > 0 ? ` по предмету ${student.student_profiles.subjects[0]}` : ''}.`);
    }
  }, [open, student]);

  const handleSubmit = async () => {
    setIsLoading(true);
    await onSubmit(selectedSubjectId, message);
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Связаться с учеником</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Выберите предмет</Label>
            <Select
              value={selectedSubjectId || undefined}
              onValueChange={setSelectedSubjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="message">Сообщение</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Введите сообщение для ученика..."
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Отправка..." : "Отправить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
