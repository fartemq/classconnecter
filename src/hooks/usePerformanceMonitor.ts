
import { useEffect, useState } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  isSlowConnection: boolean;
  memoryUsage?: number;
}

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    isSlowConnection: false
  });

  useEffect(() => {
    const measurePerformance = () => {
      // Измеряем время загрузки страницы
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

      // Определяем медленное соединение
      const connection = (navigator as any).connection;
      const isSlowConnection = connection ? 
        connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g' : 
        false;

      // Измеряем использование памяти (если доступно)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize : undefined;

      setMetrics({
        loadTime,
        renderTime: performance.now(),
        isSlowConnection,
        memoryUsage
      });
    };

    // Измеряем после загрузки страницы
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  const logSlowOperation = (operationName: string, duration: number) => {
    if (duration > 1000) { // Если операция заняла более 1 секунды
      console.warn(`Медленная операция: ${operationName} заняла ${duration}мс`);
    }
  };

  const measureOperation = async <T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      logSlowOperation(operationName, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`Ошибка в операции ${operationName} после ${duration}мс:`, error);
      throw error;
    }
  };

  return {
    metrics,
    logSlowOperation,
    measureOperation
  };
};
