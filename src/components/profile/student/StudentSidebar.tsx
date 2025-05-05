
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfileInfo } from "./components/ProfileInfo";
import { Button } from "@/components/ui/button";
import { 
  Calendar, Users, Heart, MessageSquare, 
  FileText, Settings, User, BookOpen, Home
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface StudentSidebarProps {
  profile: {
    id: string;
    first_name: string;
    last_name: string | null;
    avatar_url: string | null;
    bio?: string | null;
    phone?: string | null;
    city?: string | null;
    school?: string | null;
    grade?: string | null;
  };
}

export const StudentSidebar = ({ profile }: StudentSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { label: "Главная", icon: Home, path: "/profile/student" },
    { label: "Расписание", icon: Calendar, path: "/profile/student/schedule" },
    { label: "Репетиторы", icon: Users, path: "/profile/student/tutors" },
    { label: "Избранное", icon: Heart, path: "/profile/student/favorites" },
    { label: "Сообщения", icon: MessageSquare, path: "/profile/student/chats", badge: 2 },
    { label: "Домашние задания", icon: FileText, path: "/profile/student/homework", badge: 1 },
    { label: "Мой профиль", icon: User, path: "/profile/student/edit" },
    { label: "Настройки", icon: Settings, path: "/profile/student/settings" },
  ];
  
  const isActive = (path: string) => {
    if (path === "/profile/student" && location.pathname === "/profile/student") {
      return true;
    }
    if (path !== "/profile/student" && location.pathname.includes(path)) {
      return true;
    }
    return false;
  };

  // Profile completion calculation
  const profileProgress = 65;
  
  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card className="shadow-md border-none overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500/80 to-blue-600 w-full" />
        
        <CardHeader className="text-center pb-2 relative -mt-12">
          <ProfileAvatar 
            avatarUrl={profile.avatar_url}
            firstName={profile.first_name}
            lastName={profile.last_name}
            verified={true}
          />
          
          <ProfileInfo 
            firstName={profile.first_name}
            lastName={profile.last_name}
            city={profile.city}
            phone={profile.phone}
            bio={profile.bio}
            school={profile.school}
            grade={profile.grade}
            rating={4.8}
            ratingCount={12}
          />
        </CardHeader>
        
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Заполнение профиля</span>
              <span className="text-sm font-medium">{profileProgress}%</span>
            </div>
            <Progress value={profileProgress} className="h-2" />
          </div>
          
          <Button 
            className="w-full mb-2" 
            onClick={() => navigate("/tutors")}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Найти репетитора
          </Button>
        </CardContent>
      </Card>
      
      {/* Navigation */}
      <Card className="shadow-md border-none p-3">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              className={`w-full justify-start ${isActive(item.path) ? "" : "hover:bg-gray-100"}`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="ml-auto h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
};
