
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
  UserCircle,
  BookOpen
} from "lucide-react";

interface TutorMobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TutorMobileNav: React.FC<TutorMobileNavProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const navigate = useNavigate();

  const navItems = [
    { key: "dashboard", label: "Главная", icon: Home, path: "/profile/tutor" },
    { key: "students", label: "Ученики", icon: Users, path: "/profile/tutor/students" },
    { key: "lessons", label: "Занятия", icon: BookOpen, path: "/profile/tutor/lessons" },
    { key: "schedule", label: "Расписание", icon: Calendar, path: "/profile/tutor/schedule" },
    { key: "lesson-requests", label: "Запросы", icon: ClipboardList, path: "/profile/tutor/lesson-requests" },
  ];

  const handleNavigation = (item: typeof navItems[0]) => {
    onTabChange(item.key);
    navigate(item.path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          
          return (
            <button
              key={item.key}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors ${
                isActive 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
