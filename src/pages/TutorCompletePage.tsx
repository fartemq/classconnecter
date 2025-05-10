
import React, { useState, useEffect, useCallback } from "react";
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
import { TutorFormValues } from "@/types/tutor";
import { fetchSubjectsAndCategories, saveTutorProfile, saveTutorSubjects } from "@/services/tutorService";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ProfileCompletionForm } from "@/components/profile/tutor/ProfileCompletionForm";

const TutorCompletePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [initialValues, setInitialValues] = useState<Partial<TutorFormValues>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data: user info and subjects
  const loadData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      
      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        navigate("/login", { state: { redirect: "/complete/tutor" } });
        return;
      }

      // Check user role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError("Не удалось загрузить данные профиля");
        return;
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
      
      try {
        // Load subjects and categories
        const { subjects: fetchedSubjects, categories: fetchedCategories } = await fetchSubjectsAndCategories();
        setSubjects(fetchedSubjects || []);
        setCategories(fetchedCategories || []);
      } catch (error) {
        console.error("Error loading subjects/categories:", error);
        setSubjects([]);
        setCategories([]);
        // Continue execution - subjects can be loaded later
      }
      
      // Load tutor profile if exists
      if (profileData) {
        try {
          // Load additional tutor-specific data
          const { data: tutorData } = await supabase
            .from("tutor_profiles")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
            
          // Load subjects
          const { data: subjectsData } = await supabase
            .from("tutor_subjects")
            .select("subject_id")
            .eq("tutor_id", session.user.id)
            .eq("is_active", true);
            
          const values: Partial<TutorFormValues> = {
            firstName: profileData.first_name || "",
            lastName: profileData.last_name || "",
            bio: profileData.bio || "",
            city: profileData.city || "",
            avatarUrl: profileData.avatar_url || null,
            educationInstitution: tutorData?.education_institution || "",
            degree: tutorData?.degree || "",
            graduationYear: tutorData?.graduation_year || new Date().getFullYear(),
            methodology: tutorData?.methodology || "",
            experience: tutorData?.experience || 0,
            achievements: tutorData?.achievements || "",
            videoUrl: tutorData?.video_url || "",
            subjects: subjectsData ? subjectsData.map(item => item.subject_id) : [],
            teachingLevels: ["школьник", "студент", "взрослый"], // Default values
            hourlyRate: 0, // Default, will be overridden if any subject has rate
          };
          
          // If there are subjects, try to get hourly rate from the first one
          if (subjectsData && subjectsData.length > 0) {
            try {
              const { data: rateData } = await supabase
                .from("tutor_subjects")
                .select("hourly_rate")
                .eq("tutor_id", session.user.id)
                .eq("subject_id", subjectsData[0].subject_id)
                .single();
                
              if (rateData) {
                values.hourlyRate = rateData.hourly_rate || 0;
              }
            } catch (rateError) {
              console.error("Error fetching hourly rate:", rateError);
              // Continue with default hourly rate
            }
          }
          
          setInitialValues(values);
        } catch (profileDataError) {
          console.error("Error loading profile data:", profileDataError);
          // Continue with default values
          setInitialValues({
            firstName: profileData.first_name || "",
            lastName: profileData.last_name || "",
            bio: profileData.bio || "",
            city: profileData.city || "",
            subjects: [],
            teachingLevels: ["школьник", "студент", "взрослый"],
            hourlyRate: 0
          });
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Произошла ошибка при загрузке данных");
    } finally {
      setIsLoadingData(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      const result = await saveTutorProfile(values, user.id, avatarFile, initialValues.avatarUrl || null);
      
      if (!result.success) {
        throw new Error(result.error || "Ошибка сохранения профиля");
      }
      
      // Save subjects
      await saveTutorSubjects(user.id, values.subjects, values.hourlyRate, categories);
      
      toast({
        title: "Профиль успешно создан!",
        description: "Теперь вы можете начать работу с учениками",
      });
      
      navigate("/profile/tutor?tab=dashboard");
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

  const renderContent = () => {
    if (isLoadingData) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader size="lg" />
        </div>
      );
    }
    
    if (error) {
      return (
        <Alert variant="destructive" className="max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Заполните профиль репетитора</CardTitle>
          <CardDescription>
            Для начала работы на платформе необходимо заполнить все обязательные поля
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileCompletionForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            subjects={subjects || []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutorCompletePage;
