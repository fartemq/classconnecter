
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Users, Clock, Star } from "lucide-react";

const SubjectPage = () => {
  const { subject, level } = useParams();

  // Проверяем корректность параметров
  if (!subject || !level) {
    return <Navigate to="/" replace />;
  }

  const subjectNames: { [key: string]: string } = {
    mathematics: "Математика",
    physics: "Физика",
    chemistry: "Химия",
    english: "Английский язык",
    russian: "Русский язык",
  };

  const levelNames: { [key: string]: string } = {
    school: "для школьников",
    adult: "для студентов и взрослых",
  };

  const subjectName = subjectNames[subject] || subject;
  const levelName = levelNames[level] || level;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">
                {subjectName} {levelName}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Найдите квалифицированных репетиторов по {subjectName.toLowerCase()} 
                {level === "school" ? " для школьников" : " для студентов и взрослых"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold mb-2">Качественное обучение</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Проверенные репетиторы с подтвержденным образованием
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <Users className="w-8 h-8 text-green-600 mb-3" />
                  <h3 className="font-semibold mb-2">Индивидуальный подход</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Персонализированная программа под ваши цели
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <Clock className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-semibold mb-2">Гибкое расписание</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Занятия в удобное для вас время
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-6">
                  <Star className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold mb-2">Высокие результаты</h3>
                  <p className="text-sm text-gray-600 text-center">
                    Отзывы и рейтинги от реальных учеников
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center space-y-4">
              <p className="text-gray-600 mb-6">
                Готовы начать обучение? Зарегистрируйтесь как ученик или найдите репетитора прямо сейчас!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-[#3498db] hover:bg-[#2980b9]">
                  <Link to="/register">
                    Зарегистрироваться как ученик
                  </Link>
                </Button>
                
                <Button asChild size="lg" variant="outline">
                  <Link to="/login">
                    Войти в аккаунт
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

export default SubjectPage;
