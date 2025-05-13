
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/ui/loader";
import { AlertCircle, Calendar, MessageCircle, Star, BookOpen, CheckCircle, GraduationCap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TutorScheduleView } from "@/components/profile/student/schedule/TutorScheduleView";
import { fetchPublicTutorById } from "@/services/publicTutorService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const PublicTutorProfilePage = () => {
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTutorData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const tutorData = await fetchPublicTutorById(id);
        
        if (tutorData) {
          console.log("Loaded tutor data:", tutorData);
          setTutor(tutorData);
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorData();
  }, [id, navigate, toast]);
  
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

  const handleBookLesson = () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите в систему, чтобы забронировать занятие",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }

    setScheduleOpen(true);
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (!tutor) {
    return <NotFoundState onBack={() => navigate("/tutors")} />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                  {tutor.avatar_url ? (
                    <img src={tutor.avatar_url} alt={tutor.first_name} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-500 text-xl font-semibold">
                      {tutor.first_name?.charAt(0) || ""}
                      {tutor.last_name?.charAt(0) || ""}
                    </div>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {tutor.first_name} {tutor.last_name}
                    </h1>
                    {tutor.isVerified && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 ml-0 md:ml-2">
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Проверенный репетитор
                      </Badge>
                    )}
                  </div>
                  
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
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        <span>{tutor.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {tutor.education_institution && (
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        <span>{tutor.education_institution}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tutor.subjects?.map((subject: any) => (
                      <Badge key={subject.id} variant="secondary" className="text-sm">
                        {subject.name} - {subject.hourlyRate} ₽/час
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <Button onClick={handleBookLesson} className="w-full">
                    <Calendar className="mr-2 h-4 w-4" /> Забронировать занятие
                  </Button>
                  <Button variant="outline" onClick={handleContactTutor} className="w-full">
                    <MessageCircle className="mr-2 h-4 w-4" /> Связаться
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Tabs Content */}
          <Tabs defaultValue="about" className="mb-8">
            <TabsList className="mb-6">
              <TabsTrigger value="about" onClick={() => setActiveTab("about")}>О репетиторе</TabsTrigger>
              <TabsTrigger value="subjects" onClick={() => setActiveTab("subjects")}>Предметы</TabsTrigger>
              <TabsTrigger value="reviews" onClick={() => setActiveTab("reviews")}>Отзывы</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="pt-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <h2 className="text-xl font-semibold mb-4">Обо мне</h2>
                      {tutor.bio ? (
                        <p className="text-gray-700 whitespace-pre-line">{tutor.bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">Репетитор не добавил информацию о себе</p>
                      )}
                      
                      {tutor.methodology && (
                        <>
                          <h2 className="text-xl font-semibold mt-8 mb-4">Методика преподавания</h2>
                          <p className="text-gray-700 whitespace-pre-line">{tutor.methodology}</p>
                        </>
                      )}
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Образование</h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {tutor.education_institution ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-medium">Учебное заведение</h3>
                              <p>{tutor.education_institution}</p>
                            </div>
                            {tutor.degree && (
                              <div>
                                <h3 className="font-medium">Степень</h3>
                                <p>{tutor.degree}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">Информация об образовании не указана</p>
                        )}
                      </div>
                      
                      <h2 className="text-xl font-semibold mt-8 mb-4">Опыт работы</h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {tutor.experience ? (
                          <p>
                            Опыт преподавания: {tutor.experience} {pluralizeYears(tutor.experience)}
                          </p>
                        ) : (
                          <p className="text-gray-500 italic">Информация об опыте не указана</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="subjects">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-6">Предметы и стоимость</h2>
                  
                  <div className="space-y-4">
                    {tutor.subjects && tutor.subjects.length > 0 ? (
                      tutor.subjects.map((subject: any) => (
                        <div key={subject.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h3 className="font-medium text-lg">{subject.name}</h3>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{subject.hourlyRate} ₽/час</p>
                            <Button 
                              size="sm" 
                              onClick={handleBookLesson}
                              className="mt-2"
                            >
                              Забронировать
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">Репетитор не указал предметы</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-6">Отзывы</h2>
                  
                  <div className="py-6 text-center">
                    <p className="text-gray-500">У этого репетитора пока нет отзывов</p>
                    {user && (
                      <Button variant="outline" className="mt-4">
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
      
      {/* Tutor Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Расписание репетитора: {`${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() || 'Репетитор'}
            </DialogTitle>
          </DialogHeader>
          {id && (
            <TutorScheduleView tutorId={id} onClose={() => setScheduleOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
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
      <Loader size="lg" />
      <span className="ml-4 text-gray-600">Загрузка профиля...</span>
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
