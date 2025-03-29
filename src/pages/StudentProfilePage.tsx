
import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  first_name: string;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  role: string;
}

const StudentProfilePage = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          toast({
            title: "Требуется авторизация",
            description: "Пожалуйста, войдите в систему для продолжения.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        // Check if user role is student
        if (profileData.role !== "student") {
          toast({
            title: "Доступ запрещен",
            description: "Эта страница доступна только для студентов.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        setProfile(profileData as Profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при загрузке профиля.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">Загрузка...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with user info */}
            <div className="col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4">
                    {profile?.avatar_url && (
                      <img 
                        src={profile.avatar_url} 
                        alt={`${profile.first_name} ${profile.last_name || ''}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {profile?.first_name} {profile?.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate("/choose-subject")}>
                    Изменить предметы
                  </Button>
                  <Button variant="outline" className="w-full">
                    Редактировать профиль
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Main content */}
            <div className="col-span-1 lg:col-span-3">
              <Tabs defaultValue="schedule">
                <TabsList className="mb-6">
                  <TabsTrigger value="schedule">Расписание</TabsTrigger>
                  <TabsTrigger value="chats">Чаты</TabsTrigger>
                  <TabsTrigger value="homework">Домашние задания</TabsTrigger>
                  <TabsTrigger value="tutors">Мои репетиторы</TabsTrigger>
                </TabsList>
                
                <TabsContent value="schedule">
                  <Card>
                    <CardHeader>
                      <CardTitle>Расписание занятий</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        У вас пока нет запланированных занятий.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="chats">
                  <Card>
                    <CardHeader>
                      <CardTitle>Чаты с репетиторами</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        У вас пока нет активных чатов с репетиторами.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="homework">
                  <Card>
                    <CardHeader>
                      <CardTitle>Домашние задания</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        У вас пока нет домашних заданий.
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="tutors">
                  <Card>
                    <CardHeader>
                      <CardTitle>Мои репетиторы</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-gray-500">
                        У вас пока нет репетиторов.
                      </div>
                      <div className="text-center mt-4">
                        <Button onClick={() => navigate("/tutors")}>Найти репетитора</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentProfilePage;
