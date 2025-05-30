
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/ui/loader";
import { AlertCircle, Calendar, MessageCircle, Star, BookOpen, CheckCircle, GraduationCap, MapPin, Award, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrialLessonBooking } from "@/components/profile/student/booking/TrialLessonBooking";
import { RegularLessonBooking } from "@/components/profile/student/booking/RegularLessonBooking";
import { fetchPublicTutorById } from "@/services/public/tutorProfileService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const PublicTutorProfilePage = () => {
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trialBookingOpen, setTrialBookingOpen] = useState(false);
  const [regularBookingOpen, setRegularBookingOpen] = useState(false);
  const [hasRelationship, setHasRelationship] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "book") {
      if (hasRelationship) {
        setRegularBookingOpen(true);
      } else {
        setTrialBookingOpen(true);
      }
    }
  }, [searchParams, hasRelationship]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch tutor data
        const tutorData = await fetchPublicTutorById(id);
        
        if (tutorData) {
          setTutor(tutorData);
          
          // Check relationship status if user is logged in
          if (user?.id) {
            const { data: relationship } = await supabase
              .from('student_tutor_relationships')
              .select('status')
              .eq('student_id', user.id)
              .eq('tutor_id', id)
              .eq('status', 'active')
              .maybeSingle();
              
            setHasRelationship(!!relationship);
          }
        } else {
          toast({
            title: "Ошибка загрузки",
            description: "Не удалось загрузить профиль репетитора",
            variant: "destructive",
          });
          navigate("/tutors");
        }
      } catch (error) {
        console.error("Error fetching tutor:", error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить профиль репетитора",
          variant: "destructive",
        });
        navigate("/tutors");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate, toast, user?.id]);
  
  const handleContactTutor = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы связаться с репетитором",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    navigate(`/profile/student/chats/${id}`);
  };

  const handleTrialBooking = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы забронировать занятие",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setTrialBookingOpen(true);
  };

  const handleRegularBooking = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы забронировать занятие",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    if (!hasRelationship) {
      toast({
        title: "Сначала свяжитесь с репетитором",
        description: "Для бронирования обычных занятий необходимо сначала договориться с репетитором через чат",
        variant: "destructive"
      });
      return;
    }

    setRegularBookingOpen(true);
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (!tutor) {
    return <NotFoundState onBack={() => navigate("/tutors")} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left - Avatar and Basic Info */}
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={tutor.avatar_url} alt={tutor.first_name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {tutor.first_name?.charAt(0) || ""}
                    {tutor.last_name?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                
                {tutor.isVerified && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-3">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Проверенный репетитор
                  </Badge>
                )}
              </div>
              
              {/* Center - Main Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {tutor.first_name} {tutor.last_name}
                </h1>
                
                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  {tutor.city && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{tutor.city}</span>
                    </div>
                  )}
                  {tutor.experience && (
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>Опыт: {tutor.experience} {pluralizeYears(tutor.experience)}</span>
                    </div>
                  )}
                  {tutor.rating && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      <span>{tutor.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                {tutor.education_institution && (
                  <div className="flex items-center mb-4">
                    <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-700">{tutor.education_institution}</span>
                    {tutor.degree && <span className="text-gray-500 ml-2">• {tutor.degree}</span>}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {tutor.subjects?.slice(0, 4).map((subject: any) => (
                    <Badge key={subject.id} variant="secondary" className="text-sm">
                      {subject.name} • {subject.hourlyRate} ₽/час
                    </Badge>
                  ))}
                  {tutor.subjects?.length > 4 && (
                    <Badge variant="outline" className="text-sm">
                      +{tutor.subjects.length - 4} еще
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Right - Action Buttons */}
              <div className="flex flex-col gap-3 lg:w-80">
                <Card className="p-4">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-green-600">
                      от {Math.min(...(tutor.subjects?.map((s: any) => s.hourlyRate) || [0]))} ₽
                    </div>
                    <div className="text-sm text-gray-500">за час</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button onClick={handleTrialBooking} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                      <Calendar className="mr-2 h-4 w-4" /> Пробное занятие
                    </Button>
                    
                    {hasRelationship && (
                      <Button onClick={handleRegularBooking} variant="outline" className="w-full">
                        <Calendar className="mr-2 h-4 w-4" /> Обычное занятие
                      </Button>
                    )}
                    
                    <Button variant="outline" onClick={handleContactTutor} className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" /> Написать сообщение
                    </Button>
                  </div>
                </Card>
                
                {!hasRelationship && (
                  <div className="text-xs text-gray-500 text-center">
                    Для бронирования обычных занятий сначала свяжитесь с репетитором
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Tabs */}
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">О репетиторе</TabsTrigger>
              <TabsTrigger value="subjects">Предметы и цены</TabsTrigger>
              <TabsTrigger value="reviews">Отзывы</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Обо мне</h2>
                      {tutor.bio ? (
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{tutor.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">Репетитор не добавил информацию о себе</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  {tutor.methodology && (
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4">Методика преподавания</h2>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{tutor.methodology}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {tutor.achievements && (
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          Достижения
                        </h2>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{tutor.achievements}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {tutor.video_url && (
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <Play className="h-5 w-5 mr-2" />
                          Видеопрезентация
                        </h2>
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <a 
                            href={tutor.video_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Смотреть видео
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Образование</h2>
                      {tutor.education_institution ? (
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-medium text-gray-900">Учебное заведение</h3>
                            <p className="text-gray-700">{tutor.education_institution}</p>
                          </div>
                          {tutor.degree && (
                            <div>
                              <h3 className="font-medium text-gray-900">Степень/Специальность</h3>
                              <p className="text-gray-700">{tutor.degree}</p>
                            </div>
                          )}
                          {tutor.graduation_year && (
                            <div>
                              <h3 className="font-medium text-gray-900">Год окончания</h3>
                              <p className="text-gray-700">{tutor.graduation_year}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">Информация об образовании не указана</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Опыт работы</h2>
                      {tutor.experience ? (
                        <p className="text-gray-700">
                          Опыт преподавания: {tutor.experience} {pluralizeYears(tutor.experience)}
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">Информация об опыте не указана</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="subjects">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-6">Предметы и стоимость</h2>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tutor.subjects && tutor.subjects.length > 0 ? (
                      tutor.subjects.map((subject: any) => (
                        <Card key={subject.id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <h3 className="font-medium text-lg mb-2">{subject.name}</h3>
                            <div className="text-2xl font-bold text-green-600 mb-3">
                              {subject.hourlyRate} ₽/час
                            </div>
                            <Button 
                              size="sm" 
                              onClick={handleTrialBooking}
                              className="w-full"
                            >
                              Пробное занятие
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-8">
                        <p className="text-gray-500 italic">Репетитор не указал предметы</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-6">Отзывы</h2>
                  
                  <div className="py-12 text-center">
                    <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-4">У этого репетитора пока нет отзывов</p>
                    {user && hasRelationship && (
                      <Button variant="outline">
                        Оставить отзыв
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      
      {/* Booking Modals */}
      <TrialLessonBooking
        isOpen={trialBookingOpen}
        onClose={() => setTrialBookingOpen(false)}
        tutor={{
          id: tutor.id,
          first_name: tutor.first_name,
          last_name: tutor.last_name,
          avatar_url: tutor.avatar_url
        }}
      />
      
      {hasRelationship && (
        <RegularLessonBooking
          isOpen={regularBookingOpen}
          onClose={() => setRegularBookingOpen(false)}
          tutor={{
            id: tutor.id,
            first_name: tutor.first_name,
            last_name: tutor.last_name,
            avatar_url: tutor.avatar_url
          }}
        />
      )}
    </div>
  );
};

// Helper function to pluralize years in Russian
const pluralizeYears = (years: number): string => {
  if (years % 10 === 1 && years % 100 !== 11) {
    return "год";
  } else if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) {
    return "года";
  } else {
    return "лет";
  }
};

const LoadingState = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow flex justify-center items-center">
      <div className="text-center">
        <Loader size="lg" className="mb-4" />
        <span className="text-gray-600">Загрузка профиля...</span>
      </div>
    </main>
    <Footer />
  </div>
);

const NotFoundState = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow flex justify-center items-center">
      <div className="text-center">
        <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Репетитор не найден</h2>
        <p className="text-gray-600 mb-6">Запрашиваемый профиль не существует или был удален</p>
        <Button onClick={onBack}>Вернуться к списку репетиторов</Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default PublicTutorProfilePage;
