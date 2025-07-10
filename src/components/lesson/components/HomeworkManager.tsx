import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  BookOpen, 
  Star,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { useToast } from "@/hooks/use-toast";

interface HomeworkManagerProps {
  studentId?: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Homework {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: string;
  grade?: number;
  feedback?: string;
  answer?: string;
  student: {
    first_name: string;
    last_name: string;
  };
  subject: {
    name: string;
  };
}

export const HomeworkManager = ({ studentId }: HomeworkManagerProps) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  
  // Form fields
  const [selectedStudent, setSelectedStudent] = useState(studentId || '');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [grade, setGrade] = useState<number | ''>('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
    fetchHomework();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', 
          await supabase
            .from('student_tutor_relationships')
            .select('student_id')
            .eq('tutor_id', user?.id)
            .eq('status', 'accepted')
            .then(({ data }) => data?.map(rel => rel.student_id) || [])
        );

      if (error) throw error;
      
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchHomework = async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select(`
          *,
          student:profiles!homework_student_id_fkey(first_name, last_name),
          subject:subjects(name)
        `)
        .eq('tutor_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
    }
  };

  const createHomework = async () => {
    if (!selectedStudent || !selectedSubject || !title || !description || !dueDate) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('homework')
        .insert({
          tutor_id: user?.id,
          student_id: selectedStudent,
          subject_id: selectedSubject,
          title,
          description,
          due_date: new Date(dueDate).toISOString(),
          status: 'assigned'
        });

      if (error) throw error;

      toast({
        title: "Задание создано",
        description: "Домашнее задание успешно отправлено ученику",
      });

      resetForm();
      fetchHomework();
    } catch (error) {
      console.error('Error creating homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать домашнее задание",
        variant: "destructive"
      });
    }
  };

  const gradeHomework = async (homeworkId: string) => {
    if (grade === '' || !feedback.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите оценку и комментарий",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('homework')
        .update({
          grade: Number(grade),
          feedback: feedback.trim(),
          status: 'graded'
        })
        .eq('id', homeworkId);

      if (error) throw error;

      toast({
        title: "Оценка поставлена",
        description: "Домашнее задание оценено",
      });

      setSelectedHomework(null);
      setGrade('');
      setFeedback('');
      fetchHomework();
    } catch (error) {
      console.error('Error grading homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось поставить оценку",
        variant: "destructive"
      });
    }
  };

  const deleteHomework = async (homeworkId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это задание?')) return;

    try {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', homeworkId);

      if (error) throw error;

      toast({
        title: "Задание удалено",
        description: "Домашнее задание было удалено",
      });

      fetchHomework();
    } catch (error) {
      console.error('Error deleting homework:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить задание",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setSelectedStudent(studentId || '');
    setSelectedSubject('');
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'assigned': { variant: 'secondary' as const, text: 'Назначено', icon: BookOpen },
      'submitted': { variant: 'default' as const, text: 'Отправлено', icon: Send },
      'graded': { variant: 'default' as const, text: 'Оценено', icon: CheckCircle },
      'overdue': { variant: 'destructive' as const, text: 'Просрочено', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.assigned;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Управление домашними заданиями</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать задание
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Новое домашнее задание</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Ученик *</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ученика" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Предмет *</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Название задания *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название задания"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Описание *</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Опишите задание подробно"
                className="min-h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Срок выполнения *</label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={createHomework}>
                <BookOpen className="h-4 w-4 mr-2" />
                Создать задание
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Homework List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {homework.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>Домашние задания не найдены</p>
              <p className="text-sm">Создайте первое задание для ученика</p>
            </div>
          </div>
        ) : (
          homework.map((hw) => (
            <Card key={hw.id} className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{hw.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{hw.student.first_name} {hw.student.last_name}</span>
                      <span>•</span>
                      <span>{hw.subject.name}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(hw.due_date).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(hw.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteHomework(hw.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm mb-3">{hw.description}</p>

                {hw.status === 'submitted' && (
                  <div className="bg-muted p-3 rounded-lg mb-3">
                    <h4 className="font-medium mb-2">Ответ ученика:</h4>
                    <p className="text-sm">{hw.answer}</p>
                    
                    {selectedHomework?.id === hw.id ? (
                      <div className="mt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Оценка (1-10)</label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={grade}
                              onChange={(e) => setGrade(e.target.value === '' ? '' : Number(e.target.value))}
                              placeholder="Оценка"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Комментарий</label>
                          <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Ваш комментарий к работе..."
                            className="min-h-20"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => gradeHomework(hw.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            Поставить оценку
                          </Button>
                          <Button variant="outline" onClick={() => setSelectedHomework(null)}>
                            Отмена
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="mt-3"
                        onClick={() => setSelectedHomework(hw)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Оценить работу
                      </Button>
                    )}
                  </div>
                )}

                {hw.status === 'graded' && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Оценка: {hw.grade}/10</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{hw.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};