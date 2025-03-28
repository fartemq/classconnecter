
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Stud.rep</h3>
            <p className="text-gray-400">
              Платформа для поиска репетиторов и организации занятий для школьников, студентов и взрослых.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white">Главная</Link></li>
              <li><Link to="/tutors" className="text-gray-400 hover:text-white">Репетиторы</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white">О нас</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Контакты</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Для пользователей</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-gray-400 hover:text-white">Вход</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-white">Регистрация</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white">Часто задаваемые вопросы</Link></li>
              <li><Link to="/support" className="text-gray-400 hover:text-white">Поддержка</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Email: info@stud.rep</li>
              <li>Телефон: +7 (999) 123-45-67</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Stud.rep. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};
