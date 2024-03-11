import { faker } from '@faker-js/faker'
import { program } from 'commander'

import { DefaultApiFactory } from '../api'
import { leaderboards } from './leaderboards'
import { logger } from './logging/configure-logging'
import { logError } from './logging/log-error'
import { setupQueues } from './queue'
logger.info('Application startup')

program
  .command('start')
  .description('Start runner')
  .action(async () => {
    logger.info('Starting runner')
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
      logger.info('Registering')
      const result = await DefaultApiFactory().register({ faction: 'COSMIC', symbol })
      logger.info('Succesfully registered', result.data.data)
    } catch (err) {
      logError(err)
      throw err
    }
  })

program.name('spacetraders').parse()
