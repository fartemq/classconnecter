
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, Book, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";

const SchoolStudentPage = () => {
  const { user, userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  // Немедленно перенаправляем авторизованных пользователей
  useEffect(() => {
    if (user && !isLoading) {
      let redirectPath = "/profile/student";
      
      if (userRole === "admin" || userRole === "moderator") {
        redirectPath = "/admin";
      } else if (userRole === "tutor") {
        redirectPath = "/profile/tutor";
      }
      
      console.log("Authorized user on SchoolStudentPage, redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
      return;
    }
  }, [user, userRole, isLoading, navigate]);

  // Не показываем контент если пользователь авторизован
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Перенаправление...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Подготовка к успеху для школьников
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Stud.rep поможет вам улучшить оценки, подготовиться к экзаменам и развить навыки, необходимые для академического успеха.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <GraduationCap className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Подготовка к экзаменам</h3>
                <p className="text-gray-600">
                  Персонализированная помощь для успешной сдачи ОГЭ, ЕГЭ и других экзаменов.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <Book className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Помощь с домашними заданиями</h3>
                <p className="text-gray-600">
                  Получите поддержку в выполнении сложных заданий и улучшите понимание предметов.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <Calendar className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Гибкое расписание</h3>
                <p className="text-gray-600">
                  Занимайтесь в удобное для вас время, не нарушая школьный график.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/register?role=student">Зарегистрироваться</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/tutors?level=school">Найти репетитора</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SchoolStudentPage;
