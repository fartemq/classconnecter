
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  LogIn, 
  User, 
  Calendar, 
  MessageSquare, 
  Users, 
  BarChart,
  Heart,
  FileText,
  Settings,
  LogOut
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { logoutUser } from "@/services/authService";

// Popular subjects for dropdown menu
const popularSubjects = [
  { name: "Mathematics", slug: "mathematics" },
  { name: "English", slug: "english" },
  { name: "Physics", slug: "physics" },
  { name: "Chemistry", slug: "chemistry" },
  { name: "Biology", slug: "biology" },
  { name: "Computer Science", slug: "computer-science" },
  { name: "Russian", slug: "russian" },
  { name: "History", slug: "history" },
];

// All subjects (alphabetically sorted)
const allSubjects = [
  { name: "Art", slug: "art" },
  { name: "Biology", slug: "biology" },
  { name: "Chemistry", slug: "chemistry" },
  { name: "Computer Science", slug: "computer-science" },
  { name: "Economics", slug: "economics" },
  { name: "English", slug: "english" },
  { name: "Geography", slug: "geography" },
  { name: "History", slug: "history" },
  { name: "Literature", slug: "literature" },
  { name: "Mathematics", slug: "mathematics" },
  { name: "Music", slug: "music" },
  { name: "Philosophy", slug: "philosophy" },
  { name: "Physics", slug: "physics" },
  { name: "Psychology", slug: "psychology" },
  { name: "Russian", slug: "russian" },
];

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Проверяем, авторизован ли пользователь
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session) {
        // Получаем роль пользователя из профиля
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (data) {
          setUserRole(data.role);
        }
      }
    };

    checkAuth();

    // Подписываемся на изменения статуса авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        
        if (session) {
          // Получаем роль пользователя при изменении статуса авторизации
          const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (data) {
            setUserRole(data.role);
          }
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы"
      });
      navigate("/");
    } catch (error) {
      console.error("Ошибка выхода:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти из системы",
        variant: "destructive"
      });
    }
  };

  // Student navigation tabs
  const studentTabs = [
    { name: "Расписание", path: "/profile/student?tab=schedule", icon: Calendar },
    { name: "Репетиторы", path: "/profile/student?tab=tutors", icon: Users },
    { name: "Избранное", path: "/profile/student?tab=favorites", icon: Heart },
    { name: "Сообщения", path: "/profile/student?tab=chats", icon: MessageSquare },
    { name: "Домашние задания", path: "/profile/student?tab=homework", icon: FileText },
    { name: "Настройки", path: "/profile/student?tab=settings", icon: Settings },
  ];

  // Tutor navigation tabs
  const tutorTabs = [
    { name: "Расписание", path: "/profile/tutor", icon: Calendar },
    { name: "Ученики", path: "/profile/tutor?tab=students", icon: Users },
    { name: "Сообщения", path: "/profile/tutor?tab=chats", icon: MessageSquare },
    { name: "Статистика", path: "/profile/tutor?tab=stats", icon: BarChart },
  ];

  // Function to check if a student tab is active
  const isStudentTabActive = (path: string) => {
    const tabParam = new URLSearchParams(location.search).get("tab");
    const pathTab = new URLSearchParams(new URL(path, window.location.origin).search).get("tab");
    
    return location.pathname === "/profile/student" && (tabParam === pathTab || (!tabParam && pathTab === "schedule"));
  };

  // Function to check if a tutor tab is active
  const isTutorTabActive = (path: string) => {
    const tabParam = new URLSearchParams(location.search).get("tab");
    const pathTab = new URLSearchParams(new URL(path, window.location.origin).search).get("tab");
    
    return location.pathname === "/profile/tutor" && (tabParam === pathTab || (path === "/profile/tutor" && !tabParam));
  };

  // Determine if we're on the student profile page
  const isStudentProfilePage = location.pathname === "/profile/student";
  const isTutorProfilePage = location.pathname === "/profile/tutor";
  
  // Get current active tab from URL for student profile
  const getActiveStudentTab = () => {
    if (isStudentProfilePage) {
      const params = new URLSearchParams(location.search);
      return params.get("tab") || "schedule";
    }
    return null;
  };
  
  const activeStudentTab = getActiveStudentTab();
  
  // Handle tab click for student profile
  const handleStudentTabClick = (tab: string) => {
    navigate(`/profile/student?tab=${tab}`);
  };

  // Определяем URL для кнопки профиля в зависимости от роли пользователя
  const getProfileUrl = () => {
    if (userRole === "tutor") {
      return "/profile/tutor";
    } else {
      return "/profile/student";
    }
  };

  // Генерируем меню навигации в зависимости от роли пользователя
  const getNavigationItems = () => {
    // Если пользователь - студент, показываем навигацию для студента
    if (isAuthenticated && userRole === "student") {
      return (
        <>
          {studentTabs.map((tab) => (
            <Link 
              key={tab.path}
              to={tab.path}
              className={`${isStudentTabActive(tab.path) ? "text-primary font-medium" : "text-gray-700"} hover:text-primary flex items-center gap-1`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </Link>
          ))}
        </>
      );
    }
    
    // Если пользователь - репетитор, показываем специальное меню для репетиторов
    else if (isAuthenticated && userRole === "tutor") {
      return (
        <>
          {tutorTabs.map((tab) => (
            <Link 
              key={tab.path}
              to={tab.path}
              className={`${isTutorTabActive(tab.path) ? "text-primary font-medium" : "text-gray-700"} hover:text-primary flex items-center gap-1`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </Link>
          ))}
        </>
      );
    } 
    
    // Для неавторизованных пользователей показываем стандартное меню
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-primary outline-none">
            <span>Предметы</span>
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white">
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Популярные предметы</h3>
              {popularSubjects.map((subject) => (
                <DropdownMenuItem key={subject.slug} asChild>
                  <Link to={`/tutors?subject=${subject.slug}`} className="w-full">
                    {subject.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="p-2 max-h-60 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Все предметы</h3>
              {allSubjects.map((subject) => (
                <DropdownMenuItem key={subject.slug} asChild>
                  <Link to={`/tutors?subject=${subject.slug}`} className="w-full">
                    {subject.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
            
            <DropdownMenuSeparator />
            
            <div className="p-2">
              <DropdownMenuItem asChild>
                <Link to="/subjects" className="w-full font-medium text-primary">
                  Посмотреть все предметы
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Link 
          to="/tutors" 
          className={`${location.pathname === "/tutors" ? "text-primary font-medium" : "text-gray-700"} hover:text-primary`}
        >
          Репетиторы
        </Link>
        <Link 
          to="/about" 
          className={`${location.pathname === "/about" ? "text-primary font-medium" : "text-gray-700"} hover:text-primary`}
        >
          О нас
        </Link>
      </>
    );
  };

  return (
    <header className="w-full bg-white py-4 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-primary text-2xl font-bold">
          Stud.rep
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          {getNavigationItems()}
        </nav>
        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button variant="default" className="bg-gray-900 hover:bg-gray-800" asChild>
                <Link to={getProfileUrl()} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Профиль
                </Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </>
          ) : (
            <Button variant="default" className="bg-gray-900 hover:bg-gray-800" asChild>
              <Link to="/login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Войти/Зарегистрироваться
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      <div className="md:hidden mt-4">
        <Button 
          variant="ghost" 
          className="w-full flex justify-between items-center py-2 px-4"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          Меню
          <ChevronDown className={`h-4 w-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </Button>
        
        {isMenuOpen && (
          <div className="bg-white border-t border-gray-100 py-2">
            <div className="flex flex-col space-y-2 px-4">
              {isAuthenticated ? (
                userRole === "student" ? (
                  // Mobile student navigation
                  studentTabs.map((tab) => (
                    <Link 
                      key={tab.path}
                      to={tab.path}
                      className={`${isStudentTabActive(tab.path) ? "text-primary font-medium" : "text-gray-700"} hover:text-primary flex items-center gap-2 py-2`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.name}
                    </Link>
                  ))
                ) : (
                  // Mobile tutor navigation
                  tutorTabs.map((tab) => (
                    <Link 
                      key={tab.path}
                      to={tab.path}
                      className={`${isTutorTabActive(tab.path) ? "text-primary font-medium" : "text-gray-700"} hover:text-primary flex items-center gap-2 py-2`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.name}
                    </Link>
                  ))
                )
              ) : (
                // Mobile guest navigation
                <>
                  <Link 
                    to="/subjects"
                    className="text-gray-700 hover:text-primary py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Предметы
                  </Link>
                  <Link 
                    to="/tutors"
                    className={`${location.pathname === "/tutors" ? "text-primary font-medium" : "text-gray-700"} hover:text-primary py-2`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Репетиторы
                  </Link>
                  <Link 
                    to="/about"
                    className={`${location.pathname === "/about" ? "text-primary font-medium" : "text-gray-700"} hover:text-primary py-2`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    О нас
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
