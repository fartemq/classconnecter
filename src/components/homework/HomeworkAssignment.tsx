
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HomeworkData } from "@/types/homework";
import { createHomework } from "@/services/homeworkService";

const HomeworkAssignment = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
  );
  const [file, setFile] = useState<File | null>(null);
  const [subjects, setSubjects] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch subjects taught by the tutor
  React.useEffect(() => {
    const fetchSubjects = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      
      const { data, error } = await supabase
        .from('tutor_subjects')
        .select(`
          subject_id,
          subjects:subject_id(id, name)
        `)
        .eq('tutor_id', userData.user.id);
        
      if (error) {
        console.error('Error fetching subjects:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const formattedSubjects = data.map(item => ({
          id: item.subjects.id,
          name: item.subjects.name
        }));
        
        setSubjects(formattedSubjects);
        if (formattedSubjects.length > 0) {
          setSubject(formattedSubjects[0].id);
        }
      }
    };
    
    fetchSubjects();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !subject || !dueDate || !studentId) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        toast({
          title: "Ошибка",
          description: "Необходимо войти в систему.",
          variant: "destructive"
        });
        return;
      }
      
      let filePath = null;
      
      // If there's a file, upload it first
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const uploadPath = `homework_files/${userData.user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase
          .storage
          .from('homework_files')
          .upload(uploadPath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        filePath = uploadPath;
      }
      
      // Create the homework record using our helper function
      const homeworkData: HomeworkData = {
        tutor_id: userData.user.id,
        student_id: studentId,
        subject_id: subject,
        title,
        description,
        file_path: filePath,
        due_date: dueDate.toISOString(),
        status: 'assigned'
      };
      
      // Call RPC function instead of direct table access
      const { data, error } = await createHomework(homeworkData);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Успех",
        description: "Домашнее задание успешно назначено.",
      });
      
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать домашнее задание. Пожалуйста, попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Назначить домашнее задание</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название</Label>
            <Input 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задания"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="subject">Предмет</Label>
            <Select 
              value={subject} 
              onValueChange={setSubject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите предмет" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.id} value={subj.id}>
                    {subj.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Описание задания</Label>
            <Textarea 
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите задание подробно"
              rows={5}
              required
            />
          </div>
          
          <div>
            <Label>Срок выполнения</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, "PPP", { locale: ru })
                  ) : (
                    <span>Выберите дату</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label htmlFor="file">Прикрепить файл (необязательно)</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="file"
                type="file"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('file')?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {file && (
              <p className="text-sm text-gray-500 mt-1">
                Выбран файл: {file.name}
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Назначить задание"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HomeworkAssignment;
