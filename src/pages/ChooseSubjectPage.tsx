
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Subject {
  id: string;
  name: string;
  description: string | null;
}

const ChooseSubjectPage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Get current user and subjects on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          console.error("Auth error:", authError);
          toast({
            title: "Требуется авторизация",
            description: "Пожалуйста, войдите в систему для продолжения.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }
        
        setUser(session.user);
        
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from("subjects")
          .select("*")
          .eq("is_active", true)
          .order("name");
        
        if (subjectsError) {
          console.error("Error fetching subjects:", subjectsError);
          throw new Error("Ошибка при загрузке предметов");
        }
        
        setSubjects(subjectsData || []);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Ошибка",
          description: error instanceof Error ? error.message : "Произошла ошибка при загрузке данных",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId);
      } else {
        return [...prev, subjectId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSubjects.length === 0) {
      toast({
        title: "Пожалуйста, выберите предметы",
        description: "Вы должны выбрать хотя бы один предмет",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      if (!user) {
        throw new Error("Пользователь не авторизован");
      }
      
      // Save selected subjects to user's profile
      // In a real app, you'd create a relationship between users and subjects
      const { error } = await supabase
        .from("student_subjects") // This table would need to be created in the database
        .upsert(
          selectedSubjects.map((subjectId) => ({
            student_id: user.id,
            subject_id: subjectId,
          }))
        );
      
      if (error) {
        console.error("Error saving subjects:", error);
        throw new Error("Ошибка при сохранении выбранных предметов");
      }
      
      toast({
        title: "Предметы сохранены!",
        description: "Ваш выбор предметов успешно сохранен",
      });
      
      navigate("/profile/student");
    } catch (error) {
      console.error("Error submitting subjects:", error);
      toast({
        title: "Ошибка сохранения",
        description: error instanceof Error ? error.message : "Произошла ошибка при сохранении предметов",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Выберите предметы, которые вам интересны
              </CardTitle>
              <CardDescription className="text-center">
                Выберите предметы, по которым вы хотели бы найти репетитора
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-gray-50"
                    >
                      <Checkbox
                        id={`subject-${subject.id}`}
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={() => handleSubjectToggle(subject.id)}
                      />
                      <Label
                        htmlFor={`subject-${subject.id}`}
                        className="cursor-pointer flex-grow"
                      >
                        {subject.name}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <Button type="submit" size="lg" disabled={isSaving}>
                    {isSaving ? "Сохранение..." : "Сохранить и продолжить"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ChooseSubjectPage;
