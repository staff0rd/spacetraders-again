import { Point } from '@influxdata/influxdb-client'
import { DefaultApiFactory } from '../../../api'
import { log } from '../../logging/configure-logging'
import { influxWrite } from './influxWrite'

export async function getStatus() {
  // todo: use rate limited api
  const result = await DefaultApiFactory().getStatus()

  const resetDate = result.data.resetDate

  influxWrite().writePoint(
    new Point('stats')
      .tag('reset-date', resetDate)
      .floatField('agents', result.data.stats.agents)
      .floatField('ships', result.data.stats.ships)
      .floatField('systems', result.data.stats.systems)
      .floatField('waypoints', result.data.stats.waypoints),
  )

  result.data.leaderboards.mostCredits.forEach((x) => {
    influxWrite().writePoint(
      new Point('most-credits').tag('agent', x.agentSymbol).tag('reset-date', resetDate).floatField('credits', x.credits),
    )
  })

  result.data.leaderboards.mostSubmittedCharts.forEach((x) => {
    influxWrite().writePoint(
      new Point('most-submitted-charts').tag('agent', x.agentSymbol).tag('reset-date', resetDate).floatField('chart-count', x.chartCount),
    )
  })

  await influxWrite().flush()

  log.info('stats', 'Wrote stats')
}
