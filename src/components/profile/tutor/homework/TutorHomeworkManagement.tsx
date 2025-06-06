import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, BookOpen, Calendar, User, FileText, Clock, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Homework {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  student_id: string;
  tutor_id: string;
  deadline: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export const TutorHomeworkManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [newHomework, setNewHomework] = useState({
    title: "",
    description: "",
    deadline: ""
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchHomework();
      fetchSubjects();
      fetchStudents();
    }
  }, [user?.id]);

  const fetchHomework = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .eq('tutor_id', user.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setHomeworkList(data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список заданий",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('is_active', true);

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список предметов",
        variant: "destructive"
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('student_tutor_relationships')
        .select(`
          student_id,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('tutor_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;

      const formattedStudents = data?.map(item => ({
        id: item.student_id,
        name: `${item.profiles?.first_name} ${item.profiles?.last_name || ''}`
      })) || [];

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список учеников",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewHomework(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddHomework = async () => {
    if (!selectedSubject || !selectedStudent || !newHomework.title || !newHomework.description || !newHomework.deadline) {
      toast({
        title: "Заполните все поля",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('homework')
        .insert({
          title: newHomework.title,
          description: newHomework.description,
          subject_id: selectedSubject,
          student_id: selectedStudent,
          tutor_id: user.id,
          deadline: newHomework.deadline,
          is_completed: false
        });

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Задание успешно добавлено",
      });

      setNewHomework({ title: "", description: "", deadline: "" });
      setSelectedSubject("");
      setSelectedStudent("");
      fetchHomework();
      setOpen(false);
    } catch (error) {
      console.error('Error adding homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить задание",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteToggle = async (homeworkId: string, isCompleted: boolean) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('homework')
        .update({ is_completed: !isCompleted })
        .eq('id', homeworkId);

      if (error) throw error;
      fetchHomework();
    } catch (error) {
      console.error('Error updating homework status:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус задания",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление домашними заданиями</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить задание
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Новое задание</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Название
                </Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={newHomework.title}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Описание
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newHomework.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">
                  Предмет
                </Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student" className="text-right">
                  Ученик
                </Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Выберите ученика" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">
                  Срок сдачи
                </Label>
                <Input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={newHomework.deadline}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" onClick={handleAddHomework} disabled={isSubmitting}>
                {isSubmitting && <Loader size="sm" className="mr-2" />}
                Добавить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {homeworkList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет заданий</h3>
            <p className="text-gray-500">
              Добавьте задания для ваших учеников
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homeworkList.map((homework) => (
            <Card key={homework.id} className="bg-white shadow-sm rounded-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{homework.title}</CardTitle>
                <Badge variant={homework.is_completed ? "secondary" : "outline"}>
                  {homework.is_completed ? "Выполнено" : "В процессе"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 mb-2">
                  <BookOpen className="h-4 w-4 mr-1 inline-block" />
                  {subjects.find(s => s.id === homework.subject_id)?.name || 'Предмет не указан'}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  <User className="h-4 w-4 mr-1 inline-block" />
                  {students.find(s => s.id === homework.student_id)?.name || 'Ученик не указан'}
                </div>
                <div className="text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1 inline-block" />
                  Срок сдачи: {format(new Date(homework.deadline), 'dd MMM yyyy', { locale: ru })}
                </div>
                <p className="text-sm mt-2">{homework.description}</p>
              </CardContent>
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => handleCompleteToggle(homework.id, homework.is_completed)}
                >
                  {homework.is_completed ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      Отметить как невыполненное
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Отметить как выполненное
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
