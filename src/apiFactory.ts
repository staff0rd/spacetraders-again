import { retryable } from 'async'
import Bottleneck from 'bottleneck'
import { promisify } from 'es6-promisify'
import {
  AgentsApiFactory,
  Configuration,
  ContractsApiFactory,
  DefaultApiFactory,
  FactionsApiFactory,
  FleetApiFactory,
  SystemsApiFactory,
} from './api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrapFunctions = (api: any, limiter: Bottleneck) =>
  Object.entries(api).reduce((acc, [key, value]) => {
    if (typeof value === 'function') {
      // @ts-expect-error ignore
      const myWrapper = async (...args) => {
        console.log('scheduling', value.name)
        // @ts-expect-error ignore
        return limiter.schedule(value, ...args)
      }

      // @ts-expect-error ignore
      acc[key] = promisify(
        retryable(
          {
            times: 10,
            errorFilter(error) {
              return error.response.status === 429
            },
          },
          myWrapper,
        ),
      )
    }
    return acc
  }, {})

export const loggedOutApiFactory = (): {
  default: ReturnType<typeof DefaultApiFactory>
  limiter: Bottleneck
  loggedIn: false
} => {
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 500,
  })
  const defaultApi = DefaultApiFactory()
  return {
    limiter,
    // @ts-expect-error ignore
    default: wrapFunctions(defaultApi, limiter),
    loggedIn: false,
  }
}

export const apiFactory = (
  accessToken: string,
): {
  systems: ReturnType<typeof SystemsApiFactory>
  fleet: ReturnType<typeof FleetApiFactory>
  contracts: ReturnType<typeof ContractsApiFactory>
  default: ReturnType<typeof DefaultApiFactory>
  agents: ReturnType<typeof AgentsApiFactory>
  factions: ReturnType<typeof FactionsApiFactory>
  limiter: Bottleneck
  loggedIn: true
} => {
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 500,
  })
  const systemsApi = SystemsApiFactory(new Configuration({ accessToken }))
  const fleetApi = FleetApiFactory(new Configuration({ accessToken }))
  const contractsApi = ContractsApiFactory(new Configuration({ accessToken }))
  const agentsApi = AgentsApiFactory(new Configuration({ accessToken }))
  const defaultApi = DefaultApiFactory()
  const factionsApi = FactionsApiFactory(new Configuration({ accessToken }))
  return {
    limiter,
    // @ts-expect-error ignore
    systems: wrapFunctions(systemsApi, limiter),
    // @ts-expect-error ignore
    fleet: wrapFunctions(fleetApi, limiter),
    // @ts-expect-error ignore
    contracts: wrapFunctions(contractsApi, limiter),
    // @ts-expect-error ignore
    default: wrapFunctions(defaultApi, limiter),
    // @ts-expect-error ignore
    agents: wrapFunctions(agentsApi, limiter),
    // @ts-expect-error ignore
    factions: wrapFunctions(factionsApi, limiter),
    loggedIn: true,
  }
}
