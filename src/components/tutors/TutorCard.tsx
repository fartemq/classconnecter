
import { Heart, MessageSquare, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { PublicTutorProfile } from "@/services/publicTutorService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TutorScheduleView } from "@/components/profile/student/schedule/TutorScheduleView";
import { supabase } from "@/integrations/supabase/client";

interface TutorCardProps {
  tutor: PublicTutorProfile;
}

export function TutorCard({ tutor }: TutorCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  // Get lowest hourly rate from all subjects
  const lowestRate = tutor.subjects.length > 0
    ? Math.min(...tutor.subjects.map(s => s.hourly_rate))
    : 0;

  // Format full name
  const fullName = `${tutor.first_name} ${tutor.last_name || ""}`.trim();
  
  // Format the rating
  const rating = tutor.rating ? tutor.rating.toFixed(1) : "N/A";
  
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему, чтобы добавить репетитора в избранное",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // В будущей реализации здесь будет код для сохранения в избранное
      setIsFavorite(!isFavorite);
      
      toast({
        title: isFavorite ? "Удалено из избранного" : "Добавлено в избранное",
        description: isFavorite ? 
          `Репетитор ${fullName} удален из избранного` : 
          `Репетитор ${fullName} добавлен в избранное`,
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить статус избранного",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему, чтобы связаться с репетитором",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    // Проверяем, является ли пользователь студентом
    if (userRole !== 'student') {
      toast({
        title: "Доступ запрещен",
        description: "Только студенты могут связываться с репетиторами",
        variant: "destructive"
      });
      return;
    }
    
    navigate(`/profile/student/chats/${tutor.id}`);
  };

  const handleBookLesson = () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему, чтобы забронировать занятие",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    // Проверяем, является ли пользователь студентом
    if (userRole !== 'student') {
      toast({
        title: "Доступ запрещен",
        description: "Только студенты могут бронировать занятия",
        variant: "destructive"
      });
      return;
    }
    
    // Проверяем, является ли пользователь учеником данного репетитора
    checkTutorStudent(tutor.id).then((isStudent) => {
      if (isStudent) {
        setScheduleOpen(true);
      } else {
        toast({
          title: "Доступ запрещен",
          description: "Сначала нужно стать учеником этого репетитора",
          variant: "destructive"
        });
        
        // Предложить отправить запрос
        // В будущей реализации можно добавить автоматическое создание запроса
      }
    });
  };
  
  // Проверка, является ли пользователь учеником данного репетитора
  const checkTutorStudent = async (tutorId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('student_requests')
        .select('status')
        .eq('student_id', user.id)
        .eq('tutor_id', tutorId)
        .eq('status', 'accepted')
        .maybeSingle();
        
      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error('Error checking tutor-student relationship:', err);
      return false;
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Avatar */}
            <div className="md:w-1/3 p-4 flex justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {tutor.avatar_url ? (
                  <img 
                    src={tutor.avatar_url} 
                    alt={fullName}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-3xl text-gray-400">{tutor.first_name[0]}</span>
                )}
              </div>
            </div>
            
            {/* Information */}
            <div className="md:w-2/3 p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{fullName}</h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span>{rating}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mt-1">
                {tutor.city && <span>{tutor.city}</span>}
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {tutor.subjects.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {subject.name}
                  </Badge>
                ))}
              </div>
              
              <div className="mt-3">
                <p className="text-sm line-clamp-2 text-gray-700">
                  {tutor.bio || "Нет информации о репетиторе"}
                </p>
              </div>
              
              <div className="mt-3 text-sm">
                <p className="font-medium">От {lowestRate} руб/час</p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleFavorite} 
            disabled={isLoading}
          >
            <Heart 
              className={`h-4 w-4 mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
            />
            {isFavorite ? 'В избранном' : 'В избранное'}
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBookLesson}
              disabled={isLoading}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Записаться
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleContact}
              disabled={isLoading}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Связаться
            </Button>
            
            <Button 
              size="sm" 
              onClick={() => navigate(`/tutors/${tutor.id}`)}
              disabled={isLoading}
            >
              Подробнее
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Tutor Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Расписание репетитора: {fullName}</DialogTitle>
          </DialogHeader>
          <TutorScheduleView tutorId={tutor.id} onClose={() => setScheduleOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
