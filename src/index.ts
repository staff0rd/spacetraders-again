import { faker } from '@faker-js/faker'
import { program } from 'commander'
import { DefaultApiFactory } from '../api'
import { getStatus } from './features/status/get-status'
import { startup } from './features/status/startup'
import { log } from './logging/configure-logging'
import { logError } from './logging/log-error'
import { setupQueues } from './queue/configure-queues'

log.info('app', 'Startup')

program
  .command('start')
  .description('Start runner')
  .action(async () => {
    try {
      log.info('app', 'Starting runner')
      await setupQueues()
      await startup()
    } catch (err) {
      logError('startup', err)
    }
  })

program
  .command('status')
  .description('Get status')
  .action(async () => {
    try {
      await getStatus('status-command')
    } catch (err) {
      logError('status', err)
      throw err
    }
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
