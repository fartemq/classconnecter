import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Edit2, 
  Trash2,
  Users,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

interface LessonSchedulerProps {
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

interface ScheduledLesson {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  status: string;
  student: {
    first_name: string;
    last_name: string;
  };
  subject: {
    name: string;
  };
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const LessonScheduler = ({ studentId }: LessonSchedulerProps) => {
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scheduledLessons, setScheduledLessons] = useState<ScheduledLesson[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form fields
  const [selectedStudent, setSelectedStudent] = useState(studentId || '');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [duration, setDuration] = useState(60);

  useEffect(() => {
    fetchStudents();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchScheduledLessons();
      fetchAvailableSlots();
    }
  }, [selectedDate]);

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

  const fetchScheduledLessons = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          student:profiles!student_id(first_name, last_name),
          subject:subjects(name)
        `)
        .eq('tutor_id', user?.id)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lt('start_time', `${dateStr}T23:59:59`)
        .order('start_time');

      if (error) throw error;
      setScheduledLessons(data || []);
    } catch (error) {
      console.error('Error fetching scheduled lessons:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .rpc('generate_tutor_time_slots', {
          p_tutor_id: user?.id,
          p_date: dateStr
        });

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
    }
  };

  const createLesson = async () => {
    if (!selectedStudent || !selectedSubject || !selectedSlot) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    try {
      const slot = availableSlots.find(s => s.id === selectedSlot);
      if (!slot) return;

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const startTime = `${dateStr}T${slot.start_time}`;
      const endTime = `${dateStr}T${slot.end_time}`;

      const { error } = await supabase
        .from('lessons')
        .insert({
          tutor_id: user?.id,
          student_id: selectedStudent,
          subject_id: selectedSubject,
          start_time: startTime,
          end_time: endTime,
          status: 'upcoming',
          lesson_type: 'regular'
        });

      if (error) throw error;

      toast({
        title: "Урок запланирован",
        description: "Урок успешно добавлен в расписание",
      });

      resetForm();
      fetchScheduledLessons();
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось запланировать урок",
        variant: "destructive"
      });
    }
  };

  const cancelLesson = async (lessonId: string) => {
    if (!confirm('Вы уверены, что хотите отменить этот урок?')) return;

    try {
      const { error } = await supabase
        .from('lessons')
        .update({ status: 'cancelled' })
        .eq('id', lessonId);

      if (error) throw error;

      toast({
        title: "Урок отменен",
        description: "Урок был отменен",
      });

      fetchScheduledLessons();
      fetchAvailableSlots();
    } catch (error) {
      console.error('Error cancelling lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отменить урок",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setShowCreateForm(false);
    setSelectedStudent(studentId || '');
    setSelectedSubject('');
    setSelectedSlot('');
    setDuration(60);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'upcoming': { variant: 'default' as const, text: 'Предстоящий', icon: Clock },
      'confirmed': { variant: 'default' as const, text: 'Подтвержден', icon: CheckCircle },
      'completed': { variant: 'secondary' as const, text: 'Завершен', icon: CheckCircle },
      'cancelled': { variant: 'destructive' as const, text: 'Отменен', icon: X }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.upcoming;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Планировщик уроков</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Запланировать урок
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Новый урок</CardTitle>
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
              <label className="text-sm font-medium mb-2 block">Время *</label>
              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите время" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots
                    .filter(slot => slot.is_available)
                    .map(slot => (
                      <SelectItem key={slot.id} value={slot.id}>
                        {slot.start_time} - {slot.end_time}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={createLesson}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Запланировать
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar and Schedule */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Календарь
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={ru}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Daily Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Расписание на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduledLessons.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>На этот день уроки не запланированы</p>
                  </div>
                ) : (
                  scheduledLessons.map((lesson) => (
                    <Card key={lesson.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{lesson.subject.name}</h3>
                              {getStatusBadge(lesson.status)}
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>{lesson.student.first_name} {lesson.student.last_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {format(parseISO(lesson.start_time), 'HH:mm')} - 
                                  {format(parseISO(lesson.end_time), 'HH:mm')}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            {lesson.status === 'upcoming' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelLesson(lesson.id)}
                                title="Отменить урок"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};