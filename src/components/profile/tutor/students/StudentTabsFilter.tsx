
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Student } from "./mockData";

interface StudentTabsFilterProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  allStudentsCount: number;
  newStudentsCount: number;
  activeStudentsCount: number;
  inactiveStudentsCount: number;
  children: React.ReactNode;
}

export const StudentTabsFilter = ({
  activeTab,
  setActiveTab,
  allStudentsCount,
  newStudentsCount,
  activeStudentsCount,
  inactiveStudentsCount,
  children
}: StudentTabsFilterProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="all" className="relative">
          Все
          <Badge className="ml-1 text-xs">{allStudentsCount}</Badge>
        </TabsTrigger>
        <TabsTrigger value="new" className="relative">
          Новые
          <Badge variant="secondary" className="ml-1 text-xs bg-green-100">{newStudentsCount}</Badge>
        </TabsTrigger>
        <TabsTrigger value="active" className="relative">
          Активные
          <Badge variant="secondary" className="ml-1 text-xs bg-blue-100">{activeStudentsCount}</Badge>
        </TabsTrigger>
        <TabsTrigger value="inactive" className="relative">
          Неактивные
          <Badge variant="secondary" className="ml-1 text-xs bg-gray-100">{inactiveStudentsCount}</Badge>
        </TabsTrigger>
      </TabsList>
      
      {/* All tabs content is the same, just filtered differently */}
      <TabsContent value="all" className="mt-0">
        {children}
      </TabsContent>
      <TabsContent value="new" className="mt-0">
        {children}
      </TabsContent>
      <TabsContent value="active" className="mt-0">
        {children}
      </TabsContent>
      <TabsContent value="inactive" className="mt-0">
        {children}
      </TabsContent>
    </Tabs>
  );
};
