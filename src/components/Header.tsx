
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

  return (
    <header className="w-full bg-white py-4 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="text-primary text-2xl font-bold">
          Stud.rep
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <div className="relative group">
            <button className="flex items-center space-x-1 text-gray-700 hover:text-primary">
              <span>Предметы</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-chevron-down">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
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
          <Button variant="default" className="bg-gray-900 hover:bg-gray-800">
            Войти/Зарегистрироваться
          </Button>
        </div>
      </div>
    </header>
  );
};
