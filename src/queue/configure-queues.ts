import { Queue, Worker } from 'bullmq'
import { formatDistance } from 'date-fns'
import IORedis from 'ioredis'
import { getConfig } from '../config'
import { leaderboards } from '../leaderboards'
import { log } from '../logging/configure-logging'
import { logError } from '../logging/log-error'
import { configureDashboard } from './configure-dashboard'

const category = 'workers'

export const addRepeatableJob = async (queue: Queue, name: string, pattern: string) => {
  const jobs = await queue.getRepeatableJobs()
  const invalidJobs = jobs.filter((x) => x.name === name && x.pattern !== pattern)
  invalidJobs.forEach(async (job) => {
    log.warn(category, `Removing invalid job: ${job.name}, ${job.pattern}`)
    await queue.removeRepeatableByKey(job.key)
  })
  queue.add(name, null, { repeat: { pattern } })
}

export const setupQueues = async () => {
  const config = getConfig()
  const connection = new IORedis(6379, config.redis.host, { maxRetriesPerRequest: null })

  const queue = new Queue('leaderboards', { connection })

  await addRepeatableJob(queue, 'leaderboards', '*/10 * * * *')

  const jobs = await queue.getRepeatableJobs()
  jobs.forEach((job) => {
    log.info(category, `Job: ${job.key}, ${formatDistance(new Date(job.next), new Date(), { addSuffix: true })}`)
  })

  await queue.drain()

  const worker = new Worker<null>(
    'leaderboards',
    async () => {
      try {
        log.info('leaderboards-worker', 'Starting job')
        await leaderboards('leaderboards-worker')
      } catch (err) {
        logError('leaderboards-worker', err)
        throw err
      }
    },
    { connection },
  )

  if (!worker.isRunning()) {
    worker.run()
    log.warn('leaderboards-worker', 'Started leaderboards worker')
  }

  configureDashboard([queue])
}
