
import React from "react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("bg-gray-100 py-8 border-t border-gray-200", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stud.rep</h3>
            <p className="text-sm text-gray-600">Платформа для поиска репетиторов</p>
          </div>
          
          <div className="flex space-x-8">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Компания</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><a href="/about" className="hover:text-primary">О нас</a></li>
                <li><a href="#" className="hover:text-primary">Контакты</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Поддержка</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><a href="#" className="hover:text-primary">Помощь</a></li>
                <li><a href="#" className="hover:text-primary">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Stud.rep. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};
