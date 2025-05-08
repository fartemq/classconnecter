
import React, { useEffect } from "react";
import { FindTutorsTab } from "@/components/profile/student/FindTutorsTab";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const StudentFindTutorsPage = () => {
  const { isLoading } = useProfile("student");
  const { toast } = useToast();
  
  // Show welcome message when component mounts
  useEffect(() => {
    toast({
      title: "Добро пожаловать в поиск репетиторов!",
      description: "Здесь вы можете найти подходящего репетитора и записаться на урок.",
    });
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
