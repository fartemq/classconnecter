
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, BookOpen } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export const ScheduleTab = () => {
  // Mock data - would come from database in real app
  const upcomingLessons = [];
  const pastLessons = [];
  
  const renderLessonTable = (lessons: any[], emptyMessage: string) => {
    if (lessons.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата и время</TableHead>
            <TableHead>Репетитор</TableHead>
            <TableHead>Предмет</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Map through lessons here */}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Расписание занятий</CardTitle>
          <Calendar size={20} />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming" className="flex items-center">
              <Clock size={16} className="mr-2" />
              Предстоящие
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center">
              <Clock size={16} className="mr-2" />
              Прошедшие
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {renderLessonTable(upcomingLessons, "У вас пока нет запланированных занятий.")}
          </TabsContent>
          
          <TabsContent value="past">
            {renderLessonTable(pastLessons, "У вас пока нет прошедших занятий.")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
