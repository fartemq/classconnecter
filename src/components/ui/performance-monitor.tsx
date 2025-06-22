
import React, { useState, useEffect } from "react";
import { performanceUtils } from "@/utils/performance";

interface PerformanceMonitorProps {
  showInProduction?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showInProduction = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState({
    memory: null as ReturnType<typeof performanceUtils.getMemoryInfo>,
    connection: null as ReturnType<typeof performanceUtils.getConnectionInfo>,
    support: performanceUtils.checkSupport()
  });

  useEffect(() => {
    // Показывать только в development или если явно разрешено
    if (process.env.NODE_ENV !== 'development' && !showInProduction) {
      return;
    }

    const updateMetrics = () => {
      setMetrics({
        memory: performanceUtils.getMemoryInfo(),
        connection: performanceUtils.getConnectionInfo(),
        support: performanceUtils.checkSupport()
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    // Показать/скрыть по нажатию Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showInProduction, isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-50 hover:opacity-100"
          title="Performance Monitor (Ctrl+Shift+P)"
        >
          📊
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black text-white p-4 rounded-lg text-xs font-mono max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold">Performance Monitor</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {metrics.memory && (
        <div className="mb-2">
          <div className="text-green-400">Memory:</div>
          <div>Used: {metrics.memory.used}MB</div>
          <div>Total: {metrics.memory.total}MB</div>
          <div>Usage: {metrics.memory.percentage}%</div>
        </div>
      )}

      {metrics.connection && (
        <div className="mb-2">
          <div className="text-blue-400">Connection:</div>
          <div>Type: {metrics.connection.effectiveType}</div>
          <div>Speed: {metrics.connection.downlink}Mbps</div>
          <div>RTT: {metrics.connection.rtt}ms</div>
        </div>
      )}

      <div className="mb-2">
        <div className="text-yellow-400">Support:</div>
        <div>WebP: {metrics.support.webp ? '✅' : '❌'}</div>
        <div>SW: {metrics.support.serviceWorker ? '✅' : '❌'}</div>
        <div>LS: {metrics.support.localStorage ? '✅' : '❌'}</div>
        <div>WebGL: {metrics.support.webgl ? '✅' : '❌'}</div>
      </div>

      <div className="text-xs text-gray-400">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};
