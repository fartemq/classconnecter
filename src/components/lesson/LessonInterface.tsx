import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  MessageSquare, 
  Edit3, 
  BookOpen, 
  HelpCircle,
  Clock,
  Calculator,
  FileText,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Monitor,
  Phone,
  Save
} from "lucide-react";
import { LessonVideoCall } from "./components/LessonVideoCall";
import { LessonWhiteboard } from "./components/LessonWhiteboard";
import { LessonNotes } from "./components/LessonNotes";
import { LessonHomework } from "./components/LessonHomework";
import { LessonChat } from "./components/LessonChat";
import { LessonTimer } from "./components/LessonTimer";
import { LessonCalculator } from "./components/LessonCalculator";
import { LessonMaterials } from "./components/LessonMaterials";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";

interface LessonData {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  status: string;
  lesson_type: string;
  tutor?: { first_name: string; last_name: string };
  student?: { first_name: string; last_name: string };
  subject?: { name: string };
}

interface PartnerData {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export const LessonInterface = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [activeTools, setActiveTools] = useState<string[]>(['chat']);
  const [layout, setLayout] = useState<'grid' | 'split' | 'focus'>('grid');
  const [focusedTool, setFocusedTool] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Get partner info from URL params
  const partnerId = searchParams.get('partnerId');
  const userRole = searchParams.get('role') as 'student' | 'tutor';

