import { inject, Injectable } from '@angular/core';
import { EnvService } from '../envService/env.service';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private envService = inject(EnvService);
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = this.envService.isDevelopment;
  }

  private format(level: LogLevel, message: string, ...optionalParams: unknown[]) {
    const time = new Date().toISOString();
    let color: string;

    switch (level) {
      case LogLevel.DEBUG:
        color = 'color: #3CC5FFFF';
        break;
      case LogLevel.INFO:
        color = 'color: #2172F3FF';
        break;
      case LogLevel.WARN:
        color = 'color: #FF9800';
        break;
      case LogLevel.ERROR:
        color = 'color: #F44336';
        break;
      default:
        color = 'color: inherit';
    }

    return [`%c[${level}] [${time}] - ${message}`, color, ...optionalParams];
  }

  debug(message: string, ...optionalParams: unknown[]) {
    if (this.isDevelopment)
      console.debug(...this.format(LogLevel.DEBUG, message, ...optionalParams));
  }

  info(message: string, ...optionalParams: unknown[]) {
    if (this.isDevelopment) console.info(...this.format(LogLevel.INFO, message, ...optionalParams));
  }

  warn(message: string, ...optionalParams: unknown[]) {
    if (this.isDevelopment) console.warn(...this.format(LogLevel.WARN, message, ...optionalParams));
  }

  error(message: string, ...optionalParams: unknown[]) {
    if (this.isDevelopment)
      console.error(...this.format(LogLevel.ERROR, message, ...optionalParams));
  }
}
