import { AxiosError } from 'axios'
import { logger } from './configure-logging'

export const logError = async (err: unknown) => {
  if (err instanceof AxiosError) {
    logger.error(`Failed with ${err.code}, ${err.message}`, err)
  }
  if (err instanceof Error) {
    logger.error(`Failed with ${err.message}`, err)
  }
  logger.error('Unknown error', err)
}
