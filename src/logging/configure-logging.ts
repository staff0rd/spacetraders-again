import { SeqTransport } from '@datalust/winston-seq'
import chalk from 'chalk'
import dotenv from 'dotenv'
import winston from 'winston'
import { getConfig } from '../config'

dotenv.config()
const config = getConfig()

const consoleFormat = winston.format.printf(({ level, message, timestamp }) => {
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
  return `[${timestamp}] ${level} ${message}`
})

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    /* This is required to get errors to log with stack traces. See https://github.com/winstonjs/winston/issues/1498 */
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
  ),
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
