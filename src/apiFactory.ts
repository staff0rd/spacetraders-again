import Bottleneck from 'bottleneck'
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
      acc[key] = limiter.wrap(value)
    }
    return acc
  }, {})
export const apiFactory = (
  accessToken: string,
): {
  systems: ReturnType<typeof SystemsApiFactory>
  fleet: ReturnType<typeof FleetApiFactory>
  contracts: ReturnType<typeof ContractsApiFactory>
  default: ReturnType<typeof DefaultApiFactory>
  agents: ReturnType<typeof AgentsApiFactory>
  factions: ReturnType<typeof FactionsApiFactory>
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
  }
}
