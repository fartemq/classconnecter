
// Утилиты для мониторинга и оптимизации производительности

export const performanceUtils = {
  // Измерение времени выполнения функции
  measureTime: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ ${name} failed after ${(end - start).toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Debounce для предотвращения частых вызовов
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle для ограничения частоты вызовов
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Проверка поддержки веб-технологий
  checkSupport: () => {
    return {
      webp: (() => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      })(),
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch {
          return false;
        }
      })(),
      webgl: (() => {
        try {
          const canvas = document.createElement('canvas');
          return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch {
          return false;
        }
      })(),
      intersectionObserver: 'IntersectionObserver' in window
    };
  },

  // Мониторинг использования памяти
  getMemoryInfo: () => {
    const memory = (performance as any).memory;
    if (!memory) return null;

    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    };
  },

  // Оптимизация изображений
  optimizeImage: (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve as BlobCallback, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // Предзагрузка критических ресурсов
  preloadResources: (urls: string[]) => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  // Проверка качества соединения
  getConnectionInfo: () => {
    const connection = (navigator as any).connection;
    if (!connection) return null;

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  },

  // Базовый мониторинг Core Web Vitals
  measureCoreWebVitals: () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      // First Contentful Paint
      fcp: navigation.responseEnd - navigation.fetchStart,
      // Largest Contentful Paint (приблизительно)
      lcp: navigation.loadEventEnd - navigation.fetchStart,
      // Time to First Byte
      ttfb: navigation.responseStart - navigation.requestStart,
      // DOM Content Loaded
      dcl: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
    };
  }
};

// Автоматический мониторинг производительности
export const startPerformanceMonitoring = () => {
  // Базовый мониторинг Core Web Vitals
  setTimeout(() => {
    const vitals = performanceUtils.measureCoreWebVitals();
    console.log('📊 Core Web Vitals:', vitals);
  }, 1000);

  // Предупреждение о высоком использовании памяти
  setInterval(() => {
    const memory = performanceUtils.getMemoryInfo();
    if (memory && memory.percentage > 80) {
      console.warn(`🚨 Высокое использование памяти: ${memory.used}MB (${memory.percentage}%)`);
    }
  }, 30000);

  // Мониторинг медленных операций
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 100) {
            console.warn(`🐌 Медленная операция: ${entry.name} - ${entry.duration.toFixed(2)}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });
    } catch (error) {
      console.warn('Performance Observer не поддерживается', error);
    }
  }
};
