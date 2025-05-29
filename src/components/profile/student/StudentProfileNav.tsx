
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Users, 
  Calendar, 
  MessageSquare, 
  User, 
  BarChart3, 
  Settings, 
  BookOpen,
  FileText
} from "lucide-react";

export const StudentProfileNav = () => {
  return (
    <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 mb-6">
      <TabsTrigger value="profile" className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">Профиль</span>
      </TabsTrigger>
      <TabsTrigger value="find-tutors" className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Поиск</span>
      </TabsTrigger>
      <TabsTrigger value="my-tutors" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Репетиторы</span>
      </TabsTrigger>
      <TabsTrigger value="lesson-requests" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Запросы</span>
      </TabsTrigger>
      <TabsTrigger value="schedule" className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">Расписание</span>
      </TabsTrigger>
      <TabsTrigger value="homework" className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        <span className="hidden sm:inline">Домашние</span>
      </TabsTrigger>
      <TabsTrigger value="chats" className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        <span className="hidden sm:inline">Чаты</span>
      </TabsTrigger>
      <TabsTrigger value="progress" className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        <span className="hidden sm:inline">Прогресс</span>
      </TabsTrigger>
      <TabsTrigger value="settings" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">Настройки</span>
      </TabsTrigger>
    </TabsList>
  );
};
