import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { BookOpen, GraduationCap, School, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { StudentCardData } from './types';
import { ensureObject, ensureSingleObject } from '@/utils/supabaseUtils';

interface StudentContactDialogProps {
  student: StudentCardData;
  open: boolean;
  onClose: () => void;
  onSubmit: (message: string, subjectId?: string) => void;
}

export const StudentContactDialog = ({ student, open, onClose, onSubmit }: StudentContactDialogProps) => {
  const [message, setMessage] = useState('');
  const [subjects, setSubjects] = useState<{id: string, name: string}[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Get initials for avatar fallback
  const getInitials = () => {
    const nameParts = student.name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };
  
  // Helper function to get the icon based on student level
  const getLevelIcon = () => {
    switch (student.level) {
      case 'Школьник':
        return <School className="h-4 w-4" />;
      case 'Студент':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    if (open && user?.id) {
      fetchSubjects();
    }
  }, [open, user?.id]);

  const fetchSubjects = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Get subjects the tutor teaches
      const { data, error } = await supabase
        .from('tutor_subjects')
        .select(`
          subject_id,
          subjects:subject_id (
            id, name
          )
        `)
        .eq('tutor_id', user.id);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedSubjects = data.map(item => {
          const subject = ensureSingleObject(item.subject);
          return {
            id: subject.id,
            name: subject.name
          };
        });
        
        setSubjects(formattedSubjects);
        
        // If student is interested in any of the subjects, select it by default
        if (student.subjects && student.subjects.length > 0) {
          const matchedSubject = formattedSubjects.find(s => 
            student.subjects.includes(s.name)
          );
          
          if (matchedSubject) {
            setSelectedSubjectId(matchedSubject.id);
          } else if (formattedSubjects.length > 0) {
            setSelectedSubjectId(formattedSubjects[0].id);
          }
        } else if (formattedSubjects.length > 0) {
          setSelectedSubjectId(formattedSubjects[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!message.trim()) return;
    
    onSubmit(message, selectedSubjectId);
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Связаться со студентом</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-start space-x-4 py-4">
          <Avatar className="h-12 w-12">
            {student.avatar ? (
              <AvatarImage src={student.avatar} alt={student.name} />
            ) : (
              <AvatarFallback>{getInitials()}</AvatarFallback>
            )}
          </Avatar>
          
          <div className="space-y-2">
            <h3 className="font-medium">{student.name}</h3>
            
            <div className="flex items-center text-sm text-gray-600">
              {getLevelIcon()}
              <span className="ml-2">{student.level}</span>
              {student.grade && <span className="ml-1">, {student.grade} класс</span>}
            </div>
            
            {student.subjects && student.subjects.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span className="ml-2 truncate">
                  {student.subjects.join(', ')}
                </span>
              </div>
            )}
            
            {student.city && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span className="ml-2">{student.city}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Выберите предмет</Label>
            <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
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
          
          <div className="space-y-2">
            <Label htmlFor="message">Сообщение студенту</Label>
            <Textarea
              id="message"
              placeholder="Напишите сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleSubmit} disabled={!message.trim()}>
            Отправить запрос
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
