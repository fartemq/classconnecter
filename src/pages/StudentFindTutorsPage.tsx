
import React, { useEffect } from "react";
import { FindTutorsTab } from "@/components/profile/student/FindTutorsTab";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentFindTutorsPage = () => {
  const { isLoading } = useProfile("student");
  const { toast } = useToast();
  
  // Check if there are any published tutor profiles when component mounts
  useEffect(() => {
    const checkForTutors = async () => {
      try {
        // Check the raw database to see if there are any published profiles
        const { data, error, count } = await supabase
          .from("tutor_profiles")
          .select("id", { count: 'exact' })
          .eq("is_published", true);
          
        if (error) {
          console.error("Error checking for tutors:", error);
          return;
        }
        
        console.log(`Direct DB check: Found ${count} published tutor profiles`);
        
        if (count === 0) {
          toast({
            title: "К сожалению, репетиторы пока отсутствуют",
            description: "В данный момент нет опубликованных анкет репетиторов. Пожалуйста, проверьте позже.",
            variant: "default", // Changed from default to ensure consistency
          });
        } else {
          toast({
            title: "Добро пожаловать в поиск репетиторов!",
            description: "Здесь вы можете найти подходящего репетитора и записаться на урок.",
            variant: "default", // Explicitly specifying default
          });
        }
      } catch (error) {
        console.error("Error in checkForTutors:", error);
      }
    };
    
    checkForTutors();
  }, [toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader size="lg" />
        </main>
        <Footer className="py-2" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <FindTutorsTab />
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default StudentFindTutorsPage;
