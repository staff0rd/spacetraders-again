import { DefaultApiFactory } from '../api'
import { program } from 'commander'
import { faker } from '@faker-js/faker'
import chalk from 'chalk'
import winston from 'winston'
const print = console.log

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
    while (true) {
      const result = await DefaultApiFactory().getStatus()
      // eslint-disable-next-line no-console
      console.log(result.data)
      await new Promise((r) => setTimeout(r, 300_000))
    }
  })

program
  .command('leaderboards')
  .description('Display leaderboards')
  .action(async () => {
    const result = await DefaultApiFactory().getStatus()
    // eslint-disable-next-line no-console
    print(chalk.underline.inverse('Leaderboards\n'))
    print(chalk.underline('Most credits\n'))
    result.data.leaderboards.mostCredits.forEach((x, i) =>
      print(`${(i + 1 + '.').toLocaleString().padEnd(3)} ${x.credits.toLocaleString().padEnd(15)} ${x.agentSymbol}`),
    )
    print(chalk.underline('\nMost submitted charts\n'))
    result.data.leaderboards.mostSubmittedCharts.forEach((x, i) =>
      print(`${(i + 1 + '.').toLocaleString().padEnd(3)} ${x.chartCount.toLocaleString().padEnd(8)} ${x.agentSymbol}`),
    )
  })

program
  .command('new-agent')
  .description('Create a new agent')
  .action(async () => {
    const symbol = `${faker.hacker.noun()}§`
    try {
      const result = await DefaultApiFactory().register({ faction: 'COSMIC', symbol })

      console.log(result.data.data)
    } catch (e) {
      logger.error(`Failed with ${e.code}`, e.data, e)
    }
  })

program.name('spacetraders').parse()
