
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchStudentsSection } from "./students/SearchStudentsSection";
import { MyStudentsSection } from "./students/MyStudentsSection";

export const StudentsTab = () => {
  const [activeSection, setActiveSection] = useState("search");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Ученики</h2>
      
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="search" className="relative">
            Поиск учеников
          </TabsTrigger>
          <TabsTrigger value="my-students" className="relative">
            Мои ученики
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="mt-0">
          <SearchStudentsSection />
        </TabsContent>
        
        <TabsContent value="my-students" className="mt-0">
          <MyStudentsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};
