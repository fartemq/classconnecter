
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilterBar } from "./homework/SearchFilterBar";
import { CurrentHomeworkItem } from "./homework/CurrentHomeworkItem";
import { CompletedHomeworkItem } from "./homework/CompletedHomeworkItem";
import { EmptyState } from "./homework/EmptyState";
import { AnalyticsDashboard } from "./homework/AnalyticsDashboard";
import { HomeworkDetailsDialog } from "./homework/HomeworkDetailsDialog";
import { currentHomework, completedHomework } from "./homework/mockData";
import { formatDate, getStatusColor, getStatusLabel } from "./homework/homeworkUtils";

export const HomeworkTab = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  
  // Combine all homework for subjects list
  const allHomework = [...currentHomework, ...completedHomework];
  const subjects = [...new Set(allHomework.map(hw => hw.subject))];
  
  // Filter homework based on search term and subject filter
  const filteredCurrentHomework = currentHomework.filter(hw => 
    (hw.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     hw.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (subjectFilter === "" || hw.subject === subjectFilter)
  );
  
  const filteredCompletedHomework = completedHomework.filter(hw => 
    (hw.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     hw.subject.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (subjectFilter === "" || hw.subject === subjectFilter)
  );
  
  // Handler for viewing homework details
  const openHomeworkDetails = (homework: any) => {
    setSelectedHomework(homework);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Домашние задания</h2>
      
      {/* Search and filters */}
      <SearchFilterBar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        subjects={subjects}
      />
      
      {/* Main tabs */}
      <Tabs defaultValue="current">
        <TabsList>
          <TabsTrigger value="current">Текущие</TabsTrigger>
          <TabsTrigger value="completed">Выполненные</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>
        
        {/* Current homework tab */}
        <TabsContent value="current" className="mt-4">
          {filteredCurrentHomework.length > 0 ? (
            <div className="space-y-4">
              {filteredCurrentHomework.map((homework) => (
                <CurrentHomeworkItem
                  key={homework.id}
                  homework={homework}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  formatDate={formatDate}
                  onViewClick={openHomeworkDetails}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              type="current"
              hasFilters={!!(searchTerm || subjectFilter)}
            />
          )}
        </TabsContent>
        
        {/* Completed homework tab */}
        <TabsContent value="completed" className="mt-4">
          {filteredCompletedHomework.length > 0 ? (
            <div className="space-y-4">
              {filteredCompletedHomework.map((homework) => (
                <CompletedHomeworkItem
                  key={homework.id}
                  homework={homework}
                  formatDate={formatDate}
                  onViewClick={openHomeworkDetails}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              type="completed"
              hasFilters={!!(searchTerm || subjectFilter)}
            />
          )}
        </TabsContent>
        
        {/* Analytics tab */}
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
      
      {/* Homework details dialog */}
      <HomeworkDetailsDialog
        selectedHomework={selectedHomework}
        open={!!selectedHomework}
        onOpenChange={(open) => !open && setSelectedHomework(null)}
        formatDate={formatDate}
      />
    </div>
  );
};
