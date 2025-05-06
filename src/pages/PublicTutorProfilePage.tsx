
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader } from "@/components/ui/loader";
import { AlertCircle, BookOpen, Calendar, Clock, MapPin, MessageSquare, Star, User } from "lucide-react";
import { fetchPublicTutorById, PublicTutorProfile } from "@/services/publicTutorService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const PublicTutorProfilePage = () => {
  const [tutor, setTutor] = useState<PublicTutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <Loader size="lg" />
          <span className="ml-4 text-gray-600">Загрузка профиля...</span>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!tutor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Репетитор не найден</h2>
            <p className="text-gray-600 mb-6">Запрашиваемый профиль не существует или был удален</p>
            <Button onClick={() => navigate("/tutors")}>Вернуться к списку репетиторов</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  const fullName = `${tutor.first_name} ${tutor.last_name || ''}`.trim();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Profile header */}
          <Card className="mb-8 border-none shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="md:w-1/4 flex flex-col items-center">
                  <div className="w-40 h-40 rounded-full border-2 border-primary overflow-hidden bg-gray-100">
                    {tutor.avatar_url ? (
                      <img 
                        src={tutor.avatar_url} 
                        alt={fullName} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-full h-full p-8 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Rating */}
                  <div className="mt-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-medium text-lg">
                      {tutor.rating ? tutor.rating.toFixed(1) : 'Нет отзывов'}
                    </span>
                  </div>
                  
                  {/* Contact button */}
                  <Button 
                    onClick={handleContactTutor}
                    className="mt-4 w-full"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Связаться
                  </Button>
                </div>
                
                {/* Profile info */}
                <div className="md:w-3/4">
                  <div className="mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold">{fullName}</h1>
                    {tutor.city && (
                      <div className="flex items-center text-gray-600 mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {tutor.city}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Преподает предметы:</h2>
                    <div className="flex flex-wrap gap-2">
                      {tutor.subjects.map((subject) => (
                        <Badge key={subject.id} variant="outline" className="bg-gray-100">
                          {subject.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Key info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {tutor.experience !== null && (
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm text-gray-500">Опыт</div>
                          <div>{tutor.experience} лет</div>
                        </div>
                      </div>
                    )}
                    
                    {tutor.subjects.length > 0 && (
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm text-gray-500">Стоимость</div>
                          <div>от {Math.min(...tutor.subjects.map(s => s.hourly_rate))} ₽/час</div>
                        </div>
                      </div>
                    )}
                    
                    {tutor.education_institution && (
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm text-gray-500">Образование</div>
                          <div>{tutor.education_institution}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {tutor.bio && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">О себе:</h2>
                      <p className="text-gray-700">{tutor.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tab content */}
          <Card className="border-none shadow">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full border-b rounded-none px-6">
                  <TabsTrigger value="about">Подробная информация</TabsTrigger>
                  <TabsTrigger value="subjects">Предметы и цены</TabsTrigger>
                  <TabsTrigger value="schedule">Расписание</TabsTrigger>
                </TabsList>
                
                <div className="p-6">
                  {/* About tab */}
                  <TabsContent value="about" className="space-y-6">
                    {tutor.methodology && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Методология преподавания</h3>
                        <p className="text-gray-700">{tutor.methodology}</p>
                      </div>
                    )}
                    
                    {tutor.education_institution && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Образование</h3>
                        <p className="text-gray-700">
                          {tutor.education_institution}
                          {tutor.degree ? `, ${tutor.degree}` : ''}
                          {tutor.graduation_year ? ` (${tutor.graduation_year})` : ''}
                        </p>
                      </div>
                    )}
                    
                    {tutor.achievements && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Достижения</h3>
                        <p className="text-gray-700">{tutor.achievements}</p>
                      </div>
                    )}
                    
                    {(!tutor.methodology && !tutor.education_institution && !tutor.achievements) && (
                      <div className="text-center py-8 text-gray-500">
                        Нет дополнительной информации
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Subjects tab */}
                  <TabsContent value="subjects">
                    {tutor.subjects.length > 0 ? (
                      <div className="space-y-4">
                        {tutor.subjects.map((subject) => (
                          <Card key={subject.id} className="border shadow-sm">
                            <CardHeader className="pb-2">
                              <CardTitle>{subject.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between mb-2">
                                <span>Стоимость:</span>
                                <span className="font-medium">{subject.hourly_rate} ₽/час</span>
                              </div>
                              {subject.experience_years && (
                                <div className="flex justify-between mb-2">
                                  <span>Опыт преподавания:</span>
                                  <span>{subject.experience_years} лет</span>
                                </div>
                              )}
                              {subject.description && (
                                <div className="mt-2">
                                  <h4 className="font-medium mb-1">Описание:</h4>
                                  <p className="text-gray-700 text-sm">{subject.description}</p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Нет информации о предметах
                      </div>
                    )}
                  </TabsContent>
                  
                  {/* Schedule tab */}
                  <TabsContent value="schedule">
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">Расписание недоступно</h3>
                      <p className="text-gray-500">
                        Для просмотра доступного расписания, пожалуйста, свяжитесь с репетитором
                      </p>
                      <Button 
                        onClick={handleContactTutor}
                        className="mt-4"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Связаться с репетитором
                      </Button>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicTutorProfilePage;
