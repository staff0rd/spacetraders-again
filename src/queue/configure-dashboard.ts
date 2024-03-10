import { Queue } from 'bullmq'
import { print } from '../print'
import { ExpressAdapter } from '@bull-board/express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import express from 'express'
import chalk from 'chalk'

export const configureDashboard = (queues: Queue[]) => {
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/admin/queues')

  const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: queues.map((x) => new BullMQAdapter(x)),
    serverAdapter: serverAdapter,
  })

  const app = express()

  app.use('/admin/queues', serverAdapter.getRouter())

  // other configurations of your server
  app.listen(3000, () => {
    print(chalk.green('For the Queue UI, open http://localhost:3000/admin/queues'))
  })
}
