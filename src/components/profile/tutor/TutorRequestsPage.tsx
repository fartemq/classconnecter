import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TutorLessonRequests } from "./TutorLessonRequests";

const TutorRequestsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Заявки на занятия</h1>
              <p className="text-muted-foreground">
                Управляйте запросами студентов на занятия
              </p>
            </div>
            
            <TutorLessonRequests />
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default TutorRequestsPage;