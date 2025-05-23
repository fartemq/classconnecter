import React from "react";
import { cn } from "@/lib/utils";
import { 
  User, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Clock,
  Bell,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useLessonRequests } from "@/hooks/useLessonRequests";
import { useAuth } from "@/hooks/useAuth";

interface TutorSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TutorSidebar: React.FC<TutorSidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.id);
  const { lessonRequests } = useLessonRequests(user?.id, 'tutor');
  
  const pendingRequestsCount = lessonRequests.filter(req => req.status === 'pending').length;

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Обзор",
      icon: BarChart3,
      description: "Общая статистика и активность"
    },
    {
      id: "profile",
      label: "Профиль",
      icon: User,
      description: "Личная информация и настройки профиля"
    },
    {
      id: "lesson-requests",
      label: "Запросы на занятия",
      icon: Clock,
      description: "Входящие запросы от студентов",
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeVariant: "destructive" as const
    },
    {
      id: "notifications",
      label: "Уведомления",
      icon: Bell,
      description: "Системные уведомления",
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      id: "students",
      label: "Ученики",
      icon: Users,
      description: "Управление учениками и занятиями"
    },
    {
      id: "schedule",
      label: "Расписание",
      icon: Calendar,
      description: "Управление расписанием и доступностью"
    },
    {
      id: "subjects",
      label: "Предметы",
      icon: BookOpen,
      description: "Преподаваемые предметы и цены"
    },
    {
      id: "chats",
      label: "Сообщения",
      icon: MessageSquare,
      description: "Переписка со студентами"
    },
    {
      id: "settings",
      label: "Настройки",
      icon: Settings,
      description: "Настройки аккаунта и уведомлений"
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Профиль репетитора</h2>
        <p className="text-sm text-gray-500 mt-1">Управление профилем и занятиями</p>
      </div>
      
      <nav className="px-3 pb-6">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    isActive
                      ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:text-gray-900"
                  )}
                  title={item.description}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 mr-3" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={item.badgeVariant || "default"} 
                        className="text-xs px-1.5 py-0.5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
