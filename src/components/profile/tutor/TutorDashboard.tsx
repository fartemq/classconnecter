import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Users, 
  Star, 
  FileText, 
  MessageSquare 
} from "lucide-react";
import { Profile } from "@/hooks/useProfile";
import { useTutorPublishStatus } from "@/hooks/useTutorPublishStatus";
import { useNavigate } from "react-router-dom";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Lesson } from "@/types/lesson";
import { ensureObject } from "@/utils/supabaseUtils";

interface TutorDashboardProps {
  profile: Profile;
}

export const TutorDashboard = ({ profile }: TutorDashboardProps) => {
  const { isPublished, isLoading, togglePublishStatus } = useTutorPublishStatus();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [stats, setStats] = useState({
    activeStudents: 0,
    completedLessons: 0,
    averageRating: 0,
    reviewCount: 0
  });
  
  const handleNavigateToSchedule = () => {
    navigate("/profile/tutor?tab=schedule");
  };
  
  const handleNavigateToProfile = () => {
    navigate("/profile/tutor?tab=profile");
  };

  useEffect(() => {
    const fetchTodayLessons = async () => {
      try {
        setLoadingLessons(true);
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('lessons')
          .select(`
            id,
            tutor_id,
            student_id,
            subject_id,
            date,
            time,
            duration,
            status,
            created_at,
            updated_at,
            student:profiles!student_id (id, first_name, last_name, avatar_url),
            subject:subjects (id, name)
          `)
          .eq('tutor_id', profile.id)
          .eq('date', today)
          .order('time', { ascending: true });
          
        if (error) throw error;
        
        // Properly cast and transform the data
        const transformedLessons: Lesson[] = (data || []).map(item => {
          const student = item.student ? ensureObject(item.student) : undefined;
          const subject = item.subject ? ensureObject(item.subject) : undefined;
          
          return {
            id: item.id,
            tutor_id: item.tutor_id,
            student_id: item.student_id,
            subject_id: item.subject_id,
            date: item.date,
            time: item.time,
            duration: item.duration,
            status: item.status,
            created_at: item.created_at,
            updated_at: item.updated_at,
            student: student ? {
              id: student.id,
              first_name: student.first_name,
              last_name: student.last_name,
              avatar_url: student.avatar_url
            } : undefined,
            subject: subject ? {
              id: subject.id,
              name: subject.name
            } : undefined
          };
        });
        
        setLessons(transformedLessons);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoadingLessons(false);
      }
    };
    
    const fetchStatistics = async () => {
      try {
        // Count active students (students with active requests)
        const { count: activeStudentsCount, error: studentsError } = await supabase
          .from('student_requests')
          .select('student_id', { count: 'exact', head: true })
          .eq('tutor_id', profile.id)
          .eq('status', 'accepted');
          
        if (studentsError) throw studentsError;
        
        // Count completed lessons
        const { count: completedLessonsCount, error: lessonsError } = await supabase
          .from('lessons')
          .select('id', { count: 'exact', head: true })
          .eq('tutor_id', profile.id)
          .eq('status', 'completed');
          
        if (lessonsError) throw lessonsError;
        
        // Get average rating
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('tutor_reviews')
          .select('rating')
          .eq('tutor_id', profile.id);
          
        if (ratingsError) throw ratingsError;
        
        let averageRating = 0;
        let reviewCount = 0;
        
        if (ratingsData && ratingsData.length > 0) {
          reviewCount = ratingsData.length;
          averageRating = ratingsData.reduce((sum, item) => sum + item.rating, 0) / reviewCount;
        }
        
        setStats({
          activeStudents: activeStudentsCount || 0,
          completedLessons: completedLessonsCount || 0,
          averageRating: averageRating,
          reviewCount: reviewCount
        });
        
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchTodayLessons();
    fetchStatistics();
  }, [profile.id]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Profile card */}
        <Card className="w-full md:w-1/3">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 mb-4">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={`${profile.first_name} ${profile.last_name}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    <Users className="h-12 w-12" />
                  </div>
                )}
              </div>
              <h2 className="text-xl font-bold">
                {profile.first_name} {profile.last_name}
              </h2>
              {profile.city && (
                <p className="text-gray-500 text-sm mt-1">{profile.city}</p>
              )}
              
              <div className="mt-4">
                <Button 
                  onClick={handleNavigateToProfile} 
                  variant="outline"
                  size="sm"
                  className="mr-2"
                >
                  Редактировать профиль
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Статус публикации профиля */}
        <Card className={`w-full md:w-2/3 ${isPublished ? "bg-green-50" : "bg-amber-50"}`}>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <Loader size="lg" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                  {isPublished ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <AlertCircle className="h-8 w-8 text-amber-500" />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {isPublished 
                        ? "Ваш профиль опубликован" 
                        : "Ваш профиль не опубликован"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {isPublished 
                        ? "Студенты могут найти вас в поиске и записаться на занятия" 
                        : "Опубликуйте профиль, чтобы начать принимать студентов"}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!isPublished && (
                    <Button onClick={handleNavigateToSchedule} variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Настроить расписание
                    </Button>
                  )}
                  <Button 
                    onClick={togglePublishStatus} 
                    variant={isPublished ? "destructive" : "default"}
                  >
                    {isPublished ? "Снять с публикации" : "Опубликовать профиль"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Основная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Активные ученики</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{stats.activeStudents}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Предстоящие занятия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-purple-500 mr-2" />
              <span className="text-2xl font-bold">{lessons.length}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Проведено занятий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{stats.completedLessons}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Средний рейтинг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "-"}
              </span>
              {stats.reviewCount > 0 && (
                <span className="text-sm text-gray-400 ml-2">({stats.reviewCount})</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Занятия на сегодня */}
      <Card>
        <CardHeader>
          <CardTitle>Занятия на сегодня</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingLessons ? (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          ) : lessons.length > 0 ? (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{lesson.subject?.name || 'Без темы'}</h3>
                    <p className="text-sm text-gray-500">
                      {lesson.time.substring(0, 5)} ({lesson.duration} мин)
                    </p>
                    {lesson.student && (
                      <p className="text-sm text-gray-600">
                        Студент: {lesson.student.first_name} {lesson.student.last_name || ''}
                      </p>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm">
                    Начать занятие
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              На сегодня у вас нет запланированных занятий
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Быстрые действия */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" onClick={() => navigate("/profile/tutor?tab=students")}>
            <Users className="h-4 w-4 mr-2" />
            Мои ученики
          </Button>
          <Button variant="outline" onClick={() => navigate("/profile/tutor?tab=materials")}>
            <FileText className="h-4 w-4 mr-2" />
            Учебные материалы
          </Button>
          <Button variant="outline" onClick={() => navigate("/profile/tutor?tab=chats")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Сообщения
          </Button>
          <Button variant="outline" onClick={() => navigate("/profile/tutor?tab=schedule")}>
            <Calendar className="h-4 w-4 mr-2" />
            Расписание занятий
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
