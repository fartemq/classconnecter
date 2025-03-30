
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Target, BarChart } from "lucide-react";

const AdultStudentPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Образование для студентов и взрослых
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Независимо от того, учитесь ли вы в университете или хотите приобрести новые навыки, Stud.rep поможет вам достичь ваших образовательных целей.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Академическая поддержка</h3>
                <p className="text-gray-600">
                  Помощь с курсовыми, дипломными работами и подготовка к экзаменам в вузе.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <Target className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Профессиональное развитие</h3>
                <p className="text-gray-600">
                  Освоение новых навыков для карьерного роста и профессионального развития.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <BarChart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Индивидуальный подход</h3>
                <p className="text-gray-600">
                  Программы обучения, адаптированные под ваши конкретные цели и потребности.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/register?role=student">Зарегистрироваться</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/tutors?level=adult">Найти репетитора</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdultStudentPage;
