
import React, { useState, useEffect } from "react";
import { Student } from "@/types/student";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { ensureObject } from "@/utils/supabaseUtils";

interface Subject {
  id: string;
  name: string;
}

interface StudentContactDialogProps {
  student: Student;
  open: boolean;
  onClose: () => void;
  onSubmit: (subjectId: string | null, message: string | null) => void;
}

export const StudentContactDialog = ({
  student,
  open,
  onClose,
  onSubmit
}: StudentContactDialogProps) => {
  const [message, setMessage] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subjects')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        
        if (data) {
          setSubjects(data);
          // If the student has subjects, select the first one
          const studentSubjects = student.student_profiles?.subjects || [];
          if (studentSubjects.length > 0) {
            // Find the subject id that matches the subject name
            const matchingSubject = data.find(subject => 
              studentSubjects.includes(subject.name)
            );
            if (matchingSubject) {
              setSelectedSubjectId(matchingSubject.id);
            } else if (data.length > 0) {
              setSelectedSubjectId(data[0].id);
            }
          } else if (data.length > 0) {
            setSelectedSubjectId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchSubjects();
      
      // Set default message
      const studentName = `${student.first_name || ''} ${student.last_name || ''}`.trim();
      setMessage(`Здравствуйте, ${studentName}! Я заметил, что Вы ищете репетитора, и хотел бы предложить свои услуги.`);
    }
  }, [open, student]);

  const handleSubmit = () => {
    onSubmit(selectedSubjectId, message);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Связаться с учеником</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader size="md" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Предмет
                </label>
                <select
                  id="subject"
                  className="w-full p-2 border rounded-md"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Сообщение
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Напишите ученику о своем опыте, стиле преподавания и возможных временах для занятий"
                  rows={6}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button onClick={handleSubmit}>
                Отправить запрос
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
