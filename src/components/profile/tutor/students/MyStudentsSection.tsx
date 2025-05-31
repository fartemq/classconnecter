
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Calendar, BookOpen, GraduationCap, Users, Clock } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface StudentData {
  id: string;
  student_id: string;
  name: string;
  avatar_url?: string;
  city?: string;
  relationship_start: string;
  last_lesson?: string;
  total_lessons: number;
  unread_messages: number;
  is_new: boolean;
}

export const MyStudentsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchStudents();
    }
  }, [user?.id]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Получаем отношения с учениками
      const { data: relationships, error: relationshipsError } = await supabase
        .from('student_tutor_relationships')
        .select(`
          id,
          student_id,
          start_date,
          created_at,
          updated_at,
          student:profiles!student_id (
            id,
            first_name,
            last_name,
            avatar_url,
            city
          )
        `)
        .eq('tutor_id', user?.id)
        .eq('status', 'accepted')
        .order('updated_at', { ascending: false });

      if (relationshipsError) throw relationshipsError;

      if (!relationships || relationships.length === 0) {
        setStudents([]);
        return;
      }

      // Получаем статистику по урокам для каждого студента
      const studentIds = relationships.map(rel => rel.student_id);
      
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('student_id, created_at, status')
        .eq('tutor_id', user?.id)
        .in('student_id', studentIds);

      if (lessonsError) throw lessonsError;

      // Получаем непрочитанные сообщения
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', user?.id)
        .eq('is_read', false)
        .in('sender_id', studentIds);

      if (messagesError) throw messagesError;

      // Формируем данные о студентах
      const studentsData: StudentData[] = relationships.map(relationship => {
        const student = Array.isArray(relationship.student) 
          ? relationship.student[0] 
          : relationship.student;

        const studentLessons = lessonsData?.filter(lesson => lesson.student_id === relationship.student_id) || [];
        const completedLessons = studentLessons.filter(lesson => lesson.status === 'completed');
        const lastLesson = studentLessons
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        const unreadMessages = messagesData?.filter(msg => msg.sender_id === relationship.student_id).length || 0;

        // Проверяем, новый ли это студент (добавлен за последние 24 часа)
        const isNew = new Date().getTime() - new Date(relationship.updated_at).getTime() < 24 * 60 * 60 * 1000;

        return {
          id: relationship.id,
          student_id: relationship.student_id,
          name: `${student?.first_name || ''} ${student?.last_name || ''}`.trim(),
          avatar_url: student?.avatar_url,
          city: student?.city,
          relationship_start: relationship.start_date || relationship.created_at,
          last_lesson: lastLesson?.created_at,
          total_lessons: completedLessons.length,
          unread_messages: unreadMessages,
          is_new: isNew
        };
      });

      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список студентов',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = (studentId: string) => {
    navigate(`/profile/tutor/chats/${studentId}`);
  };

  const handleScheduleClick = (studentId: string) => {
    navigate(`/profile/tutor/schedule?student=${studentId}`);
  };

  const handleHomeworkClick = (studentId: string) => {
    navigate(`/profile/tutor/homework?student=${studentId}`);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Мои ученики</h2>
          <p className="text-gray-600">Управляйте своими учениками и взаимодействуйте с ними</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          <Users className="h-4 w-4 mr-2" />
          {students.length}
        </Badge>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Пока нет учеников</h3>
            <p className="text-gray-500 mb-4">
              Когда студенты отправят запросы и вы их примете, они появятся здесь
            </p>
            <Button onClick={() => navigate('/profile/tutor/lesson-requests')}>
              Проверить запросы
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.avatar_url} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold truncate">{student.name}</h3>
                      {student.is_new && (
                        <Badge variant="default" className="bg-green-500 text-xs">
                          Новый
                        </Badge>
                      )}
                    </div>
                    
                    {student.city && (
                      <p className="text-sm text-gray-500">{student.city}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {student.total_lessons} занятий
                      </span>
                      {student.unread_messages > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {student.unread_messages} новых
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Ученик с {format(new Date(student.relationship_start), 'dd MMM yyyy', { locale: ru })}
                  </div>
                  {student.last_lesson && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Последний урок: {format(new Date(student.last_lesson), 'dd MMM', { locale: ru })}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleChatClick(student.student_id)}
                    className="relative"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {student.unread_messages > 0 && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleScheduleClick(student.student_id)}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleHomeworkClick(student.student_id)}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
