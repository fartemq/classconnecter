
import React, { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { RotateCcw, AlertCircle } from "lucide-react";

interface EnhancedLoadingScreenProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({ 
  message = "Загрузка...",
  timeout = 10000,
  onTimeout,
  onRetry,
  showRetry = false
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const timer = setInterval(() => {
      const currentElapsed = Date.now() - startTime;
      setElapsed(currentElapsed);
      
      if (currentElapsed >= timeout) {
        setIsTimedOut(true);
        onTimeout?.();
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [timeout, onTimeout]);

  const progress = Math.min((elapsed / timeout) * 100, 100);

  if (isTimedOut) {
    return (
      <div className="text-center p-6">
        <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Загрузка занимает слишком много времени</h3>
        <p className="text-gray-600 mb-4">
          Возможно, проблемы с подключением или сервисом
        </p>
        {(onRetry || showRetry) && (
          <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Попробовать снова
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center p-6">
      <Loader size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
      
      {/* Прогресс-бар */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-xs mx-auto">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        {Math.round(elapsed / 1000)}с / {Math.round(timeout / 1000)}с
      </p>
    </div>
  );
};