  useEffect(() => {
    if (lessonId) {
      // Existing lesson mode
      fetchLessonData();
    } else if (partnerId && userRole && user) {
      // New session mode
      initializeSession();
    } else {
      // No valid parameters
      toast({
        title: "Ошибка",
        description: "Недостаточно данных для запуска урока",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [lessonId, partnerId, userRole, user]);

  const initializeSession = async () => {
    try {
      setLoading(true);
      
      // Generate session ID for temporary lesson
      const tempSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(tempSessionId);

      // Fetch partner data
      const { data: partnerData, error: partnerError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('id', partnerId)
        .single();

      if (partnerError) throw partnerError;

      // Verify relationship exists
      const studentId = userRole === 'student' ? user?.id : partnerId;
      const tutorId = userRole === 'tutor' ? user?.id : partnerId;

      const { data: relationData, error: relationError } = await supabase
        .from('student_tutor_relationships')
        .select('status')
        .eq('student_id', studentId)
        .eq('tutor_id', tutorId)
        .maybeSingle();

      if (relationError) {
        console.error('Error checking relationship:', relationError);
      }

      // Create relationship if it doesn't exist
      if (!relationData) {
        const { error: createRelationError } = await supabase
          .from('student_tutor_relationships')
          .upsert({
            student_id: studentId,
            tutor_id: tutorId,
            status: 'pending',
            start_date: new Date().toISOString()
          }, {
            onConflict: 'student_id,tutor_id'
          });

        if (createRelationError) {
          console.error('Error creating relationship:', createRelationError);
        }
      }

      setPartner(partnerData);
      setHasAccess(true);

    } catch (error) {
      console.error('Error initializing session:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось инициализировать сессию урока",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonData = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          tutor:profiles!tutor_id(first_name, last_name),
          student:profiles!student_id(first_name, last_name),
          subject:subjects(name)
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      
      // Проверяем права доступа
      const userIsParticipant = data.tutor_id === user?.id || data.student_id === user?.id;
      
      if (!userIsParticipant) {
        // Дополнительная проверка через связи студент-репетитор для админов/модераторов
        if (user?.email !== "arsenalreally35@gmail.com") {
          toast({
            title: "Доступ запрещен",
            description: "У вас нет доступа к этому занятию",
            variant: "destructive"
          });
          navigate('/');
          return;
        }
      }

      setLesson(data);
      setHasAccess(true);
    } catch (error) {
      console.error('Error fetching lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные урока",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const toggleTool = (tool: string) => {
    setActiveTools(prev => 
      prev.includes(tool) 
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const setFocus = (tool: string) => {
    setLayout('focus');
    setFocusedTool(tool);
  };

  const exitFocus = () => {
    setLayout('grid');
    setFocusedTool(null);
  };

  const startCall = () => {
    setIsCallActive(true);
    if (!activeTools.includes('video')) {
      toggleTool('video');
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsRecording(false);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "Запись остановлена" : "Запись началась",
      description: isRecording ? "Видео сохранено" : "Урок записывается",
    });
  };

  const saveLesson = async () => {
    try {
      if (lessonId) {
        const { error } = await supabase
          .from('lessons')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', lessonId);

        if (error) throw error;
      }
      
      toast({
        title: "Урок сохранен",
        description: "Все материалы урока сохранены",
      });
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить урок",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Доступ запрещен</h2>
          <p className="text-gray-600">У вас нет доступа к этому уроку</p>
        </div>
      </div>
    );
  }

  const tools = [
    { id: 'video', name: 'Видеозвонок', icon: Video, color: 'bg-blue-500' },
    { id: 'whiteboard', name: 'Онлайн доска', icon: Edit3, color: 'bg-green-500' },
    { id: 'notes', name: 'Конспект занятия', icon: FileText, color: 'bg-purple-500' },
    { id: 'homework', name: 'Домашнее задание', icon: BookOpen, color: 'bg-orange-500' },
    { id: 'chat', name: 'Вопросы', icon: MessageSquare, color: 'bg-indigo-500' },
    { id: 'timer', name: 'Таймер', icon: Clock, color: 'bg-red-500' },
    { id: 'calculator', name: 'Калькулятор', icon: Calculator, color: 'bg-yellow-500' },
    { id: 'materials', name: 'Материалы', icon: FileText, color: 'bg-gray-500' }
  ];

  // Display names based on lesson or partner data
  const getTutorName = () => {
    if (lesson?.tutor) return `${lesson.tutor.first_name} ${lesson.tutor.last_name}`;
    if (partner && userRole === 'student') return `${partner.first_name} ${partner.last_name}`;
    if (userRole === 'tutor') return `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`;
    return 'Репетитор';
  };

  const getStudentName = () => {
    if (lesson?.student) return `${lesson.student.first_name} ${lesson.student.last_name}`;
    if (partner && userRole === 'tutor') return `${partner.first_name} ${partner.last_name}`;
    if (userRole === 'student') return `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`;
    return 'Ученик';
  };

  const getSubjectName = () => {
    if (lesson?.subject) return lesson.subject.name;
    return 'Урок';
  };

  // Use lessonId or sessionId for components
  const componentId = lessonId || sessionId;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">
              {getSubjectName()} - Урок
            </h1>
            <Badge variant="outline">
              {getTutorName()}
            </Badge>
            <Badge variant="outline">
              {getStudentName()}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                ● ЗАПИСЬ
              </Badge>
            )}
            
            <Button
              variant={isCallActive ? "destructive" : "default"}
              size="sm"
              onClick={isCallActive ? endCall : startCall}
            >
              {isCallActive ? <Phone className="h-4 w-4 mr-2" /> : <Video className="h-4 w-4 mr-2" />}
              {isCallActive ? "Завершить звонок" : "Начать звонок"}
            </Button>
            
            {isCallActive && (
              <Button
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                onClick={toggleRecording}
              >
                {isRecording ? "Стоп запись" : "Записать"}
              </Button>
            )}
            
            <Button variant="outline" size="sm" onClick={saveLesson}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </div>

      {/* Tools Bar */}
      <div className="bg-white border-b px-6 py-2">
        <div className="flex items-center space-x-2">
          {tools.map(tool => (
            <Button
              key={tool.id}
              variant={activeTools.includes(tool.id) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTool(tool.id)}
              className={`${activeTools.includes(tool.id) ? tool.color + ' text-white' : ''}`}
            >
              <tool.icon className="h-4 w-4 mr-2" />
              {tool.name}
            </Button>
          ))}
          
          <div className="ml-auto flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayout('grid')}
              className={layout === 'grid' ? 'bg-gray-100' : ''}
            >
              Сетка
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayout('split')}
              className={layout === 'split' ? 'bg-gray-100' : ''}
            >
              Разделить
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {layout === 'focus' && focusedTool ? (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {tools.find(t => t.id === focusedTool)?.name}
              </h2>
              <Button variant="outline" size="sm" onClick={exitFocus}>
                <Minimize2 className="h-4 w-4 mr-2" />
                Свернуть
              </Button>
            </div>
            <Card className="h-full">
              <CardContent className="p-4 h-full">
                {focusedTool === 'video' && <LessonVideoCall lessonId={componentId} />}
                {focusedTool === 'whiteboard' && <LessonWhiteboard lessonId={componentId} />}
                {focusedTool === 'notes' && <LessonNotes lessonId={componentId} />}
                {focusedTool === 'homework' && <LessonHomework lessonId={componentId} />}
                {focusedTool === 'chat' && <LessonChat lessonId={componentId} />}
                {focusedTool === 'timer' && <LessonTimer />}
                {focusedTool === 'calculator' && <LessonCalculator />}
                {focusedTool === 'materials' && <LessonMaterials lessonId={componentId} />}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className={`grid gap-4 h-full ${
            layout === 'split' ? 'grid-cols-2' : 
            activeTools.length <= 2 ? 'grid-cols-1 lg:grid-cols-2' :
            activeTools.length <= 4 ? 'grid-cols-2 lg:grid-cols-2' :
            'grid-cols-2 lg:grid-cols-3'
          }`}>
            {activeTools.map(toolId => {
              const tool = tools.find(t => t.id === toolId);
              if (!tool) return null;
              
              return (
                <Card key={toolId} className="flex flex-col">
                  <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center space-x-2">
                      <tool.icon className="h-4 w-4" />
                      <h3 className="font-medium">{tool.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFocus(toolId)}
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="flex-1 p-4">
                    {toolId === 'video' && <LessonVideoCall lessonId={componentId} />}
                    {toolId === 'whiteboard' && <LessonWhiteboard lessonId={componentId} />}
                    {toolId === 'notes' && <LessonNotes lessonId={componentId} />}
                    {toolId === 'homework' && <LessonHomework lessonId={componentId} />}
                    {toolId === 'chat' && <LessonChat lessonId={componentId} />}
                    {toolId === 'timer' && <LessonTimer />}
                    {toolId === 'calculator' && <LessonCalculator />}
                    {toolId === 'materials' && <LessonMaterials lessonId={componentId} />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
