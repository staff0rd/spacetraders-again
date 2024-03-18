import { Status } from '../features/status/status.entity'
import { getEntityManager } from '../orm'

export const findOrCreateStatus = async (resetDate: string) => {
  const em = getEntityManager()
  const status = await em.findOne(Status, { id: 1 })
  if (!status) {
    const newStatus = new Status(resetDate)
    await em.persistAndFlush(newStatus)
    return newStatus
  }

  if (status.resetDate !== resetDate) {
    throw new Error('Reset date has changed')
  }
}
