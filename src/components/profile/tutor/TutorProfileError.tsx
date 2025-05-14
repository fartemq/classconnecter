
import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface TutorProfileErrorProps {
  error: string;
}

export const TutorProfileError: React.FC<TutorProfileErrorProps> = ({ error }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600">Ошибка загрузки профиля</h2>
          <p className="text-gray-600 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Обновить страницу
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
};
