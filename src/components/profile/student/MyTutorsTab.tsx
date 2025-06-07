
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Calendar, Star, MapPin, User } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ensureSingleObject } from "@/utils/supabaseUtils";
import { LessonAccessButton } from "@/components/lesson/LessonAccessButton";
import { useRelationshipStatus } from "@/hooks/useRelationshipStatus";

interface TutorData {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  relationshipStart: string;
  subjects: string[];
  rating?: number;
  experience?: number;
}

export const MyTutorsTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<TutorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTutors();
    }
  }, [user?.id]);

  // Добавляем realtime подписку для автоматического обновления
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('tutor_relationships_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_tutor_relationships',
          filter: `student_id=eq.${user.id}`
        },
        () => {
          console.log('Tutor relationship updated, refreshing...');
          fetchTutors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchTutors = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('student_tutor_relationships')
        .select(`
          tutor_id,
          start_date,
          status,
          tutor:profiles!tutor_id (
            id,
            first_name,
            last_name,
            avatar_url,
            city,
            tutor_profiles (
              experience
            )
          )
        `)
        .eq('student_id', user?.id)
        .eq('status', 'accepted')
        .order('start_date', { ascending: false });

      if (error) throw error;

      // Получаем предметы для каждого репетитора
      const tutorsWithSubjects = await Promise.all(
        (data || []).map(async (item) => {
          const tutorData = ensureSingleObject(item.tutor);
          const tutorProfile = ensureSingleObject(tutorData?.tutor_profiles);

          // Получаем предметы репетитора
          const { data: subjectsData } = await supabase
            .from('tutor_subjects')
            .select(`
              subject:subjects(name)
            `)
            .eq('tutor_id', item.tutor_id)
            .eq('is_active', true);

          const subjects = subjectsData?.map(s => {
            const subject = ensureSingleObject(s.subject);
            return subject?.name;
          }).filter(Boolean) || [];

          return {
            id: item.tutor_id,
            name: `${tutorData?.first_name || ''} ${tutorData?.last_name || ''}`.trim(),
            avatar: tutorData?.avatar_url || undefined,
            city: tutorData?.city || undefined,
            relationshipStart: item.start_date,
            subjects,
            experience: tutorProfile?.experience || 0,
            rating: 5 // Placeholder
          };
        })
      );

      setTutors(tutorsWithSubjects.filter(tutor => tutor.name));
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatWithTutor = (tutorId: string) => {
    navigate(`/profile/student/chats/${tutorId}`);
  };

  const handleScheduleWithTutor = (tutorId: string) => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Мои репетиторы</h2>
        <Badge variant="outline" className="text-xs">
          {tutors.length} репетиторов
        </Badge>
      </div>

      {tutors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">У вас пока нет репетиторов</h3>
            <p className="text-gray-500 mb-4">
              Найдите репетиторов и отправьте им запросы на занятия
            </p>
            <Button onClick={() => navigate('/profile/student/tutors')}>
              Найти репетиторов
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              currentUserId={user?.id}
              onChatClick={handleChatWithTutor}
              onScheduleClick={handleScheduleWithTutor}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TutorCardProps {
  tutor: TutorData;
  currentUserId: string | undefined;
  onChatClick: (tutorId: string) => void;
  onScheduleClick: (tutorId: string) => void;
}

const TutorCard: React.FC<TutorCardProps> = ({
  tutor,
  currentUserId,
  onChatClick,
  onScheduleClick
}) => {
  const { hasRelationship, hasConfirmedLessons } = useRelationshipStatus(
    currentUserId,
    tutor.id,
    'student'
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={tutor.avatar} />
            <AvatarFallback>
              {tutor.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-base">{tutor.name}</CardTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {tutor.city && (
                <>
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{tutor.city}</span>
                </>
              )}
              {tutor.experience && (
                <span className="ml-2">• {tutor.experience} лет опыта</span>
              )}
            </div>
          </div>
          
          {tutor.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{tutor.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {tutor.subjects.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tutor.subjects.slice(0, 3).map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
              {tutor.subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tutor.subjects.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Занимаемся с {format(new Date(tutor.relationshipStart), 'd MMMM yyyy', { locale: ru })}
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChatClick(tutor.id)}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Чат
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScheduleClick(tutor.id)}
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Расписание
              </Button>
            </div>
            
            <LessonAccessButton
              tutorId={tutor.id}
              userRole="student"
              relationshipExists={hasRelationship}
              hasConfirmedLessons={hasConfirmedLessons}
              size="sm"
              variant="default"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
