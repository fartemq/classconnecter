
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Calendar, 
  User, 
  BookOpen, 
  Star,
  Clock,
  MapPin,
  GraduationCap,
  Phone,
  Mail,
  DollarSign,
  Heart,
  HeartOff,
  Users,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/auth/useAuth";

interface Tutor {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  city: string | null;
  subjects: { name: string }[];
  hourly_rate: number;
  education_verified: boolean;
  rating: number | null;
  total_reviews: number;
}

export const MyTutorsTab = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchTutors();
    }
  }, [user?.id]);

  const fetchTutors = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('student_tutor_relationships')
        .select(`
          tutor_id,
          tutor:profiles!tutor_id (
            id,
            first_name,
            last_name,
            avatar_url,
            city,
            education_verified,
            tutor_subjects (
              subjects (
                name
              )
            )
          )
        `)
        .eq('student_id', user?.id)
        .eq('status', 'accepted');

      if (error) throw error;

      const formattedTutors = data?.map(item => {
        const tutorData = Array.isArray(item.tutor) ? item.tutor[0] : item.tutor;
        
        // Extract subjects - handle nested structure properly
        const tutorSubjects = tutorData?.tutor_subjects || [];
        const subjects = tutorSubjects.map(ts => {
          const subjectData = Array.isArray(ts.subjects) ? ts.subjects[0] : ts.subjects;
          return { name: subjectData?.name || '' };
        }).filter(s => s.name);

        return {
          id: tutorData?.id,
          first_name: tutorData?.first_name || '',
          last_name: tutorData?.last_name || null,
          avatar_url: tutorData?.avatar_url || null,
          city: tutorData?.city || null,
          subjects: subjects,
          hourly_rate: 500, // TODO: Replace with actual hourly rate
          education_verified: tutorData?.education_verified || false,
          rating: 4.5, // TODO: Replace with actual rating
          total_reviews: 50 // TODO: Replace with actual review count
        };
      }) || [];

      setTutors(formattedTutors);
    } catch (error) {
      console.error('Error fetching tutors:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список репетиторов",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatWithTutor = (tutorId: string) => {
    navigate(`/profile/student/chats/${tutorId}`);
  };

  const handleScheduleLesson = (tutorId: string) => {
    navigate(`/profile/student/schedule?tutorId=${tutorId}`);
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
        <div>
          <h2 className="text-2xl font-bold">Мои репетиторы</h2>
          <p className="text-muted-foreground">
            Репетиторы, с которыми вы занимаетесь
          </p>
        </div>
        <Badge variant="secondary">
          {tutors.length} репетиторов
        </Badge>
      </div>

      {tutors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">У вас пока нет репетиторов</h3>
            <p className="text-gray-500 mb-4">
              Найдите подходящего репетитора и начните заниматься уже сегодня
            </p>
            <Button onClick={() => navigate('/tutors')} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Найти репетитора
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={tutor.avatar_url || undefined} />
                    <AvatarFallback>
                      {tutor.first_name?.[0]}{tutor.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {tutor.first_name} {tutor.last_name}
                    </h3>
                    {tutor.city && (
                      <p className="text-sm text-muted-foreground">{tutor.city}</p>
                    )}
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" />
                      <span>{tutor.rating || 'Нет оценок'} ({tutor.total_reviews} отзывов)</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {tutor.subjects.map(subject => subject.name).join(', ') || 'Предметы не указаны'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span>{tutor.hourly_rate} ₽/час</span>
                  </div>
                  
                  {tutor.education_verified ? (
                    <div className="flex items-center space-x-2 text-sm text-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <span>Образование подтверждено</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-sm text-orange-500">
                      <AlertCircle className="h-4 w-4" />
                      <span>Образование не подтверждено</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardContent className="pt-0">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleChatWithTutor(tutor.id)}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Чат
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleLesson(tutor.id)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Расписание
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
