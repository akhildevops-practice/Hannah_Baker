import { LoggerService } from '@nestjs/common';
import { createLogger, transports, format } from 'winston';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

export class CustomLogger implements LoggerService {
  private readonly logger;

  constructor() {
    // Get the log directory from process.env.LOGS
    const logDirectory = process.env.LOGS;
    const logLevel = process.env.LOG_LEVEL || 'info';

    // Ensure the log directory exists
    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }

    this.logger = createLogger({
      level: logLevel,
      transports: [
        new transports.Console(),
        new transports.File({
          filename: path.join(logDirectory, 'application.log'),
        }),
        // new transports.File({ filename: path.join(logDirectory, 'serial-number.log') }),
      ],
      format: format.combine(
        format.timestamp(),
        format.printf(
          (info) =>
            `${info.timestamp} [${info.level.toUpperCase()}] - ${info.message}`,
        ),
      ),
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }
}
