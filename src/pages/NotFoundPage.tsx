
import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Search, ArrowLeft, BookOpen, Users } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const suggestions = [
    {
      icon: <Home className="w-5 h-5" />,
      title: "Главная страница",
      description: "Вернуться на главную страницу платформы",
      action: () => navigate("/")
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Найти репетитора",
      description: "Поиск квалифицированных репетиторов",
      action: () => navigate("/tutors")
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Предметы",
      description: "Просмотр доступных предметов",
      action: () => navigate("/subjects")
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "О нас",
      description: "Узнать больше о платформе",
      action: () => navigate("/about")
    }
  ];

  React.useEffect(() => {
    // Логирование 404 ошибок для аналитики
    console.warn(`404 Error: Page not found - ${window.location.pathname}`);
    
    // В production можно отправить в систему аналитики
    if (process.env.NODE_ENV === 'production') {
      // Analytics tracking code here
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          {/* 404 Иллюстрация */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-blue-600 mb-4 select-none">
              404
            </div>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Основное сообщение */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Страница не найдена
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              К сожалению, запрашиваемая страница не существует или была перемещена.
              Возможно, в URL есть опечатка?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </button>
              
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                На главную
              </button>
            </div>
          </div>

          {/* Предложения */}
          <div className="text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Может быть, вас заинтересует:
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={suggestion.action}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
                      {suggestion.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {suggestion.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {suggestion.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Дополнительная помощь */}
          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">
              Нужна помощь?
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Если вы считаете, что это ошибка, или не можете найти нужную информацию,
              свяжитесь с нашей службой поддержки.
            </p>
            <button
              onClick={() => navigate("/support")}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
            >
              Связаться с поддержкой
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFoundPage;
