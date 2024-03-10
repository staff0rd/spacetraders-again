import { DefaultApiFactory } from '../api'
import { program } from 'commander'
import { faker } from '@faker-js/faker'
import winston from 'winston'
import { leaderboards } from './leaderboards'
import { print } from './print'
import dotenv from 'dotenv'
import { setupQueues } from './queue'

dotenv.config()

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  )
}

program
  .command('start')
  .description('Start runner')
  .action(async () => {
    setupQueues()
    await new Promise(() => {})
  })

program
  .command('leaderboards')
  .description('Display leaderboards')
  .action(async () => {
    await leaderboards()
  })

program
  .command('new-agent')
  .description('Create a new agent')
  .action(async () => {
    const symbol = `${faker.hacker.noun()}§`
    try {
      const result = await DefaultApiFactory().register({ faction: 'COSMIC', symbol })

      print(result.data.data)
    } catch (e) {
      logger.error(`Failed with ${e.code}`, e.data, e)
    }
  })

program.name('spacetraders').parse()
