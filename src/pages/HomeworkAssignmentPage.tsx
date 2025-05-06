
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useProfile } from "@/hooks/useProfile";
import { Loader } from "@/components/ui/loader";
import HomeworkAssignment from "@/components/homework/HomeworkAssignment";

const HomeworkAssignmentPage = () => {
  const { isLoading } = useProfile("tutor");
  
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
          <div className="max-w-3xl mx-auto">
            <HomeworkAssignment />
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default HomeworkAssignmentPage;
