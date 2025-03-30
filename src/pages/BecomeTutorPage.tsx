
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, DollarSign, Clock } from "lucide-react";

const BecomeTutorPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Станьте репетитором на Stud.rep
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Присоединяйтесь к нашей платформе, чтобы делиться своими знаниями, находить новых учеников и развивать свою преподавательскую практику.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Найдите учеников</h3>
                <p className="text-gray-600">
                  Привлекайте новых учеников без затрат на рекламу и маркетинг.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <DollarSign className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Устанавливайте свои цены</h3>
                <p className="text-gray-600">
                  Полный контроль над стоимостью занятий и гибкая система оплаты.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-center mb-4">
                  <Clock className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Гибкий график</h3>
                <p className="text-gray-600">
                  Преподавайте тогда, когда вам удобно, и столько, сколько хотите.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/register?role=tutor">Зарегистрироваться как репетитор</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">Узнать больше</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BecomeTutorPage;
