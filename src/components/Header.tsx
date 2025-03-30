
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogIn, User } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  // Определяем URL для кнопки профиля в зависимости от роли пользователя
  const getProfileUrl = () => {
    if (userRole === "tutor") {
      return "/profile/tutor";
    } else {
      return "/profile/student";
    }
  };

  return (
    <header className="w-full bg-white py-4 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-primary text-2xl font-bold">
          Stud.rep
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
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
        </nav>
        
        <div className="flex items-center">
          {isAuthenticated ? (
            <Button variant="default" className="bg-gray-900 hover:bg-gray-800" asChild>
              <Link to={getProfileUrl()} className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Профиль
              </Link>
            </Button>
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
    </header>
  );
};
