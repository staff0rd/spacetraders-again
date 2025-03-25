import { GlobalApiFactory } from '../../api/api'
import { log } from '../../logging/configure-logging'
import { flushWrites, writeMostCredits, writeMostSubmittedCharts, writeStats } from '../timeseries/postgresWrite'

export async function getStatus() {
  // todo: use rate limited api
  const result = await GlobalApiFactory().getStatus()

  const resetDate = result.data.resetDate

  writeStats(
    {
      agents: result.data.stats.agents,
      ships: result.data.stats.ships,
      systems: result.data.stats.systems,
      waypoints: result.data.stats.waypoints,
    },
    resetDate,
  )

  result.data.leaderboards.mostCredits.forEach((x) => {
    writeMostCredits(x.agentSymbol, x.credits, resetDate)
  })

  result.data.leaderboards.mostSubmittedCharts.forEach((x) => {
    writeMostSubmittedCharts(x.agentSymbol, x.chartCount, resetDate)
  })

  await flushWrites()

  log.info('stats', 'Wrote stats')
}
