
import React from "react";
import { 
  Search, 
  Heart, 
  CalendarClock, 
  MessageSquare, 
  Book, 
  Settings,
  BookOpen,
  User,
  Star,
  Clock,
  Sparkles,
  GraduationCap,
  BookMarked,
  ListChecks
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ModalDialog } from "@/components/ui/modal-dialog";

export const StudentDashboard = () => {
  const actions = [
    {
      label: "Расписание занятий",
      description: "Управляйте своими уроками",
      icon: CalendarClock,
      path: "/profile/student/schedule",
      className: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      badge: 0,
      content: "Здесь будет расписание занятий"
    },
    {
      label: "Найти репетитора",
      description: "Поиск по предметам и специализациям",
      icon: Search,
      path: "/tutors",
      className: "bg-primary/5 border-primary/20 hover:bg-primary/10",
      content: "Здесь будет поиск репетиторов"
    },
    {
      label: "Мои репетиторы",
      description: "Список ваших преподавателей",
      icon: GraduationCap,
      path: "/profile/student/tutors",
      className: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      content: "Здесь будет список ваших репетиторов"
    },
    {
      label: "Избранные репетиторы",
      description: "Сохраненные репетиторы",
      icon: Heart,
      path: "/profile/student/favorites",
      className: "bg-pink-50 border-pink-200 hover:bg-pink-100",
      content: "Здесь будут избранные репетиторы"
    },
    {
      label: "Сообщения",
      description: "Общение с преподавателями",
      icon: MessageSquare,
      path: "/profile/student/chats",
      className: "bg-green-50 border-green-200 hover:bg-green-100",
      badge: 2,
      content: "Здесь будут ваши сообщения"
    },
    {
      label: "Домашние задания",
      description: "Текущие и прошлые задания",
      icon: BookMarked,
      path: "/profile/student/homework",
      className: "bg-amber-50 border-amber-200 hover:bg-amber-100",
      badge: 1,
      content: "Здесь будут ваши домашние задания"
    },
    {
      label: "Мой прогресс",
      description: "Статистика вашего обучения",
      icon: ListChecks,
      path: "/profile/student/progress",
      className: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      content: "Здесь будет статистика вашего обучения"
    },
    {
      label: "Все предметы",
      description: "Каталог учебных дисциплин",
      icon: BookOpen,
      path: "/subjects",
      className: "bg-violet-50 border-violet-200 hover:bg-violet-100",
      content: "Здесь будет каталог предметов"
    },
    {
      label: "Настройки",
      description: "Управление аккаунтом",
      icon: Settings,
      path: "/profile/student/settings",
      className: "bg-gray-50 border-gray-200 hover:bg-gray-100",
      content: "Здесь будут настройки аккаунта"
    },
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gradient">Добро пожаловать!</h1>
        <p className="text-gray-600 text-lg">Какие у вас цели обучения сегодня?</p>
      </div>
      
      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <Card className="shadow-md rounded-xl overflow-hidden gradient-card card-hover border-primary/20">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Ближайшее занятие</p>
              <p className="font-semibold text-gray-800">Не запланировано</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md rounded-xl overflow-hidden gradient-card card-hover border-green-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-green-50 flex items-center justify-center">
              <Book className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Домашних заданий</p>
              <p className="font-semibold text-gray-800">1 активное</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md rounded-xl overflow-hidden gradient-card card-hover border-amber-200">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="h-7 w-7 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Любимые предметы</p>
              <p className="font-semibold text-gray-800">Не выбраны</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Быстрые действия</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {actions.map((action) => (
          <ModalDialog
            key={action.label}
            title={action.label}
            description={action.description}
            triggerButton={
              <Card 
                className={`border shadow-md hover:shadow-lg rounded-xl card-hover overflow-hidden ${action.className}`}
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white shadow-sm relative">
                    <action.icon size={24} className="text-gray-700" />
                    {action.badge !== undefined && action.badge > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg">{action.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <div className="min-h-[400px] flex items-center justify-center text-gray-500">
              {action.content}
            </div>
          </ModalDialog>
        ))}
      </div>
    </div>
  );
};
