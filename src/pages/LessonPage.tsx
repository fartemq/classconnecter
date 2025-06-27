
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Video, VideoOff, Mic, MicOff, Phone, Clock, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { LessonInterface } from "@/components/lesson/LessonInterface";

interface LessonData {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  student: {
    id: string;
    first_name: string;
    last_name: string;
  };
  tutor: {
    id: string;
    first_name: string;
    last_name: string;
  };
  subject: {
    name: string;
  };
}

const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inLesson, setInLesson] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  useEffect(() => {
    if (!user || !lessonId) {
      navigate("/");
      return;
    }

    fetchLessonData();
  }, [lessonId, user, navigate]);

  const fetchLessonData = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          id,
          start_time,
          end_time,
          status,
          student:profiles!lessons_student_id_fkey (
            id,
            first_name,
            last_name
          ),
          tutor:profiles!lessons_tutor_id_fkey (
            id,
            first_name,
            last_name
          ),
          subject:subjects (
            name
          )
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;

      // Проверяем, что пользователь участник урока
      const studentData = Array.isArray(data.student) ? data.student[0] : data.student;
      const tutorData = Array.isArray(data.tutor) ? data.tutor[0] : data.tutor;
      const subjectData = Array.isArray(data.subject) ? data.subject[0] : data.subject;

      if (studentData?.id !== user.id && tutorData?.id !== user.id) {
        toast({
          title: "Доступ запрещен",
          description: "У вас нет доступа к этому уроку",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setLesson({
        ...data,
        student: studentData,
        tutor: tutorData,
        subject: subjectData
      });
    } catch (error) {
      console.error("Error fetching lesson:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные урока",
        variant: "destructive"
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLesson = () => {
    const now = new Date();
    const lessonStart = new Date(lesson!.start_time);
    const lessonEnd = new Date(lesson!.end_time);
    const timeDiff = lessonStart.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    // Разрешаем войти за 15 минут до начала
    if (minutesUntilStart > 15) {
      toast({
        title: "Урок ещё не начался",
        description: `До начала урока осталось ${minutesUntilStart} минут`,
        variant: "destructive"
      });
      return;
    }

    // Проверяем, что урок ещё не закончился
    if (now > lessonEnd) {
      toast({
        title: "Урок завершён",
        description: "Время урока истекло",
        variant: "destructive"
      });
      return;
    }

    setInLesson(true);
    
    toast({
      title: "Подключение к уроку",
      description: "Добро пожаловать в урок!",
    });
  };

  const handleLeaveLesson = () => {
    setInLesson(false);
    
    toast({
      title: "Вы покинули урок",
      description: "До свидания!",
    });
    
    // Можно добавить редирект на страницу профиля
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const canJoinLesson = () => {
    if (!lesson) return false;
    
    const now = new Date();
    const lessonStart = new Date(lesson.start_time);
    const lessonEnd = new Date(lesson.end_time);
    const timeDiff = lessonStart.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    return minutesUntilStart <= 15 && now <= lessonEnd;
  };

  const getTimeUntilStart = () => {
    if (!lesson) return "";
    
    const now = new Date();
    const lessonStart = new Date(lesson.start_time);
    const timeDiff = lessonStart.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(timeDiff / (1000 * 60));

    if (minutesUntilStart > 0) {
      return `До начала: ${minutesUntilStart} мин`;
    } else if (minutesUntilStart >= -60) {
      return "Урок идёт";
    } else {
      return "Урок завершён";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка урока...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            Урок не найден или у вас нет доступа к нему.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isStudent = lesson.student.id === user?.id;
  const otherParticipant = isStudent ? lesson.tutor : lesson.student;
  const role = isStudent ? "Студент" : "Репетитор";

  if (inLesson) {
    return (
      <div className="min-h-screen bg-gray-900">
        {/* Заголовок урока */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="font-semibold">{lesson.subject.name}</h1>
                <p className="text-sm text-gray-600">
                  с {otherParticipant.first_name} {otherParticipant.last_name}
                </p>
              </div>
              <Badge variant="outline">{role}</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={videoEnabled ? "default" : "destructive"}
                size="sm"
                onClick={() => setVideoEnabled(!videoEnabled)}
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant={audioEnabled ? "default" : "destructive"}
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLeaveLesson}
              >
                <Phone className="w-4 h-4 mr-2" />
                Завершить
              </Button>
            </div>
          </div>
        </div>

        {/* Интерфейс урока */}
        <div className="flex-1">
          <LessonInterface />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Урок: {lesson.subject.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Информация об уроке */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Участники</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={isStudent ? "default" : "secondary"}>
                      {isStudent ? "Вы (Студент)" : "Студент"}
                    </Badge>
                    <span>{lesson.student.first_name} {lesson.student.last_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={!isStudent ? "default" : "secondary"}>
                      {!isStudent ? "Вы (Репетитор)" : "Репетитор"}
                    </Badge>
                    <span>{lesson.tutor.first_name} {lesson.tutor.last_name}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Время урока</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(lesson.start_time), 'dd MMMM, HH:mm', { locale: ru })} - 
                      {format(new Date(lesson.end_time), 'HH:mm', { locale: ru })}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    {getTimeUntilStart()}
                  </div>
                </div>
              </div>
            </div>

            {/* Статус урока */}
            <Alert>
              <AlertDescription>
                {canJoinLesson() 
                  ? "Вы можете присоединиться к уроку. Нажмите кнопку ниже для входа."
                  : "Урок будет доступен за 15 минут до начала."
                }
              </AlertDescription>
            </Alert>

            {/* Кнопки управления */}
            <div className="flex space-x-4">
              <Button 
                onClick={handleJoinLesson}
                disabled={!canJoinLesson()}
                className="flex-1"
              >
                <Video className="w-4 h-4 mr-2" />
                Войти в урок
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Вернуться назад
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonPage;
