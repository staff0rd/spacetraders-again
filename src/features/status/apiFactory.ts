import Bottleneck from 'bottleneck'
import { Configuration, FleetApiFactory, SystemsApiFactory } from '../../../api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapFunctions = (api: any, limiter: Bottleneck) =>
  Object.entries(api).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
      // @ts-expect-error ignore
      acc[key] = limiter.wrap(value)
    }
    return acc
  })
export const apiFactory = (
  accessToken: string,
): { systems: ReturnType<typeof SystemsApiFactory>; fleet: ReturnType<typeof FleetApiFactory> } => {
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 500,
  })
  const systemsApi = SystemsApiFactory(new Configuration({ accessToken }))
  const fleetApi = FleetApiFactory(new Configuration({ accessToken }))
  return {
    // @ts-expect-error ignore
    systems: wrapFunctions(systemsApi, limiter),
    // @ts-expect-error ignore
    fleet: wrapFunctions(fleetApi, limiter),
  }
}
