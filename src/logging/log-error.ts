import { AxiosError } from 'axios'
import { log } from './configure-logging'

export const logError = async (label: string, err: unknown) => {
  if (err instanceof AxiosError) {
    const message = err.response?.data?.error?.message
    if (message) {
      log.error(label, `${message}`, { code: err.code, message, response: err.message, err })
    } else log.error(label, `Failed with ${err.code}, ${err.message}`, { err })
  } else if (err instanceof Error) {
    log.error(label, `Failed with ${err.message}`, { err })
  } else log.error(label, 'Unknown error', { err })
}
