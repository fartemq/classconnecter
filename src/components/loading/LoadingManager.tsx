
import React, { useState, useEffect } from "react";

interface LoadingManagerProps {
  children: React.ReactNode;
  isLoading: boolean;
  isError?: boolean;
  maxLoadingTime?: number;
  fallbackContent?: React.ReactNode;
}

export const LoadingManager: React.FC<LoadingManagerProps> = ({
  children,
  isLoading,
  isError = false,
  maxLoadingTime = 8000, // 8 секунд максимум
  fallbackContent
}) => {
  const [showFallback, setShowFallback] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setShowFallback(false);
      setLoadingProgress(0);
      return;
    }

    // Прогресс-бар анимация
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    // Таймер для показа fallback
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true);
    }, maxLoadingTime);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fallbackTimer);
    };
  }, [isLoading, maxLoadingTime]);

  // Если ошибка или показываем fallback
  if (isError || showFallback) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isError ? "Проблема с загрузкой" : "Загрузка занимает больше времени"}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isError 
              ? "Произошла ошибка при загрузке приложения" 
              : "Мы работаем над улучшением скорости загрузки"
            }
          </p>

          {fallbackContent || (
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Попробовать снова
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Сбросить данные и перезагрузить
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Экран загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-12 h-12 mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Загрузка Stud.rep</h2>
          
          <div className="w-64 bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-500">
            Подготавливаем ваш профиль...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
