
import React from "react";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("bg-gray-100 border-t border-gray-200", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-3">
          <div className="mb-2 md:mb-0">
            <h3 className="text-sm font-semibold text-gray-800">Stud.rep</h3>
            <p className="text-xs text-gray-600">Платформа для поиска репетиторов</p>
          </div>
          
          <div className="flex space-x-6">
            <div>
              <h4 className="text-xs font-semibold text-gray-800 mb-1">Компания</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><a href="/about" className="hover:text-primary">О нас</a></li>
                <li><a href="#" className="hover:text-primary">Контакты</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-xs font-semibold text-gray-800 mb-1">Поддержка</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><a href="#" className="hover:text-primary">Помощь</a></li>
                <li><a href="#" className="hover:text-primary">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-gray-200 text-center text-xs text-gray-600 pb-1">
          <p>© {new Date().getFullYear()} Stud.rep. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};
