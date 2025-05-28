
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, BookOpen, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLessonRequests } from "@/hooks/useLessonRequests";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "@/components/ui/loader";

interface SimpleLessonRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export const SimpleLessonRequestModal: React.FC<SimpleLessonRequestModalProps> = ({
  isOpen,
  onClose,
  tutor
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subject_id: '',
    message: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject_id) {
      toast({
        title: "Выберите предмет",
        description: "Пожалуйста, укажите предмет для занятий",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('lesson_requests')
        .insert({
          student_id: user?.id,
          tutor_id: tutor.id,
          subject_id: formData.subject_id,
          requested_date: new Date().toISOString().split('T')[0], // Временная дата
          requested_start_time: '00:00', // Временное время
          requested_end_time: '01:00', // Временное время
          message: formData.message,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Запрос отправлен",
        description: "Репетитор получит ваш запрос и предложит время для занятий"
      });

      onClose();
      setFormData({
        subject_id: '',
        message: ''
      });
    } catch (error) {
      console.error('Error creating lesson request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить запрос",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            Запрос на занятие
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Репетитор: {tutor.first_name} {tutor.last_name}</span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Предмет *</Label>
            <Select value={formData.subject_id} onValueChange={(value) => setFormData(prev => ({ ...prev, subject_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Сообщение репетитору</Label>
            <div className="relative">
              <Textarea
                id="message"
                placeholder="Расскажите о ваших целях и пожеланиях к занятиям..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                className="pl-10 pt-8"
              />
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Репетитор получит ваш запрос и предложит удобное время для занятий. 
              Вы сможете выбрать из предложенных вариантов.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader size="sm" className="mr-2" />}
              Отправить запрос
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
