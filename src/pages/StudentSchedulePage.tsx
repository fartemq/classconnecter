
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StudentScheduleView } from "@/components/profile/student/schedule/StudentScheduleView";

const StudentSchedulePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Мое расписание</h1>
              <p className="text-muted-foreground">
                Просматривайте свои запланированные занятия и ближайшие уроки
              </p>
            </div>
            
            <StudentScheduleView />
          </div>
        </div>
      </main>
      <Footer className="py-2" />
    </div>
  );
};

export default StudentSchedulePage;
