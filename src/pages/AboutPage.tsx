
import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const AboutPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real application, this would send data to a backend
    setTimeout(() => {
      toast({
        title: "Сообщение отправлено",
        description: "Спасибо за ваше сообщение. Мы свяжемся с вами в ближайшее время.",
      });
      
      setFormData({
        name: "",
        email: "",
        message: ""
      });
      
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-12">О Stud.rep</h1>
          
          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Наша миссия</h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl">
              Миссия Stud.rep — сделать образование доступным и удобным для каждого. 
              Мы стремимся создать платформу, где ученики легко найдут подходящих 
              репетиторов, а преподаватели смогут эффективно управлять своим расписанием 
              и привлекать новых учеников. Мы верим, что качественное образование должно 
              быть доступно всем, независимо от места проживания или финансовых возможностей.
            </p>
          </section>
          
          {/* Team Section */}
          <section className="mb-16 bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Наша команда</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 mx-auto"></div>
                <h3 className="text-lg font-medium text-center">Алексей Петров</h3>
                <p className="text-gray-600 text-center">Основатель и CEO</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 mx-auto"></div>
                <h3 className="text-lg font-medium text-center">Мария Иванова</h3>
                <p className="text-gray-600 text-center">Технический директор</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-20 h-20 bg-gray-200 rounded-full mb-4 mx-auto"></div>
                <h3 className="text-lg font-medium text-center">Дмитрий Сидоров</h3>
                <p className="text-gray-600 text-center">Руководитель отдела развития</p>
              </div>
            </div>
          </section>
          
          {/* Why Us Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Почему мы?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-medium mb-2">Для учеников</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>Удобный поиск репетиторов по предметам и уровню подготовки</li>
                  <li>Прозрачная система рейтингов и отзывов</li>
                  <li>Интегрированные инструменты для организации занятий</li>
                  <li>Безопасная система оплаты</li>
                </ul>
              </div>
              <div className="border-l-4 border-primary pl-6">
                <h3 className="text-xl font-medium mb-2">Для репетиторов</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>Эффективная система поиска учеников</li>
                  <li>Удобное управление расписанием</li>
                  <li>Инструменты для ведения занятий онлайн</li>
                  <li>Автоматизация финансовых расчетов</li>
                </ul>
              </div>
            </div>
          </section>
          
          {/* Contact Section */}
          <section className="mb-16 bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Связаться с нами</h2>
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/3">
                <h3 className="text-xl font-medium mb-3">Контактная информация</h3>
                <p className="mb-2">Email: contact@stud-rep.com</p>
                <p className="mb-2">Телефон: +7 (123) 456-7890</p>
                <p>Адрес: г. Москва, ул. Академика Королева, 12</p>
              </div>
              <div className="lg:w-2/3">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Имя
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Ваше имя"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="example@mail.com"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Сообщение
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Ваше сообщение"
                      className="w-full min-h-[150px]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? "Отправка..." : "Отправить сообщение"}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
