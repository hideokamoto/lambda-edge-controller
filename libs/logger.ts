
import bunyan from 'bunyan'
import BunyanFormat from 'bunyan-format'
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export const getLogger = (appName: string): bunyan => {
  return bunyan.createLogger({
    name: appName,
    level: 'debug',
    stream: new BunyanFormat({ outputMode: 'bunyan', levelInString: true })
  })
}

export class Logger {
  private static getLogger (appName: string): bunyan {
    return getLogger(appName)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static record (appName: string, level: LogLevel, message: string, ...args: any[]): void {
    switch (level) {
      case 'trace':
        return this.trace(appName, message, args)
      case 'debug':
        return this.debug(appName, message, args)
      case 'info':
        return this.info(appName, message, args)
      case 'warn':
        return this.warn(appName, message, args)
      case 'error':
        return this.error(appName, message, args)
      case 'fatal':
        return this.fatal(appName, message, args)
      default:
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static trace (appName: string, message: string, ...args: any[]): void {
    const logger = this.getLogger(appName)
    logger.trace(message, args)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static debug (appName: string, message: string, ...args: any[]): void {
    const logger = this.getLogger(appName)
    logger.debug(message, args)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static info (appName: string, message: string, ...args: any[]): void {
    const logger = this.getLogger(appName)
    logger.info(message, args)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static warn (appName: string, message: string, ...args: any[]): void {
    const logger = this.getLogger(appName)
    logger.warn(message, args)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static error (appName: string, message: string, ...args: any[]): void {
    const logger = this.getLogger(appName)
    logger.error(message, args)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static fatal (appName: string, message: string, ...args: any[]): void {
    const logger = this.getLogger(appName)
    logger.fatal(message, args)
  }
}
