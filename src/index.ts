import { faker } from '@faker-js/faker'
import { program } from 'commander'

import { DefaultApiFactory } from '../api'
import { leaderboards } from './leaderboards'
import { log } from './logging/configure-logging'
import { logError } from './logging/log-error'
import { setupQueues } from './queue/configure-queues'
log.info('app', 'Startup')

program
  .command('start')
  .description('Start runner')
  .action(async () => {
    log.info('app', 'Starting runner')
    setupQueues()
    await new Promise(() => {})
  })

program
  .command('leaderboards')
  .description('Display leaderboards')
  .action(async () => {
    await leaderboards('leaderboards-command')
  })

program
  .command('new-agent')
  .description('Create a new agent')
  .action(async () => {
    const symbol = `${faker.hacker.noun()}§`

    const label = 'new-agent'
    try {
      log.info(label, 'Registering')
      const result = await DefaultApiFactory().register({ faction: 'COSMIC', symbol })
      log.info(label, JSON.stringify(result.data.data))
    } catch (err) {
      logError(label, err)
      throw err
    }
  })

program.name('spacetraders').parse()
