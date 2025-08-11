import { createLogger, format, transports } from 'winston';
import path from 'path';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'your-service-name' },
  transports: [
    new transports.File({ filename: path.join(__dirname, 'combined.log') }),
    new transports.Console({ format: format.simple() }),
  ],
});

export default logger;
