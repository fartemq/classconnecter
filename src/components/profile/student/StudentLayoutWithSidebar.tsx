
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home,
  Search,
  MessageCircle,
  User,
  GraduationCap,
  Settings,
  History,
  Calendar,
  Menu,
  X
} from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface StudentLayoutWithSidebarProps {
  children: React.ReactNode;
}

export const StudentLayoutWithSidebar: React.FC<StudentLayoutWithSidebarProps> = ({
  children
}) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  
  const navigation = [
    {
      id: "home",
      label: "Главная",
      icon: Home,
      path: "/profile/student"
    },
    {
      id: "find-tutors",
      label: "Найти репетитора",
      icon: Search,
      path: "/profile/student/find-tutors"
    },
    {
      id: "chats",
      label: "Сообщения",
      icon: MessageCircle,
      path: "/profile/student/chats"
    },
    {
      id: "edit",
      label: "Мой профиль",
      icon: User,
      path: "/profile/student/edit"
    },
    {
      id: "education",
      label: "Образование",
      icon: GraduationCap,
      path: "/profile/student/education"
    },
    {
      id: "lessons",
      label: "Уроки",
      icon: Calendar,
      path: "/profile/student/lessons"
    },
    {
      id: "history",
      label: "История занятий",
      icon: History,
      path: "/profile/student/history"
    },
    {
      id: "settings",
      label: "Настройки",
      icon: Settings,
      path: "/profile/student/settings"
    }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const toggleMobile = () => setMobileOpen(!mobileOpen);
  
  // Close mobile sidebar when clicking a link
  const closeMobileOnClick = () => {
    if (mobileOpen) setMobileOpen(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Mobile sidebar toggle button - outside sidebar to be always visible */}
      <div className="lg:hidden p-4 flex justify-end">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleMobile}
          className="fixed z-50 top-4 right-4"
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>
      
      <SidebarProvider>
        <div className="flex-grow flex w-full">
          <Sidebar
            className={cn(
              "border-r bg-white transition-all duration-300",
              collapsed ? "w-14" : "w-64",
              mobileOpen ? "fixed inset-y-0 left-0 z-40" : "hidden lg:block"
            )}
            defaultCollapsed={collapsed}
            onCollapsedChange={setCollapsed}
          >
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
                              isActive(item.path) ? "bg-gray-100 text-primary font-medium" : "text-gray-700"
                            )}
                            onClick={closeMobileOnClick}
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
            </SidebarContent>
          </Sidebar>
          
          {/* Overlay for mobile */}
          {mobileOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
              onClick={toggleMobile}
            />
          )}
          
          <main className="flex-1 p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </SidebarProvider>
      
      <Footer />
    </div>
  );
};
