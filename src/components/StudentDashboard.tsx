
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
  Sparkles
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
      icon: User,
      path: "/profile/student/tutors",
      className: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      content: "Здесь будет список ваших репетиторов"
    },
    {
      label: "Избранные репетиторы",
      description: "Сохраненные репетиторы",
      icon: Heart,
      path: "/profile/student/favorites",
      className: "bg-red-50 border-red-200 hover:bg-red-100",
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
      icon: Book,
      path: "/profile/student/homework",
      className: "bg-amber-50 border-amber-200 hover:bg-amber-100",
      badge: 1,
      content: "Здесь будут ваши домашние задания"
    },
    {
      label: "Мой прогресс",
      description: "Статистика вашего обучения",
      icon: Sparkles,
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Добро пожаловать!</h1>
        <p className="text-gray-600">Что бы вы хотели сделать сегодня?</p>
      </div>
      
      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="shadow-sm border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ближайшее занятие</p>
              <p className="font-medium">Не запланировано</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <Book className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Домашних заданий</p>
              <p className="font-medium">1 активное</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-amber-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Любимые предметы</p>
              <p className="font-medium">Не выбраны</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <ModalDialog
            key={action.label}
            title={action.label}
            description={action.description}
            triggerButton={
              <Card 
                className={`border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${action.className}`}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm relative">
                    <action.icon size={20} />
                    {action.badge !== undefined && action.badge > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{action.label}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
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
