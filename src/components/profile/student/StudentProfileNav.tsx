
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Calendar, Users, Heart, MessageSquare, 
  FileText, Settings, User, ChevronDown 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const studentNavItems = [
  { name: "Расписание", path: "/profile/student/schedule", icon: Calendar },
  { name: "Репетиторы", path: "/profile/student/tutors", icon: Users },
  { name: "Избранное", path: "/profile/student/favorites", icon: Heart },
  { name: "Сообщения", path: "/profile/student/chats", icon: MessageSquare },
  { name: "Домашние задания", path: "/profile/student/homework", icon: FileText },
  { name: "Настройки", path: "/profile/student/settings", icon: Settings },
  { name: "Мой профиль", path: "/profile/student/edit", icon: User },
];

export const StudentProfileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>(location.pathname);

  // Find current active section name
  const currentSection = studentNavItems.find(item => location.pathname === item.path);
  
  const handleNavigation = (path: string) => {
    setActiveSection(path);
    navigate(path);
  };

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentSection?.name || "Личный кабинет"}
        </h2>
        
        <div className="block md:hidden w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {currentSection?.name || "Выбрать раздел"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {studentNavItems.map((item) => (
                <DropdownMenuItem 
                  key={item.path}
                  className={`${activeSection === item.path ? "bg-primary/10 text-primary" : ""} cursor-pointer`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="hidden md:flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
          {studentNavItems.map((item) => (
            <Button 
              key={item.path}
              variant={activeSection === item.path ? "default" : "ghost"} 
              size="sm"
              className={`gap-2 ${activeSection === item.path ? 'shadow-sm' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="h-0.5 w-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-full mb-6" />
    </div>
  );
};
