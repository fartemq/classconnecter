
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TutorCompleteForm } from "@/components/profile/tutor/TutorCompleteForm";
import { TutorFormValues } from "@/types/tutor";
import { fetchSubjectsAndCategories, saveTutorProfile, saveTutorSubjects } from "@/services/tutorService";

const TutorCompletePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [initialValues, setInitialValues] = useState<Partial<TutorFormValues>>({});

  // Check if user is authenticated and get current user
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          toast({
            title: "Требуется авторизация",
            description: "Пожалуйста, войдите в систему для продолжения.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // Check if user is a tutor
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw new Error("Ошибка при загрузке профиля");
        }
        
        if (profileData.role !== "tutor") {
          toast({
            title: "Доступ запрещен",
            description: "Эта страница доступна только для репетиторов.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        setUser(session.user);
        
        // Populate form with existing data if available
        if (profileData) {
          setInitialValues({
            firstName: profileData.first_name || "",
            lastName: profileData.last_name || "",
            bio: profileData.bio || "",
            city: profileData.city || "",
            avatarUrl: profileData.avatar_url,
          });
        }
      } catch (error) {
        console.error("Auth error:", error);
        toast({
          title: "Ошибка",
          description: error instanceof Error ? error.message : "Произошла ошибка при проверке аутентификации",
          variant: "destructive",
        });
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch subjects and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { subjects, categories } = await fetchSubjectsAndCategories();
        setSubjects(subjects);
        setCategories(categories);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при загрузке данных",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (values: TutorFormValues, avatarFile: File | null) => {
    if (!user) {
      toast({
        title: "Ошибка",
        description: "Пользователь не авторизован",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save profile data
      const { avatarUrl } = await saveTutorProfile(values, user.id, avatarFile, initialValues.avatarUrl || null);
      
      // Save subjects
      await saveTutorSubjects(user.id, values.subjects, values.hourlyRate, categories);
      
      toast({
        title: "Профиль успешно создан!",
        description: "Теперь вы можете начать работу с учениками",
      });
      
      navigate("/profile/tutor");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Произошла ошибка при сохранении профиля",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Заполните профиль репетитора</CardTitle>
              <CardDescription>
                Для начала работы на платформе необходимо заполнить все обязательные поля
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TutorCompleteForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                subjects={subjects}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutorCompletePage;
