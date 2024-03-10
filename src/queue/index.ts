import { Queue, Worker } from 'bullmq'
import { print } from '../print'
import IORedis from 'ioredis'
import { leaderboards } from '../leaderboards'
import chalk from 'chalk'
import { configureDashboard } from './configure-dashboard'

const connection = new IORedis('', { maxRetriesPerRequest: null })

export const setupQueues = async () => {
  const leaderboardsQueue = new Queue('leaderboards', { connection })

  configureDashboard([leaderboardsQueue])

  const jobs = await leaderboardsQueue.getJobs()
  if (jobs.length == 0) {
    await leaderboardsQueue.add('leaderboards', null, { repeat: { pattern: '*/5 * * * *' } })
  }

  const worker = new Worker<null>(
    'leaderboards',
    async () => {
      await leaderboards()
    },
    { connection },
  )

  if (worker.isRunning()) {
    print(chalk.green('Leaderboards worker is running'))
  } else {
    worker.run()
    print(chalk.yellow('Started leaderboards worker'))
  }
}
