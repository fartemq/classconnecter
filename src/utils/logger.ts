
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createLogEntry(level: LogLevel, message: string, context?: string, data?: any): LogEntry {
    return {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString()
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  debug(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry('debug', message, context, data);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${context ? `[${context}] ` : ''}${message}`, data);
    }
  }

  info(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry('info', message, context, data);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.info(`[INFO] ${context ? `[${context}] ` : ''}${message}`, data);
    }
  }

  warn(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry('warn', message, context, data);
    this.addLog(entry);
    
    console.warn(`[WARN] ${context ? `[${context}] ` : ''}${message}`, data);
  }

  error(message: string, context?: string, data?: any): void {
    const entry = this.createLogEntry('error', message, context, data);
    this.addLog(entry);
    
    console.error(`[ERROR] ${context ? `[${context}] ` : ''}${message}`, data);
  }

  getLogs(level?: LogLevel): LogEntry[] {
    if (!level) return this.logs;
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new Logger();

// Global error handler
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', 'global', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', 'global', {
    reason: event.reason
  });
});
