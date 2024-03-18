import { SeqTransport } from '@datalust/winston-seq'
import chalk from 'chalk'
import winston from 'winston'
import { getConfig } from '../config'

const config = getConfig()

const consoleFormat = winston.format.printf(({ message, timestamp, category, level }) => {
  const levelUpper = level.toUpperCase()
  switch (levelUpper) {
    case 'INFO':
      level = chalk.green(level)
      break

    case 'WARN':
      level = chalk.yellow(level)
      break

    case 'ERROR':
      level = chalk.red(level)
      break

    default:
      break
  }
  return `${timestamp} ${level} ${chalk.grey(category)} ${message}`
})

const format = winston.format.combine(
  /* This is required to get errors to log with stack traces. See https://github.com/winstonjs/winston/issues/1498 */
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.prettyPrint(),
  winston.format.label(),
)

const logger = winston.createLogger({
  level: 'info',
  format,
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new SeqTransport({
      serverUrl: `http://${config.logging.host}:5341`,
      //apiKey: 'your-api-key',
      onError: (e) => {
        // eslint-disable-next-line no-console
        console.error(e)
      },
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
})

export const log = {
  info: (category: string, message: string, meta?: object) => logger.info(message, { ...meta, category }),
  warn: (category: string, message: string, meta?: object) => logger.warn(message, { ...meta, category }),
  error: (category: string, message: string, meta?: object) => logger.error(message, { ...meta, category }),
}
