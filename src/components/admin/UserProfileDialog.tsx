
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Star,
  GraduationCap,
  Clock,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  phone?: string;
  role: string;
  created_at: string;
  is_blocked: boolean;
}

interface StudentProfile {
  educational_level?: string;
  subjects: string[];
  learning_goals?: string;
  preferred_format: string[];
  school?: string;
  grade?: string;
  budget?: number;
}

interface TutorProfile {
  education_institution?: string;
  degree?: string;
  graduation_year?: number;
  experience?: number;
  methodology?: string;
  achievements?: string;
  video_url?: string;
  is_published: boolean;
  education_verified: boolean;
}

interface UserProfileDialogProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [stats, setStats] = useState({
    lessonsCount: 0,
    messagesCount: 0,
    averageRating: 0,
    reviewsCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserProfile();
    }
  }, [userId, isOpen]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      // Основной профиль
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Профиль студента
      if (profileData.role === 'student') {
        const { data: studentData } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        setStudentProfile(studentData);
      }

      // Профиль репетитора
      if (profileData.role === 'tutor') {
        const { data: tutorData } = await supabase
          .from('tutor_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        setTutorProfile(tutorData);

        // Статистика для репетитора
        const [lessonsRes, reviewsRes] = await Promise.all([
          supabase
            .from('lessons')
            .select('id')
            .eq('tutor_id', userId),
          supabase
            .from('tutor_reviews')
            .select('rating')
            .eq('tutor_id', userId)
        ]);

        const lessonsCount = lessonsRes.data?.length || 0;
        const reviews = reviewsRes.data || [];
        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        setStats(prev => ({
          ...prev,
          lessonsCount,
          reviewsCount: reviews.length,
          averageRating
        }));
      }

      // Статистика сообщений
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      setStats(prev => ({
        ...prev,
        messagesCount: messagesData?.length || 0
      }));

    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить профиль пользователя",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'tutor':
        return <Badge className="bg-blue-100 text-blue-800">Репетитор</Badge>;
      case 'student':
        return <Badge className="bg-green-100 text-green-800">Ученик</Badge>;
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Администратор</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (!profile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Загрузка профиля...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Профиль пользователя</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Основная информация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {profile.first_name} {profile.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(profile.role)}
                      {profile.is_blocked && (
                        <Badge variant="destructive">Заблокирован</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>ID: {profile.id}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{profile.city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>
                        Регистрация: {format(new Date(profile.created_at), 'dd MMM yyyy', { locale: ru })}
                      </span>
                    </div>
                  </div>

                  {profile.bio && (
                    <div>
                      <h4 className="font-medium mb-1">О себе:</h4>
                      <p className="text-sm text-gray-600">{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статистика */}
          <Card>
            <CardHeader>
              <CardTitle>Статистика активности</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.lessonsCount}</div>
                  <div className="text-sm text-gray-500">Занятий</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.messagesCount}</div>
                  <div className="text-sm text-gray-500">Сообщений</div>
                </div>
                {profile.role === 'tutor' && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Рейтинг</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.reviewsCount}</div>
                      <div className="text-sm text-gray-500">Отзывов</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Специфичная информация для студента */}
          {studentProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Информация об обучении
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentProfile.educational_level && (
                    <div>
                      <h4 className="font-medium">Уровень образования:</h4>
                      <p className="text-sm text-gray-600">{studentProfile.educational_level}</p>
                    </div>
                  )}
                  {studentProfile.school && (
                    <div>
                      <h4 className="font-medium">Учебное заведение:</h4>
                      <p className="text-sm text-gray-600">{studentProfile.school}</p>
                    </div>
                  )}
                  {studentProfile.grade && (
                    <div>
                      <h4 className="font-medium">Класс/Курс:</h4>
                      <p className="text-sm text-gray-600">{studentProfile.grade}</p>
                    </div>
                  )}
                  {studentProfile.budget && (
                    <div>
                      <h4 className="font-medium">Бюджет:</h4>
                      <p className="text-sm text-gray-600">{studentProfile.budget} ₽/час</p>
                    </div>
                  )}
                </div>

                {studentProfile.subjects && studentProfile.subjects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Изучаемые предметы:</h4>
                    <div className="flex flex-wrap gap-2">
                      {studentProfile.subjects.map((subject, index) => (
                        <Badge key={index} variant="outline">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {studentProfile.learning_goals && (
                  <div>
                    <h4 className="font-medium">Цели обучения:</h4>
                    <p className="text-sm text-gray-600">{studentProfile.learning_goals}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Специфичная информация для репетитора */}
          {tutorProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Информация о преподавании
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tutorProfile.education_institution && (
                    <div>
                      <h4 className="font-medium">Учебное заведение:</h4>
                      <p className="text-sm text-gray-600">{tutorProfile.education_institution}</p>
                    </div>
                  )}
                  {tutorProfile.degree && (
                    <div>
                      <h4 className="font-medium">Степень:</h4>
                      <p className="text-sm text-gray-600">{tutorProfile.degree}</p>
                    </div>
                  )}
                  {tutorProfile.graduation_year && (
                    <div>
                      <h4 className="font-medium">Год окончания:</h4>
                      <p className="text-sm text-gray-600">{tutorProfile.graduation_year}</p>
                    </div>
                  )}
                  {tutorProfile.experience !== undefined && (
                    <div>
                      <h4 className="font-medium">Опыт преподавания:</h4>
                      <p className="text-sm text-gray-600">{tutorProfile.experience} лет</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Badge 
                    variant={tutorProfile.is_published ? "default" : "secondary"}
                  >
                    {tutorProfile.is_published ? "Опубликован" : "Не опубликован"}
                  </Badge>
                  <Badge 
                    variant={tutorProfile.education_verified ? "default" : "outline"}
                    className={tutorProfile.education_verified ? "bg-green-100 text-green-800" : ""}
                  >
                    {tutorProfile.education_verified ? "Образование подтверждено" : "Образование не подтверждено"}
                  </Badge>
                </div>

                {tutorProfile.methodology && (
                  <div>
                    <h4 className="font-medium">Методика преподавания:</h4>
                    <p className="text-sm text-gray-600">{tutorProfile.methodology}</p>
                  </div>
                )}

                {tutorProfile.achievements && (
                  <div>
                    <h4 className="font-medium">Достижения:</h4>
                    <p className="text-sm text-gray-600">{tutorProfile.achievements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
