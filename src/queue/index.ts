import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { getConfig } from '../config'
import { leaderboards } from '../leaderboards'
import { logger } from '../logging/configure-logging'
import { logError } from '../logging/log-error'
import { configureDashboard } from './configure-dashboard'

export const setupQueues = async () => {
  const config = getConfig()
  const connection = new IORedis(6379, config.redis.host, { maxRetriesPerRequest: null })

  const leaderboardsQueue = new Queue('leaderboards', { connection })

  configureDashboard([leaderboardsQueue])

  const jobs = await leaderboardsQueue.getJobs()
  if (jobs.length == 0) {
    await leaderboardsQueue.add('leaderboards', null, { repeat: { pattern: '*/5 * * * *' } })
  }

  const worker = new Worker<null>(
    'leaderboards',
    async () => {
      try {
        await leaderboards()
      } catch (err) {
        logError(err)
        throw err
      }
    },
    { connection },
  )

  if (worker.isRunning()) {
    logger.info('Leaderboards worker is running')
  } else {
    worker.run()
    logger.info('Started leaderboards worker')
  }
}
