
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  User, 
  BookOpen, 
  Calendar, 
  Users, 
  MessageSquare, 
  PieChart, 
  Settings, 
  BookCopy,
  GraduationCap
} from "lucide-react";
import { TutorProfile } from "@/types/tutor";
import { TutorProfileContent } from "./TutorProfileContent";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface TutorProfileLayoutProps {
  tutorProfile: TutorProfile;
  activeTab: string;
  children?: React.ReactNode;
}

export const TutorProfileLayout: React.FC<TutorProfileLayoutProps> = ({ 
  tutorProfile, 
  activeTab,
  children = null
}) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = React.useState(false);
  
  const getNavigation = () => [
    {
      id: "dashboard",
      label: "Главная",
      icon: LayoutDashboard,
      path: "/profile/tutor",
    },
    {
      id: "profile",
      label: "Мой профиль",
      icon: User,
      path: "/profile/tutor/profile",
    },
    {
      id: "education",
      label: "Образование",
      icon: GraduationCap,
      path: "/profile/tutor/education",
    },
    {
      id: "teaching",
      label: "Преподавание",
      icon: BookOpen,
      path: "/profile/tutor/teaching",
    },
    {
      id: "schedule",
      label: "Расписание",
      icon: Calendar,
      path: "/profile/tutor/schedule",
    },
    {
      id: "students",
      label: "Ученики",
      icon: Users,
      path: "/profile/tutor/students",
    },
    {
      id: "chats",
      label: "Сообщения",
      icon: MessageSquare,
      path: "/profile/tutor/chats",
    },
    {
      id: "stats",
      label: "Статистика",
      icon: PieChart,
      path: "/profile/tutor/stats",
    },
    {
      id: "materials",
      label: "Материалы",
      icon: BookCopy,
      path: "/profile/tutor/materials",
    },
    {
      id: "settings",
      label: "Настройки",
      icon: Settings,
      path: "/profile/tutor/settings",
    },
  ];

  const navigation = getNavigation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <SidebarProvider>
        <div className="flex-grow flex w-full">
          <Sidebar
            className={cn(
              "h-screen border-r bg-white transition-all duration-300 sticky top-0", 
              collapsed ? "w-14" : "w-64"
            )}
          >
            <SidebarTrigger onClick={() => setCollapsed(!collapsed)} />
            
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
                  Меню
                </SidebarGroupLabel>
                
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigation.map((item) => (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors",
                              activeTab === item.id ? "bg-gray-100 text-primary font-medium" : "text-gray-700"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-2")} />
                            {!collapsed && <span>{item.label}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <div className={cn("mt-auto mb-4 px-3", collapsed ? "sr-only" : "")}>
                <div className="text-xs text-gray-500 mb-2">Репетитор: {tutorProfile.firstName} {tutorProfile.lastName}</div>
              </div>
            </SidebarContent>
          </Sidebar>
          
          <main className="flex-1 p-6 bg-gray-50">
            {children ? children : <TutorProfileContent activeTab={activeTab} tutorProfile={tutorProfile} />}
          </main>
        </div>
      </SidebarProvider>
      
      <Footer />
    </div>
  );
};
