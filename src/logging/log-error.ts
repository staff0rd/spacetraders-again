import { AxiosError } from 'axios'
import { log } from './configure-logging'

export const logError = async (label: string, err: unknown) => {
  if (err instanceof AxiosError) {
    log.error(label, `Failed with ${err.code}, ${err.message}`, { error: err })
  }
  if (err instanceof Error) {
    log.error(label, `Failed with ${err.message}`, { error: err })
  }
  log.error(label, 'Unknown error', { error: err })
}
