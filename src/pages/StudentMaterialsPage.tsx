
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/profile/student/common/PageHeader";
import { StudentMaterialsTab } from "@/components/profile/student/materials/StudentMaterialsTab";
import StudentSidebar from "@/components/profile/student/StudentSidebar";

const StudentMaterialsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <PageHeader title="Учебные материалы" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            <div className="md:col-span-1">
              <StudentSidebar />
            </div>
            
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow p-6">
                <StudentMaterialsTab />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default StudentMaterialsPage;
