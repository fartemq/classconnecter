import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, Users, TrendingUp, Shield, CheckCircle, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/auth/useAuth";

const BecomeTutorPage = () => {
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
      
      console.log("Authorized user on BecomeTutorPage, redirecting to:", redirectPath);
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
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                Станьте репетитором на Stud.rep
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Присоединяйтесь к нашей платформе и начните зарабатывать, делясь своими знаниями 
                с учениками по всей стране. Мы поможем вам найти студентов и организовать обучение.
              </p>
            </div>

            {/* Преимущества */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Поделитесь знаниями</h3>
                  <p className="text-gray-600 text-center">
                    Помогайте ученикам достигать целей в обучении и развивайтесь как преподаватель
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <DollarSign className="w-12 h-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Дополнительный доход</h3>
                  <p className="text-gray-600 text-center">
                    Зарабатывайте от 1000₽ за час, устанавливайте свои цены и график
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <Users className="w-12 h-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Найдите учеников</h3>
                  <p className="text-gray-600 text-center">
                    Мы поможем вам найти мотивированных учеников через нашу платформу
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <TrendingUp className="w-12 h-12 text-orange-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Развивайте карьеру</h3>
                  <p className="text-gray-600 text-center">
                    Получайте отзывы, повышайте рейтинг и развивайте репутацию
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <Shield className="w-12 h-12 text-red-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Безопасность</h3>
                  <p className="text-gray-600 text-center">
                    Проводите занятия через защищенную платформу с встроенными инструментами
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <CheckCircle className="w-12 h-12 text-teal-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Простота использования</h3>
                  <p className="text-gray-600 text-center">
                    Интуитивно понятный интерфейс для управления расписанием и учениками
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Требования */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Требования к репетиторам</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Обязательные требования:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        Высшее образование по профильному предмету
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        Опыт преподавания от 1 года
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        Документы об образовании для верификации
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        Знание предмета на профессиональном уровне
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Желательно:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                        Сертификаты повышения квалификации
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                        Опыт подготовки к ЕГЭ/ОГЭ
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                        Методические материалы
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                        Положительные отзывы учеников
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Кнопки действий */}
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-bold">Готовы начать?</h2>
              <p className="text-gray-600 mb-6">
                Зарегистрируйтесь как репетитор и начните помогать ученикам уже сегодня!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-[#3498db] hover:bg-[#2980b9]">
                  <Link to="/register">
                    Зарегистрироваться как репетитор
                  </Link>
                </Button>
                
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">
                    Уже есть аккаунт? Войти
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BecomeTutorPage;
