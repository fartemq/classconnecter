import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useSimpleAuth } from "@/hooks/auth/SimpleAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChatInterface } from "@/components/chat/ChatInterface";

const ChatPage = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { user } = useSimpleAuth();
  const { toast } = useToast();
  
  const [tutor, setTutor] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !tutorId) return;
    
    fetchTutorInfo();
  }, [user, tutorId]);

  const fetchTutorInfo = async () => {
    try {
      // Получаем информацию о репетиторе
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .eq("id", tutorId)
        .single();

      if (profileError) throw profileError;
      setTutor(profileData);

      // Получаем предметы репетитора
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("tutor_subjects")
        .select(`
          subject_id,
          hourly_rate,
          subjects:subject_id (
            id, name
          )
        `)
        .eq("tutor_id", tutorId)
        .eq("is_active", true);

      if (subjectsError) throw subjectsError;

      const formattedSubjects = subjectsData.map(item => ({
        id: (item.subjects as any).id,
        name: (item.subjects as any).name,
        hourlyRate: item.hourly_rate || 0
      }));

      setSubjects(formattedSubjects);
      
    } catch (error) {
      console.error("Error fetching tutor:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить информацию о репетиторе",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold mb-4">Требуется авторизация</h2>
              <p className="text-muted-foreground mb-4">
                Для общения с репетиторами необходимо войти в систему
              </p>
              <Button onClick={() => navigate("/login")}>
                Войти в систему
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                Загрузка чата...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>

        {tutor ? (
          <ChatInterface
            participantId={tutorId!}
            participantName={`${tutor.first_name} ${tutor.last_name}`}
            participantAvatar={tutor.avatar_url}
            participantRole="tutor"
            subjects={subjects}
          />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">Репетитор не найден</h2>
              <p className="text-muted-foreground mb-4">
                Возможно, репетитор больше не доступен
              </p>
              <Button onClick={() => navigate("/tutors")}>
                Найти других репетиторов
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ChatPage;