
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Phone,
  Save,
  Menu,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from "lucide-react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { GoogleMeetIntegration } from "./components/GoogleMeetIntegration";
import { MiroIntegration } from "./components/MiroIntegration";
import { LessonNotes } from "./components/LessonNotes";
import { LessonHomework } from "./components/LessonHomework";
import { EnhancedLessonChat } from "./components/EnhancedLessonChat";
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

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  category: string;
  description: string;
}

export const EnhancedLessonInterface = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [activeTools, setActiveTools] = useState<string[]>(['chat', 'whiteboard']);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(true);
  const [hiddenPanels, setHiddenPanels] = useState<string[]>([]);

  // Get partner info from URL params
  const partnerId = searchParams.get('partnerId');
  const userRole = searchParams.get('role') as 'student' | 'tutor';

  const tools: Tool[] = [
    { id: 'video', name: 'Google Meet', icon: Video, category: 'communication', description: 'Видеосвязь через Google Meet' },
    { id: 'chat', name: 'Чат и вопросы', icon: MessageSquare, category: 'communication', description: 'Общение и вопросы' },
    { id: 'whiteboard', name: 'Miro Доска', icon: Edit3, category: 'tools', description: 'Интерактивная доска Miro' },
    { id: 'notes', name: 'Конспект', icon: FileText, category: 'content', description: 'Заметки урока' },
    { id: 'homework', name: 'Домашнее задание', icon: BookOpen, category: 'content', description: 'Задания и проверка' },
    { id: 'materials', name: 'Материалы', icon: FileText, category: 'content', description: 'Файлы и документы' },
    { id: 'timer', name: 'Таймер', icon: Clock, category: 'utils', description: 'Контроль времени' },
    { id: 'calculator', name: 'Калькулятор', icon: Calculator, category: 'utils', description: 'Математические расчеты' }
  ];

  useEffect(() => {
    if (lessonId) {
      fetchLessonData();
    } else if (partnerId && userRole && user) {
      initializeSession();
    } else {
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
      
      const tempSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(tempSessionId);

      const { data: partnerData, error: partnerError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('id', partnerId)
        .single();

      if (partnerError) throw partnerError;

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
      
      const userIsParticipant = data.tutor_id === user?.id || data.student_id === user?.id;
      
      if (!userIsParticipant) {
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

  const toggleTool = (toolId: string) => {
    setActiveTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(t => t !== toolId)
        : [...prev, toolId]
    );
  };

  const togglePanelVisibility = (toolId: string) => {
    setHiddenPanels(prev => 
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
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

  const componentId = lessonId || sessionId;

  const renderToolContent = (toolId: string) => {
    switch (toolId) {
      case 'video':
        return <GoogleMeetIntegration lessonId={componentId} />;
      case 'whiteboard':
        return <MiroIntegration lessonId={componentId} />;
      case 'notes':
        return <LessonNotes lessonId={componentId} />;
      case 'homework':
        return <LessonHomework lessonId={componentId} />;
      case 'chat':
        return <EnhancedLessonChat lessonId={componentId} />;
      case 'timer':
        return <LessonTimer />;
      case 'calculator':
        return <LessonCalculator />;
      case 'materials':
        return <LessonMaterials lessonId={componentId} />;
      default:
        return <div>Инструмент не найден</div>;
    }
  };

  const visibleTools = activeTools.filter(toolId => !hiddenPanels.includes(toolId));

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Left Tools Panel */}
      <div className={`bg-white border-r transition-all duration-300 ${
        isToolsPanelOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {isToolsPanelOpen && (
              <h2 className="font-semibold text-gray-800">Инструменты</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsToolsPanelOpen(!isToolsPanelOpen)}
            >
              {isToolsPanelOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="p-2">
          {Object.entries(
            tools.reduce((acc, tool) => {
              if (!acc[tool.category]) acc[tool.category] = [];
              acc[tool.category].push(tool);
              return acc;
            }, {} as Record<string, Tool[]>)
          ).map(([category, categoryTools]) => (
            <div key={category} className="mb-4">
              {isToolsPanelOpen && (
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                  {category === 'communication' ? 'Связь' : 
                   category === 'tools' ? 'Инструменты' : 
                   category === 'content' ? 'Контент' : 'Утилиты'}
                </h3>
              )}
              <div className="space-y-1">
                {categoryTools.map(tool => (
                  <Button
                    key={tool.id}
                    variant={activeTools.includes(tool.id) ? "default" : "ghost"}
                    className={`w-full justify-start ${!isToolsPanelOpen ? 'px-2' : ''}`}
                    onClick={() => toggleTool(tool.id)}
                  >
                    <tool.icon className={`h-4 w-4 ${isToolsPanelOpen ? 'mr-3' : ''}`} />
                    {isToolsPanelOpen && (
                      <div className="flex-1 text-left">
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs text-gray-500">{tool.description}</div>
                      </div>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <div className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {getSubjectName()}
                </h1>
                <p className="text-sm text-gray-600">Онлайн урок</p>
              </div>
              
              <div className="flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded-lg">
                <Users className="h-4 w-4 text-gray-500" />
                <div className="text-sm">
                  <span className="font-medium">{getTutorName()}</span>
                  <span className="text-gray-500 mx-2">•</span>
                  <span className="font-medium">{getStudentName()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  ● ЗАПИСЬ
                </Badge>
              )}
              
              <Button
                variant={isCallActive ? "destructive" : "default"}
                onClick={isCallActive ? endCall : startCall}
                className="bg-primary hover:bg-primary/90"
              >
                {isCallActive ? <Phone className="h-4 w-4 mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                {isCallActive ? "Завершить звонок" : "Начать звонок"}
              </Button>
              
              {isCallActive && (
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={toggleRecording}
                >
                  {isRecording ? "Стоп запись" : "Записать"}
                </Button>
              )}
              
              <Button onClick={saveLesson} className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                Сохранить
              </Button>
            </div>
          </div>
        </div>

        {/* Resizable Main Area */}
        <div className="flex-1 p-4">
          {visibleTools.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Выберите инструменты</h3>
                <p>Используйте левую панель для добавления инструментов урока</p>
              </div>
            </div>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {visibleTools.map((toolId, index) => {
                const tool = tools.find(t => t.id === toolId);
                if (!tool) return null;
                
                return (
                  <React.Fragment key={toolId}>
                    <ResizablePanel defaultSize={100 / visibleTools.length} minSize={20}>
                      <Card className="h-full flex flex-col">
                        <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                          <div className="flex items-center space-x-2">
                            <tool.icon className="h-4 w-4" />
                            <h3 className="font-medium">{tool.name}</h3>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePanelVisibility(toolId)}
                              title="Скрыть панель"
                            >
                              <Minimize2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="flex-1 p-4 overflow-hidden">
                          {renderToolContent(toolId)}
                        </CardContent>
                      </Card>
                    </ResizablePanel>
                    
                    {index < visibleTools.length - 1 && (
                      <ResizableHandle withHandle />
                    )}
                  </React.Fragment>
                );
              })}
            </ResizablePanelGroup>
          )}
        </div>

        {/* Hidden Panels Indicator */}
        {hiddenPanels.length > 0 && (
          <div className="px-4 py-2 bg-yellow-50 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-yellow-800">
                <span>Скрытые панели:</span>
                {hiddenPanels.map(panelId => {
                  const tool = tools.find(t => t.id === panelId);
                  return tool ? (
                    <Badge key={panelId} variant="outline" className="text-yellow-800">
                      {tool.name}
                    </Badge>
                  ) : null;
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHiddenPanels([])}
                className="text-yellow-800 hover:text-yellow-900"
              >
                Показать все
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
